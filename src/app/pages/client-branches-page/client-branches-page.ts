import { DatePipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ClientSettings } from '../../components/client-settings/client-settings';
import { ClientForm } from '../../components/forms/client-form/client-form';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { BranchTableDto } from '../../interfaces/branch-table.dto';
import { ApiUrlBaseService } from '../../services/api-url-base.service';
import { UtilityService } from '../../services/utility.service';
import { RouteContextService } from '../../services/route-context.service';
import { EditSideBar } from '../../components/edit-side-bar/edit-side-bar';
import { BranchStore } from '../../store/branch.store';
import { SidebarStore } from '../../store/sidebar.store';
import { BranchForm } from '../../components/forms/branch-form/branch-form';
import { ClientDocuments } from '../../components/client-documents/client-documents';
import { ClientHardware } from '../../components/client-hardware/client-hardware';
import { ClientStore } from '../../store/client.store';
import { RecentClientsService } from '../../services/recent-clients.service';
import { ListPagination } from '../../components/list-pagination/list-pagination';
@Component({
  selector: 'app-client-branches-page',
  imports: [
    DatePipe,
    NzSelectModule,
    RouterLink,
    FormsModule,
    NzButtonComponent,
    NzInputModule,
    NzIconDirective,
    EditSideBar,
    BranchForm,
    ClientDocuments,
    ClientHardware,
    ListPagination,
    NzModalModule,
    ClientSettings,
    ClientForm,
  ],
  templateUrl: './client-branches-page.html',
  styleUrl: './client-branches-page.css',
})
export class ClientBranchesPage implements OnInit {
  protected branchStore = inject(BranchStore);
  private sidebarStore = inject(SidebarStore);
  private utility = inject(UtilityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private routeContext = inject(RouteContextService);
  private clientStore = inject(ClientStore);
  private recentClients = inject(RecentClientsService);
  private destroyRef = inject(DestroyRef);
  clientId = this.routeContext.clientId;
  currentClient = computed(() =>
    this.clientStore.clientList().find((client) => client.id === this.clientId()),
  );
  clientName = computed(
    () =>
      this.currentClient()?.name ??
      this.clientStore.summary()?.name ??
      this.routeContext.clientSlug() ??
      'Client',
  );
  private imageBaseUrl = inject(ApiUrlBaseService).imageBaseUrl;
  failedLogo = signal<string | null>(null);
  clientLogo = computed(() => {
    const path = this.clientStore.clientList().find((client) => client.id === this.clientId())
      ?.photo?.filePath;
    const url = path ? this.imageBaseUrl + path : null;
    return url !== this.failedLogo() ? url : null;
  });
  clientInitials = computed(() =>
    this.clientName()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  );
  settingsOpen = signal(false);
  clientEditing = signal(false);
  settingsDirty = false;
  settingsRevision = signal(0);
  protected readonly sections = [
    { label: 'Documents', icon: 'file-text' },
    { label: 'Projects', icon: 'folder-open' },
    { label: 'Hardware', icon: 'desktop' },
  ];
  activeTab = signal(0);

  openSettings() {
    if (!this.currentClient() && !this.clientStore.tableLoading()) this.clientStore.loadClients();
    this.settingsOpen.set(true);
  }
  closeSettings() {
    this.settingsOpen.set(false);
    if (this.settingsDirty) {
      this.settingsRevision.update((value) => value + 1);
      this.settingsDirty = false;
    }
  }
  openClientEditor() {
    const client = this.currentClient();
    if (!client) return;
    this.closeSettings();
    this.clientStore.selectedClient.set(client);
    this.clientStore.formMode.set('edit');
    this.clientEditing.set(true);
    this.openSideBar.set(true);
  }
  openSideBar = this.sidebarStore.isOpen;
  branchList = this.branchStore.branchList;
  branchNameFilter = signal('');
  page = signal(1);
  readonly pageSize = 12;
  createdFrom = signal('');
  createdTo = signal('');
  projectOrder = signal<'newest' | 'oldest' | 'name'>('newest');
  invalidDateRange = computed(() => !!this.createdFrom() && !!this.createdTo() && this.createdFrom() > this.createdTo());
  filteredBranches = computed(() => {
    if (this.invalidDateRange()) return [];
    return this.branchList().filter((project) =>
      project.name.toLowerCase().includes(this.branchNameFilter().trim().toLowerCase()) &&
      (!this.createdFrom() || project.createdDate >= this.createdFrom()) &&
      (!this.createdTo() || project.createdDate <= this.createdTo()),
    ).sort((a, b) => {
      if (this.projectOrder() === 'name') return a.name.localeCompare(b.name) || a.id - b.id;
      const dateOrder = a.createdDate.localeCompare(b.createdDate) || a.id - b.id;
      return this.projectOrder() === 'oldest' ? dateOrder : -dateOrder;
    });
  });
  clearProjectFilters() {
    this.branchNameFilter.set('');
    this.createdFrom.set('');
    this.createdTo.set('');
    this.page.set(1);
  }
  currentPage = computed(() =>
    Math.min(this.page(), Math.max(1, Math.ceil(this.filteredBranches().length / this.pageSize))),
  );
  visibleProjects = computed(() =>
    this.filteredBranches().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  ngOnInit() {
    this.routeContext.setFromRoute(this.route);
    this.branchStore.currentClientId.set(this.clientId());
    const projects = this.branchStore.loadBranches();
    this.destroyRef.onDestroy(() => projects?.unsubscribe());
    if (!this.clientStore.clientList().length && !this.clientStore.tableLoading())
      this.clientStore.loadClients();
    const id = this.clientId();
    if (id !== null)
      this.clientStore.loadClientSummary(id).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.recentClients.record(id));
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.activeTab.set(
        Math.max(
          0,
          ['documents', 'projects', 'hardware'].indexOf(params.get('tab') ?? 'documents'),
        ),
      );
    });
  }
  changeTab(index: number) {
    if (index === this.activeTab()) return;
    this.openSideBar.set(false);
    this.activeTab.set(index);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: ['documents', 'projects', 'hardware'][index], project: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  projectLink(project: BranchTableDto) {
    return [
      '/clients',
      this.clientId(),
      this.routeContext.clientSlug(),
      'branches',
      project.id,
      this.utility.slugify(project.name),
      'hardware',
    ];
  }
  openNewSidebar() {
    this.clientEditing.set(false);
    this.branchStore.selectedBranch.set(null);
    this.branchStore.formMode.set('add');
    this.openSideBar.set(true);
  }
}
