import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BranchService} from '../../services/branch.service';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
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

@Component({
  selector: 'app-branch-hardware-device-page',
  imports: [
    NzDividerComponent,
    DasboardBoxComponent,
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
    NzMenuItemComponent
  ],
  templateUrl: './branch-hardware-page.html',
  styleUrl: './branch-hardware-page.css',
})
export class BranchHardwarePage {

  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)

  constructor(private branchService: BranchService,
              protected utilityService: UtilityService,
              protected tableBranchHardwareService: TableColumnsBranchHardwareService) {
    this.routeContext.setFromRoute(this.route);
    this.getHardwareDataByBranchId(this.branchId());
  }
  hardwareData = signal<HardwareTableDto[]>([]);

  // BREADCRUMB
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug()}
    ]);

  // TABLE DATA
  tableData = computed<TableData[]>(() => {
      return this.filteredHardware().map(hardware => {
        return {
          ...hardware,
          actions: [
            {label: 'View', type: 'link', link:['/clients',this.routeContext.clientId(), this.routeContext.clientSlug(),
                'branches',this.routeContext.branchId(),this.routeContext.branchSlug(),
                'hardware',hardware.id,this.utilityService.slugify(hardware.name)]},
          ]
        }
      })
  });


  // TABLE INPUT FILTERS
  typeFilter = signal<string>("");
  nameFilter = signal<string>("");
  modelFilter = signal<string>("");
  serialNumberFilter = signal<string>("");
  locationFilter = signal<string>("");
  lastMaintenanceFilter = signal<string>("");
  // TABLE FILTER
  filteredHardware = computed(() => {
    return this.hardwareData().filter(hardware => {
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

  clientId = computed(() =>
    this.routeContext.clientId() ?? 0);
  branchId = computed(() =>
    this.routeContext.branchId() ?? 0);

  getPhotoReport(){
    return this.branchService.getPhotoReport(this.branchId()).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      }
    })
  }
  getTechnicalMemory(){
    return this.branchService.getTechnicalMemory(this.branchId()).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      }
    })
  }
  getQrCodes(){
    return this.branchService.getQrCodes(this.branchId()).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      }
    })
  }

  getHardwareDataByBranchId(branchId : number) {
    this.branchService.getHardwareTableFromBranch(branchId).subscribe({
      next: (data) => {
        this.hardwareData.set(data);
      }
    })
  }

}
