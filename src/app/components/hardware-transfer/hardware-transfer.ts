import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HardwareService } from '../../services/hardware.service';
import { HardwareStore } from '../../store/hardware.store';
import { TagDto } from '../../interfaces/tag.dto';
import { ImportTemplate } from '../../interfaces/importResponse.type';

import { DocumentFilePicker } from '../document-file-picker/document-file-picker';

type ExportFormat = 'photo-report' | 'technical-memory' | 'qr-codes' | 'xls';

@Component({
  selector: 'app-hardware-transfer',
  imports: [FormsModule, NzButtonModule, NzDropdownModule, NzMenuModule, NzIconDirective, NzModalModule, NzSelectModule, DocumentFilePicker],
  templateUrl: './hardware-transfer.html',
  styleUrl: './hardware-transfer.css',
})
export class HardwareTransfer {
  clientId = input.required<number>();
  sites = input<TagDto[]>([]);
  sitesLoading = input(false);
  initialSiteId = input<number | null>(null);
  imported = output<number>();
  private api = inject(HardwareService);
  private store = inject(HardwareStore);
  private notification = inject(NzNotificationService);
  private destroyRef = inject(DestroyRef);
  readonly formats: {value: ExportFormat; label: string}[] = [
    {value: 'photo-report', label: 'Photo report'},
    {value: 'technical-memory', label: 'Technical memory'},
    {value: 'qr-codes', label: 'QR codes'},
    {value: 'xls', label: 'XLS document'},
  ];
  exportOpen = signal(false);
  importOpen = signal(false);
  exportFormat = signal<ExportFormat>('photo-report');
  exportSiteId = signal(0);
  importSiteId = signal<number | null>(null);
  importFile = signal<File | null>(null);
  exporting = signal(false);
  importing = signal(false);
  templateLoading = signal(false);
  result = signal<ImportTemplate | null>(null);

  openExport(format: ExportFormat = 'photo-report') {
    this.exportFormat.set(format);
    this.exportSiteId.set(this.initialSiteId() ?? 0);
    this.exportOpen.set(true);
  }
  exportHardware() {
    if (this.exporting() || this.sitesLoading()) return;
    this.exporting.set(true);
    const tagId = this.exportSiteId() === 0 ? null : this.exportSiteId();
    this.api.exportClientHardware(this.clientId(), this.exportFormat(), tagId).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.exporting.set(false)),
    ).subscribe({
      next: (response) => {
        if (response.body) this.store.downloadFromBlob(response.body, this.store.getFileNameFromHeader(response));
        this.exportOpen.set(false);
      },
      error: (error) => this.showError('Export failed', error),
    });
  }
  downloadTemplate() {
    if (this.templateLoading()) return;
    this.templateLoading.set(true);
    this.api.getClientImportTemplate(this.clientId()).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.templateLoading.set(false)),
    ).subscribe({
      next: (response) => {
        if (response.body) this.store.downloadFromBlob(response.body, this.store.getFileNameFromHeader(response));
      },
      error: (error) => this.showError('Template could not be downloaded', error),
    });
  }
  openImport() {
    this.importSiteId.set(this.initialSiteId());
    this.importFile.set(null);
    this.importOpen.set(true);
  }
  importCameras() {
    const tagId = this.importSiteId();
    const file = this.importFile();
    if (tagId === null || !file || this.importing() || this.sitesLoading()) return;
    this.importing.set(true);
    this.api.importClientCameras(this.clientId(), tagId, file).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.importing.set(false)),
    ).subscribe({
      next: (result) => {
        this.importOpen.set(false);
        this.result.set(result);
        this.imported.emit(tagId);
      },
      error: (error) => this.showError('Import failed', error),
    });
  }
  private async showError(title: string, error: any) {
    let message = error.error?.message;
    if (error.error instanceof Blob) {
      try { message = JSON.parse(await error.error.text()).message; } catch { /* Use the fallback below. */ }
    }
    this.notification.error(title, message ?? 'Please try again.');
  }
}
