import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
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
import { ListPagination } from '../../components/list-pagination/list-pagination';
@Component({
  selector: 'app-client-branches-page',
  imports: [
    RouterLink,
    FormsModule,
    NzButtonComponent,
    NzInputModule,
    NzTabsModule,
    NzIconDirective,
    EditSideBar,
    BranchForm,
    ClientDocuments,
    ClientHardware,
    ListPagination,
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
  private destroyRef = inject(DestroyRef);
  clientId = this.routeContext.clientId;
  clientName = computed(
    () => this.clientStore.summary()?.name ?? this.routeContext.clientSlug() ?? 'Client',
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
  activeTab = signal(0);
  documentProjectId = signal<number | null>(null);
  openSideBar = this.sidebarStore.isOpen;
  branchList = this.branchStore.branchList;
  branchNameFilter = signal('');
  page = signal(1);
  readonly pageSize = 8;
  filteredBranches = computed(() =>
    this.branchList()
      .filter((project) =>
        project.name.toLowerCase().includes(this.branchNameFilter().trim().toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
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
      this.clientStore.loadClientSummary(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.activeTab.set(
        Math.max(
          0,
          ['documents', 'hardware', 'projects'].indexOf(params.get('tab') ?? 'documents'),
        ),
      );
      const project = Number(params.get('project'));
      this.documentProjectId.set(Number.isSafeInteger(project) && project > 0 ? project : null);
    });
  }
  changeTab(index: number) {
    if (index === this.activeTab()) return;
    this.openSideBar.set(false);
    this.activeTab.set(index);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: ['documents', 'hardware', 'projects'][index], project: null },
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
  updateDocumentProject(projectId: number | null) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { project: projectId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  showProjectDocuments(project: BranchTableDto) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'documents', project: project.id },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  openEditSidebar(project: BranchTableDto) {
    this.branchStore.selectedBranch.set(project);
    this.branchStore.formMode.set('edit');
    this.openSideBar.set(true);
  }
  openNewSidebar() {
    this.branchStore.selectedBranch.set(null);
    this.branchStore.formMode.set('add');
    this.openSideBar.set(true);
  }
}
