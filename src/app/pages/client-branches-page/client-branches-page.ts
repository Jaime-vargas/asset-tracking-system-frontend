import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {inject} from '@angular/core';
import {ClientService} from '../../services/client.service';
import {BranchTableDto} from '../../interfaces/branch-table.dto';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {FormsModule} from '@angular/forms';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {UtilityService} from '../../services/utility.service';
import {RouteContextService} from '../../services/route-context.service';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {TableComponent} from '../../components/table-component/table-component';
import {TableColumnsClientsBranchesService} from '../../services/table-columns-service/table-columns-clients-branches.service';
import {TableData} from '../../interfaces/table/table-data';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {BranchStore} from '../../store/branch.store';
import {SidebarStore} from '../../store/sidebar.store';
import {ClientTableDto} from '../../interfaces/client-table.dto';
import {Subscription} from 'rxjs';
import {ClientForm} from '../../components/forms/client-form/client-form';
import {BranchForm} from '../../components/forms/branch-form/branch-form';

@Component({
  selector: 'app-client-branches-page',
  imports: [
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzTableComponent,
    NzThMeasureDirective,
    NzDividerComponent,
    NzEmptyComponent,
    NzFlexDirective,
    FormsModule,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    RouterLink,
    ReportCountTagsComponent,
    NzRowDirective,
    NzColDirective,
    BreadcrumbComponent,
    TableComponent,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
    EditSideBar,
    ClientForm,
    BranchForm
  ],
  templateUrl: './client-branches-page.html',
  styleUrl: './client-branches-page.css',
})
export class ClientBranchesPage implements OnInit, OnDestroy {
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)
  constructor(private clientService: ClientService,
              protected utilityService: UtilityService,
              protected tableClientsBranchesService: TableColumnsClientsBranchesService,
              private branchStore: BranchStore,
              private sidebarStore: SidebarStore) {
    this.routeContext.setFromRoute(this.route);
    this.getBranches();
  }
  subscriptions = new Subscription();
  ngOnInit(){
    this.subscriptions.add(
      this.sidebarStore.isOpen$.subscribe(isOpen => {
        this.isOpenSidebar.set(isOpen);
      })
    );
    this.subscriptions.add(
      this.sidebarStore.refreshTable$.subscribe(() => {
        this.getBranches();
      })
    )
  }
  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  isOpenSidebar = signal<boolean>(false);

  branchesData = signal<BranchTableDto[]>([]);

  // BREADCRUMB
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug()}
    ]);

  // TABLE DATA
  tableData = computed<TableData[]>(()=>{
    return this.filteredBranches().map((branch: BranchTableDto) => {
      return {
        ...branch,
        actions: [
          {label: 'Manage', type: 'link', link:['/clients',this.routeContext.clientId(), this.routeContext.clientSlug(),
              'branches',branch.id,this.utilityService.slugify(branch.name),'hardware']},
          {label: 'Edit', type: 'edit', onClick: (branch: BranchTableDto)=> this.openEditSidebar(branch)},
        ]
      }
    })
  })

  // DATA FILTER
  branchNameFilter = signal<string>('');
  filteredBranches = computed(()=> {
      return this.branchesData().filter(branch => {
        return branch.name.toLowerCase().includes(this.branchNameFilter().toLowerCase());
      })
  })

  openEditSidebar(branch: BranchTableDto) {
    this.sidebarStore.setSelectedEntity(branch);
    this.sidebarStore.setMode("edit");
    this.sidebarStore.open();
  }

  clientId = computed(() => this.routeContext.clientId() ?? 0);
  getBranches() {
    return this.clientService.getBranches(this.clientId()).subscribe({
      next: data => {
        this.branchesData.set(data);
      }
    })
  }
}
