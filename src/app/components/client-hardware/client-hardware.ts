import { RelatedEquipmentPicker } from '../related-equipment-picker/related-equipment-picker';
import { HardwareTypeFilter } from '../hardware-type-filter/hardware-type-filter';
import { HardwareTransfer } from '../hardware-transfer/hardware-transfer';
import { HardwareService } from '../../services/hardware.service';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UiTag } from '../ui-tag/ui-tag';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { EditSideBar } from '../edit-side-bar/edit-side-bar';
import { ComputerForm } from '../forms/computer-form/computer-form';
import { CameraForm } from '../forms/camera-form/camera-form.component';
import { HardwareStore } from '../../store/hardware.store';
import { SidebarStore } from '../../store/sidebar.store';
import { TagStore } from '../../store/tag.store';
import { ListPagination } from '../list-pagination/list-pagination';
@Component({
  selector: 'app-client-hardware',
  imports: [
    RelatedEquipmentPicker,
    RouterLink,
    HardwareTransfer,
    HardwareTypeFilter,
    NzModalModule,
    UiTag,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzIconDirective,
    EditSideBar,
    CameraForm,
    ComputerForm,
    ListPagination,
  ],
  templateUrl: './client-hardware.html',
  styleUrl: './client-hardware.css',
  providers: [HardwareStore, SidebarStore, TagStore],
})
export class ClientHardware {
  clientId = input.required<number>();
  revision = input(0);
  projectId = input<number | null>(null);
  private api = inject(HardwareService);
  private notification = inject(NzNotificationService);
  private destroyRef = inject(DestroyRef);
  computerEditor = signal<{ id: number | null } | null>(null);
  relatedEditorOpen = signal(false);
  candidatesLoading = signal(false);
  candidatesError = signal(false);
  savingRelations = signal(false);
  candidates = signal<HardwareTableDto[]>([]);
  selectedHardwareIds = signal<number[]>([]);
  protected store = inject(HardwareStore);
  protected sidebar = inject(SidebarStore);
  protected tags = inject(TagStore);
  search = signal('');
  siteFilter = signal<number | null>(null);
  typeFilter = signal<string | null>(null);
  hasFilters = computed(() => !!this.search() || this.siteFilter() !== null || this.typeFilter() !== null);
  page = signal(1);
  readonly pageSize = 12;
  filteredHardware = computed(() =>
    this.store
      .hardwareList()
      .filter(
        (hardware) =>
          (this.typeFilter() === null || hardware.type === this.typeFilter()) &&
          (this.siteFilter() === null || hardware.tagId === this.siteFilter()) &&
          [hardware.name, hardware.brand, hardware.model, hardware.serialNumber, hardware.cameraId, hardware.ipAddress, hardware.macAddress, hardware.location, hardware.idf].some((value) =>
            (value ?? '').toLowerCase().includes(this.search().trim().toLowerCase()),
          ),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
  currentPage = computed(() =>
    Math.min(this.page(), Math.max(1, Math.ceil(this.filteredHardware().length / this.pageSize))),
  );
  visibleHardware = computed(() =>
    this.filteredHardware().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  constructor() {
    effect(() => {
      this.search();
      this.siteFilter();
      this.typeFilter();
      this.page.set(1);
    });
    effect((onCleanup) => {
      this.revision();
      this.store.currentClientId.set(this.projectId() === null ? this.clientId() : null);
      this.store.currentBranchId.set(this.projectId());
      this.store.hardwareList.set([]);
      const hardware = this.store.loadHardware();
      const tags = this.tags.loadTags(this.clientId()).subscribe();
      onCleanup(() => {
        hardware?.unsubscribe();
        tags.unsubscribe();
      });
    });
  }
  openRelatedEditor() {
    if (this.store.tableLoading() || this.store.loadError()) return;
    this.selectedHardwareIds.set(this.store.hardwareList().map((item) => item.id));
    this.relatedEditorOpen.set(true);
    this.loadCandidates();
  }
  loadCandidates() {
    this.candidatesLoading.set(true);
    this.candidatesError.set(false);
    this.candidates.set([]);
    this.api.getClientHardware(this.clientId()).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.candidatesLoading.set(false)),
    ).subscribe({
      next: (items) => this.candidates.set(items),
      error: () => this.candidatesError.set(true),
    });
  }
  saveRelations() {
    const projectId = this.projectId();
    if (projectId === null || this.savingRelations() || this.candidatesLoading() || this.candidatesError()) return;
    this.savingRelations.set(true);
    this.api.updateRelatedHardware(projectId, this.selectedHardwareIds()).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.savingRelations.set(false)),
    ).subscribe({
      next: (items) => {
        this.store.hardwareList.set(items);
        this.relatedEditorOpen.set(false);
      },
      error: (error) => this.notification.error('Related hardware could not be saved', error.error?.message ?? 'Please try again.'),
    });
  }
  siteColor(tagId: number) {
    return this.tags.tags().find((tag) => tag.id === tagId)?.color;
  }
  clearFilters() {
    this.search.set('');
    this.siteFilter.set(null);
    this.typeFilter.set(null);
  }
  openNew() {
    this.store.selectedHardware.set(null);
    this.store.formMode.set('add');
    this.sidebar.isOpen.set(true);
  }
  computerSaved() {
    this.computerEditor.set(null);
    this.store.loadHardware();
  }

  openEdit(hardware: HardwareTableDto) {
    if (hardware.type === 'Computer') {
      this.computerEditor.set({ id: hardware.id });
      return;
    }
    this.store.selectedHardware.set(null);
    this.store.formMode.set('edit');
    this.store.getCameraEditData(hardware.id);
    this.sidebar.isOpen.set(true);
  }
}
