import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {DasboardCardComponent} from '../../components/dasboard-card-component/dasboard-card-component';
import {HardwareService} from '../../services/hardware.service'
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzImageModule } from 'ng-zorro-antd/image';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {UtilityService} from '../../services/utility.service';
import {HardwareUnion} from '../../interfaces/hardware-dto/hardware-union';
import {ReportCountTagsComponent} from '../../components/report-count-tags-component/report-count-tags-component';
import {DoubleStatusTagComponent} from '../../components/double-status-tag-component/double-status-tag-component';

@Component({
  selector: 'app-hardware-device-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzFlexDirective,
    NzEmptyComponent,
    DasboardCardComponent,
    NzTagComponent,
    RouterLink,
    NzImageModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzRowDirective,
    NzColDirective,
    ReportCountTagsComponent,
    DoubleStatusTagComponent
  ],
  templateUrl: './hardware-device-page.html',
  styleUrl: './hardware-device-page.css'
})

export class HardwareDevicePage implements OnInit {

  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)
  constructor(private hardwareService: HardwareService,
              private utilityService: UtilityService) {
  }
  clientId = computed(() =>
    this.routeContext.clientId() ?? 0);
  branchId = computed(() =>
    this.routeContext.branchId() ?? 0);
  hardwareId = computed(() =>
    this.routeContext.hardwareId() ?? 0);

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.routeContext.setFromRoute(this.route);
      this.getHardwareDetail();
    });
  }

  defaultCameraImage: string = '/defaultCamera.webp';
  hardwareDetailData = signal<HardwareUnion>(undefined);

  // COMPUTED TO ASSIGN TYPES
  hardwareView = computed(() => {
    const hardware = this.hardwareDetailData();
    if (!hardware) return undefined;
    const globalDetails = [
      {label: 'Type', value: hardware.type},
      {label: 'Name', value: hardware.name },
      {label: 'Serial Number', value: hardware.serialNumber },
      {label: 'Location', value: hardware.location},
    ];
    const lastMaintenanceDate = {label: 'Last Maintenance Date', value: this.utilityService.isValidDate(hardware.lastMaintenanceDate)};
    switch (hardware.type) {
      case ('Camera'):
        return {...hardware,
          globalDetails: globalDetails,
          hardwareInfo: [
            {label: 'Camera ID', value: hardware.cameraId },
            {label: 'Mac Address', value: hardware.macAddress },
            {label: 'IP Address', value: hardware.ipAddress },
            lastMaintenanceDate
          ]}
      default: return undefined;
    }
  });
// type, model, serial number, location

  lastReports = computed(() => {
    return this.hardwareView()?.recentActiveReports.map(report => {
      const date = new Date(report.dueDate)
      return{
        ...report,
        dueDate: date
      }
    })
  });

  getHardwareDetail(){
    return this.hardwareService.getHardwareDetail(this.hardwareId()).subscribe({
      next: data => {
          return this.hardwareDetailData.set(data);
      }
    })
  }
}
