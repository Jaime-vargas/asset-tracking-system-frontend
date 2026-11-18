import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { HardwareService } from '../../services/hardware.service';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { directoryClients, directorySites, groupBySite, scopeOrder, validDirectoryDate, matchesDirectorySearch } from '../../utils/directory';
import { HardwareTypeFilter } from '../../components/hardware-type-filter/hardware-type-filter';
import { DirectoryFilters } from '../../components/directory-filters/directory-filters';
import { UiIcon } from '../../components/ui-icon/ui-icon';
import { ListPagination } from '../../components/list-pagination/list-pagination';
import { UiTag } from '../../components/ui-tag/ui-tag';
@Component({
  selector: 'app-hardware-page', imports: [
    DatePipe, FormsModule, RouterLink, DirectoryFilters, HardwareTypeFilter, UiIcon, ListPagination, UiTag
  ],
  templateUrl: './hardware-page.html', styleUrls: [
    '../../styles/native-controls.css', '../../styles/directory-page.css', './hardware-page.css'
  ]
})
export class HardwarePage {
  private service = inject(HardwareService);
  private destroyRef = inject(DestroyRef);
  hardwareData = signal<HardwareTableDto[]>([]);
  loading = signal(false);
  loadError = signal(false);
  search = signal('');
  clientId = signal<number | null>(null);
  siteId = signal<number | null>(null);
  type = signal<string | null>(null);
  onlyReports = signal(false);
  sort = signal('name');
  grouped = signal(true);
  page = signal(1);
  readonly pageSize = 12;
  clients = computed(() => directoryClients(this.hardwareData()));
  sites = computed(() => directorySites(this.hardwareData(), this.clientId()));
  totals = computed(() => ({
    equipment: this.hardwareData().length, clients: this.clients().length, sites: new Set(this.hardwareData().map(item => item.tagId)).size, reports: this.hardwareData().reduce((sum, item) => sum + (item.reportsActive?.length ?? 0), 0)
  }));
  hasFilters = computed(() => !!(this.search() || this.clientId() !== null || this.siteId() !== null || this.type() || this.onlyReports()));
  filteredHardware = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.hardwareData().filter(item => (this.clientId() === null || item.clientId === this.clientId()) && (this.siteId() === null || item.tagId === this.siteId())
      && (!this.type() || item.type === this.type()) && (!this.onlyReports() || (item.reportsActive?.length ?? 0) > 0)
      && matchesDirectorySearch(query, [
        `#${item.id}`, item.name, item.type, item.brand, item.model, item.serialNumber, item.location, item.clientName, item.tagName, item.cameraId, item.ipAddress, item.macAddress, item.idf, item.lastMaintenanceDate, this.date(item.lastMaintenanceDate)?.toDateString()
      ]))
      .sort((a, b) => (this.grouped() ? scopeOrder(a, b) : 0) || (this.sort() === 'reports' ? (b.reportsActive?.length ?? 0) - (a.reportsActive?.length ?? 0) : this.sort() === 'updated' ? (this.date(b.lastMaintenanceDate)?.getTime() ?? 0) - (this.date(a.lastMaintenanceDate)?.getTime() ?? 0) : 0) || a.name.localeCompare(b.name) || a.id - b.id);
  });
  currentPage = computed(() => Math.max(1, Math.min(this.page(), Math.ceil(this.filteredHardware().length / this.pageSize))));
  groups = computed(() => groupBySite(this.filteredHardware().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize), this.grouped()));
  constructor() {
    inject(ActivatedRoute).queryParamMap.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => this.type.set(params.get('type') || null));
    effect(() => {
      this.search();
      this.clientId();
      this.siteId();
      this.type();
      this.onlyReports();
      this.sort();
      this.grouped();
      this.page.set(1);
    });
    this.getAllHardwareData();
  }
  date = validDirectoryDate;
  setClient(id: number | null) {
    this.clientId.set(id);
    this.siteId.set(null);
  }
  selectSite(client: number, id: number) {
    this.setClient(client);
    this.siteId.set(id);
  }
  clearFilters() {
    this.search.set('');
    this.setClient(null);
    this.type.set(null);
    this.onlyReports.set(false);
  }
  getAllHardwareData() {
    if (this.loading())
      return;
    this.loading.set(true);
    this.loadError.set(false);
    this.service.getAllHardware().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: data => this.hardwareData.set(data), error: () => this.loadError.set(true)
    });
  }
}
