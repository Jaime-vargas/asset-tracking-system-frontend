import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ReportsService } from '../../services/report.service';
import { ReportTableDto } from '../../interfaces/report/report-table.dto';
import { directoryClients, directorySites, groupBySite, scopeOrder, validDirectoryDate, matchesDirectorySearch, directoryDateKey } from '../../utils/directory';
import { DirectoryFilters } from '../../components/directory-filters/directory-filters';
import { UiIcon } from '../../components/ui-icon/ui-icon';
import { ListPagination } from '../../components/list-pagination/list-pagination';
import { PriorityTagsComponent } from '../../components/priority-tags-component/priority-tags-component';
import { SingleStatusTagsComponent } from '../../components/single-status-tags-component/single-status-tags-component';
import { UiTag } from '../../components/ui-tag/ui-tag';
@Component({
  selector: 'app-reports-page', imports: [
    DatePipe, FormsModule, RouterLink, DirectoryFilters, UiIcon, ListPagination, UiTag, SingleStatusTagsComponent, PriorityTagsComponent
  ],
  templateUrl: './reports-page.html', styleUrls: [
    '../../styles/native-controls.css', '../../styles/directory-page.css', './reports-page.css'
  ]
})
export class ReportsPage {
  private service = inject(ReportsService);
  private destroyRef = inject(DestroyRef);
  reportsData = signal<ReportTableDto[]>([]);
  loading = signal(false);
  loadError = signal(false);
  search = signal('');
  clientId = signal<number | null>(null);
  siteId = signal<number | null>(null);
  status = signal('');
  priority = signal('');
  sort = signal('newest');
  grouped = signal(true);
  page = signal(1);
  readonly pageSize = 12;
  dateField = signal<'createdDate' | 'dueDate'>('dueDate');
  dateFrom = signal('');
  dateTo = signal('');
  invalidDateRange = computed(() => !!(this.dateFrom() && this.dateTo() && this.dateFrom() > this.dateTo()));
  clients = computed(() => directoryClients(this.reportsData()));
  sites = computed(() => directorySites(this.reportsData(), this.clientId()));
  priorities = computed(() => [
    ...new Set(this.reportsData().map(item => item.priority))
  ].sort());
  totals = computed(() => ({
    all: this.reportsData().length, open: this.reportsData().filter(item => [
      'ACTIVE', 'OVERDUE'
    ].includes(item.status)).length, overdue: this.reportsData().filter(item => item.status === 'OVERDUE').length, closed: this.reportsData().filter(item => item.status === 'CLOSED').length
  }));
  hasFilters = computed(() => !!(this.search() || this.clientId() !== null || this.siteId() !== null || this.status() || this.priority() || this.dateFrom() || this.dateTo()));
  filteredReports = computed(() => {
    if (this.invalidDateRange())
      return [];
    return this.reportsData().filter(item => {
      const day = directoryDateKey(item[this.dateField()]);
      return (this.clientId() === null || item.clientId === this.clientId()) && (this.siteId() === null || item.tagId === this.siteId())
        && (!this.status() || (this.status() === 'OPEN' ? [
          'ACTIVE', 'OVERDUE'
        ].includes(item.status) : item.status === this.status()))
        && (!this.priority() || item.priority === this.priority())
        && (!this.dateFrom() || (!!day && day >= this.dateFrom())) && (!this.dateTo() || (!!day && day <= this.dateTo()))
        && matchesDirectorySearch(this.search(), [
          `#${item.id}`, item.title, item.hardwareName, item.clientName, item.tagName, item.createdDate, item.dueDate, this.date(item.createdDate)?.toDateString(), this.date(item.dueDate)?.toDateString()
        ]);
    }).sort((a, b) => (this.grouped() ? scopeOrder(a, b) : 0) || (this.sort() === 'due' ? (this.date(a.dueDate)?.getTime() ?? Infinity) - (this.date(b.dueDate)?.getTime() ?? Infinity) : this.sort() === 'oldest' ? (this.date(a.createdDate)?.getTime() ?? 0) - (this.date(b.createdDate)?.getTime() ?? 0) : (this.date(b.createdDate)?.getTime() ?? 0) - (this.date(a.createdDate)?.getTime() ?? 0)) || b.id - a.id);
  });
  currentPage = computed(() => Math.max(1, Math.min(this.page(), Math.ceil(this.filteredReports().length / this.pageSize))));
  groups = computed(() => groupBySite(this.filteredReports().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize), this.grouped()));
  constructor() {
    effect(() => {
      this.search();
      this.clientId();
      this.siteId();
      this.status();
      this.priority();
      this.dateField();
      this.dateFrom();
      this.dateTo();
      this.sort();
      this.grouped();
      this.page.set(1);
    });
    this.getReports();
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
    this.status.set('');
    this.priority.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
  }
  getReports() {
    if (this.loading())
      return;
    this.loading.set(true);
    this.loadError.set(false);
    this.service.getAllReports().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false))).subscribe({
      next: data => this.reportsData.set(data), error: () => this.loadError.set(true)
    });
  }
}
