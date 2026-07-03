import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {FormsModule} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {HardwareTableDto} from '../../interfaces/hardware/hardware-table.dto';
import {RouteContextService} from '../../services/route-context.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {UtilityService} from '../../services/utility.service';
import {TableComponent} from '../../components/table-component/table-component';
import {TableData} from '../../interfaces/table/table-data';
import {TableColumnsBranchHardwareService} from '../../services/table-columns-service/table-columns-branch-hardware.service';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {SidebarStore} from '../../store/sidebar.store';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {HardwareStore} from '../../store/hardware.store';
import {CameraForm} from '../../components/forms/camera-form/camera-form.component';

@Component({
  selector: 'app-branch-hardware-device-page',
  imports: [
    NzDividerComponent,
    DashboardBoxComponent,
    FormsModule,
    NzButtonComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzRowDirective,
    NzColDirective,
    BreadcrumbComponent,
    TableComponent,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzFlexDirective,
    NzMenuDirective,
    NzMenuItemComponent,
    EditSideBar,
    CameraForm
  ],
  templateUrl: './branch-hardware-page.html',
  styleUrl: './branch-hardware-page.css',
})
export class BranchHardwarePage implements OnInit {

  protected hardwareStore = inject(HardwareStore);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private routeContext = inject(RouteContextService);
  private sidebarStore = inject(SidebarStore);
  protected tableBranchHardwareService = inject(TableColumnsBranchHardwareService);
  private utilityService = inject(UtilityService);

  // Sidebar
  openSideBar = this.sidebarStore.isOpen;

  selectedHardware = this.hardwareStore.selectedHardware;
  hardwareList = this.hardwareStore.hardwareList;
  formMode = this.hardwareStore.formMode;

  // Filters
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");

  // Computed variables
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug()}
    ]);

  filteredHardware = computed(() => {
    return this.hardwareList().filter(hardware => {
      return (
        hardware.type.toLowerCase().includes(this.typeFilter().toLowerCase()) &&
        hardware.name.toLowerCase().includes(this.nameFilter().toLowerCase()) &&
        hardware.model.toLowerCase().includes(this.modelFilter().toLowerCase()) &&
        hardware.serialNumber.toLowerCase().includes(this.serialNumberFilter().toLowerCase()) &&
        hardware.location.toLowerCase().includes(this.locationFilter().toLowerCase()) &&
        hardware.lastMaintenanceDate.toLowerCase().includes(this.lastMaintenanceFilter().toLowerCase())
      );
    });
  });

  tableData = computed<TableData[]>(() => {
    return this.filteredHardware().map(hardware => {
      return {
        ...hardware,
        lastMaintenanceDate: this.utilityService.isValidDate(hardware.lastMaintenanceDate),
        actions: [
          {label: 'View', type: 'link', link:['/clients',this.routeContext.clientId(), this.routeContext.clientSlug(),
              'branches',this.routeContext.branchId(),this.routeContext.branchSlug(),
              'hardware',hardware.id,this.utilityService.slugify(hardware.name)]},
          {label: "Edit", type: 'edit', onClick: (hardware: HardwareTableDto)=> this.openEditSidebar(hardware)},
        ]
      }
    })
  });

  ngOnInit() {
    this.routeContext.setFromRoute(this.route);
    this.hardwareStore.currentBranchId.set(this.routeContext.branchId());
    this.hardwareStore.loadHardware();
  }

  openEditSidebar(hardware: HardwareTableDto){
    this.hardwareStore.getCameraEditData(hardware.id);
    this.formMode.set("edit");
    this.openSideBar.set(true);
  }

  openNewSidebar(){
    this.selectedHardware.set(null);
    this.formMode.set("add");
    this.openSideBar.set(true);
  }
}
