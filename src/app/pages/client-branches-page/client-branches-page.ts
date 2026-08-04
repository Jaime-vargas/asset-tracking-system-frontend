import {Component, computed, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {inject} from '@angular/core';
import {BranchTableDto} from '../../interfaces/branch-table.dto';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {FormsModule} from '@angular/forms';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {UtilityService} from '../../services/utility.service';
import {RouteContextService} from '../../services/route-context.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {TableComponent} from '../../components/table-component/table-component';
import {TableColumnsClientsBranchesService} from '../../services/table-columns-service/table-columns-clients-branches.service';
import {TableData} from '../../interfaces/table/table-data';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {BranchStore} from '../../store/branch.store';
import {SidebarStore} from '../../store/sidebar.store';
import {BranchForm} from '../../components/forms/branch-form/branch-form';

@Component({
  selector: 'app-client-branches-page',
  imports: [
    DashboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzFlexDirective,
    FormsModule,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzRowDirective,
    NzColDirective,
    BreadcrumbComponent,
    TableComponent,
    EditSideBar,
    BranchForm
  ],
  templateUrl: './client-branches-page.html',
  styleUrl: './client-branches-page.css',
})
export class ClientBranchesPage implements OnInit {

  protected branchStore = inject(BranchStore);
  private sidebarStore = inject(SidebarStore);
  protected tableClientsBranchesService = inject(TableColumnsClientsBranchesService);
  private utilityService = inject(UtilityService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private routeContext = inject(RouteContextService);

  // Sidebar
  openSideBar = this.sidebarStore.isOpen;

  // Branch store
  selectedBranch = this.branchStore.selectedBranch;
  branchList = this.branchStore.branchList;
  formMode = this.branchStore.formMode;

  // Filters
  branchNameFilter = signal<string>('');

  // Computed variables
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug()}
    ]);

  filteredBranches = computed(()=>
    this.branchList().filter(branch =>
       branch.name.toLowerCase().includes(this.branchNameFilter().toLowerCase())
    )
  );

  tableData = computed<TableData[]>(()=>{
    // Edition
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

  ngOnInit(){
    this.routeContext.setFromRoute(this.route);
    this.branchStore.currentClientId.set(this.routeContext.clientId());
    this.branchStore.loadBranches();
  }

  openEditSidebar(branch: BranchTableDto) {
    this.selectedBranch.set(branch);
    this.formMode.set("edit");
    this.openSideBar.set(true);
  }

  openNewSidebar(){
    this.selectedBranch.set(null);
    this.formMode.set("add");
    this.openSideBar.set(true);
  }
}
