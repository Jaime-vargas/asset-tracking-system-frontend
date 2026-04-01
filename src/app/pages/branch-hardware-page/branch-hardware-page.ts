import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {BranchService} from '../../services/branch.service';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {FormsModule} from '@angular/forms';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {HardwareTableDto} from '../../interfaces/hardware-dto/hardware-table.dto';
import {RouteContextService} from '../../services/route-context.service';
import {UtilityService} from '../../services/utility.service';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-branch-hardware-device-page',
  imports: [
    NzDividerComponent,
    DasboardBoxComponent,
    FormsModule,
    NzButtonComponent,
    NzFlexDirective,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzEmptyComponent,
    NzTableComponent,
    NzTagComponent,
    NzThMeasureDirective,
    RouterLink,
    ReportCountTagsComponent,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzRowDirective,
    NzColDirective
  ],
  templateUrl: './branch-hardware-page.html',
  styleUrl: './branch-hardware-page.css',
})
export class BranchHardwarePage {

  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)

  constructor(private branchService: BranchService,
              protected utilityService: UtilityService) {
    this.routeContext.setFromRoute(this.route);
    this.getHardwareDataByBranchId(this.branchId());
  }
  clientId = computed(() =>
    this.routeContext.clientId() ?? 0);
  branchId = computed(() =>
    this.routeContext.branchId() ?? 0);

  // TABLE DATA
  hardwareData = signal<HardwareTableDto[]>([]);
  hardware = computed(()=> {
    const now = new Date(new Date());
    return this.hardwareData().map((hardware) => {
      const date = new Date(hardware.lastMaintenanceDate);
      const totalReports = hardware.reportsActive.length;
      const overdueReports = hardware.reportsActive.filter(report =>
      new Date(report.dueDate) < now).length
      return {
        ...hardware,
        lastMaintenanceDate: date.toLocaleDateString('en-CA'),
        reportsActive: totalReports - overdueReports,
        overdueReports,
      };
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
  hardwareTable = computed(() => {
    return this.hardware().filter(hardware => {
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

  getHardwareDataByBranchId(branchId : number) {
    this.branchService.getHardwareTableFromBranch(branchId).subscribe({
      next: (data) => {
        this.hardwareData.set(data);
      }
    })
  }

}
