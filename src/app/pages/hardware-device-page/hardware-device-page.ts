import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {DashboardCardComponent} from '../../components/dashboard-card-component/dashboard-card-component';
import {NzImageModule } from 'ng-zorro-antd/image';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {UtilityService} from '../../services/utility.service';
import {HardwareUnion} from '../../interfaces/hardware/hardware-union';
import {DoubleStatusTagComponent} from '../../components/double-status-tag-component/double-status-tag-component';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {HardwareStore} from '../../store/hardware.store';
import {UploadButtonComponent} from '../../components/upload-button-component/upload-button-component';
import {UploadComponent} from '../../components/upload-drag-and-drop-component/upload-component';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {CameraForm} from '../../components/forms/camera-form/camera-form.component';
import {SidebarStore} from '../../store/sidebar.store';
import {ReportForm} from '../../components/forms/report-form/report-form';
import {ReportStore} from '../../store/report.store';

@Component({
  selector: 'app-hardware-device-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    DashboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzFlexDirective,
    NzEmptyComponent,
    DashboardCardComponent,
    RouterLink,
    NzImageModule,
    NzRowDirective,
    NzColDirective,
    DoubleStatusTagComponent,
    PriorityTagsComponent,
    NzModalModule,
    BreadcrumbComponent,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzMenuDirective,
    NzMenuItemComponent,
    UploadButtonComponent,
    UploadComponent,
    EditSideBar,
    CameraForm,
    ReportForm
  ],
  templateUrl: './hardware-device-page.html',
  styleUrl: './hardware-device-page.css'
})

export class HardwareDevicePage implements OnInit {

  apiUrlBaseService = inject(ApiUrlBaseService);

  hardwareStore = inject(HardwareStore);
  reportStore = inject(ReportStore);
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService);
  sidebarStore = inject(SidebarStore);
  utilityService = inject(UtilityService);

  // Store
  openSidebar = this.sidebarStore.isOpen;
  selectedHardwareId = this.hardwareStore.selectedHardwareId;
  selectedHardwareDetail = this.hardwareStore.selectedHardwareDetail;


  showPassword = signal<boolean>(false);

  // Static
  fallbackCameraImage: string = '/defaultCamera.webp';

  //SidebarContent
  sidebarContent = signal<'reportForm'|'cameraForm'>('cameraForm');

  // Computed
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug(),
      link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches',this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware']},
      {label: this.routeContext.hardwareSlug()}
    ]);

  activeReports = computed(() =>
  {
    const active = this.selectedHardwareDetail();
    if (active === null) return 0;
    return active.activeReportsCount
  })

  overdueReports = computed(() =>
  {
    const active = this.selectedHardwareDetail();
    if (active === null) return 0;
    return active.overdueReportsCount
  })

  constructor() {
    // effect to know if report is saved or edited successfully in this page in order to update report list.
    effect(() => {
      const report = this.reportStore.reportHistoryTrigger();
      if (report === null) return;
      this.hardwareStore.uploadReportHistoryDtoList(report);
    });
  }

  ngOnInit() {
    this.routeContext.setFromRoute(this.route);
    const hardwareId = this.routeContext.hardwareId()
    if (hardwareId === null) return;
    this.selectedHardwareId.set(hardwareId);
    this.hardwareStore.getHardwareDetail(hardwareId);
  }

  uploadSuccess(data: HardwareUnion){
    this.hardwareStore.uploadSuccess(data);
  }

  uploadCameraPhoto(photoType: string, formData: FormData){
    const selectedCameraId = this.selectedHardwareId()
    if(selectedCameraId === null) return;
    this.hardwareStore.uploadCameraPhoto(selectedCameraId, photoType, true, formData).subscribe();
  }

  openEditSideBar(){
    this.sidebarContent.set("cameraForm");
    const selectedCameraId = this.selectedHardwareId()
    if(selectedCameraId === null) return;
    this.hardwareStore.getCameraEditData(selectedCameraId);
    this.hardwareStore.formMode.set("edit");
    this.openSidebar.set(true);
  }

  openNewReportSideBar(){
    this.sidebarContent.set("reportForm");
    const selectedCameraId = this.selectedHardwareId()
    if(selectedCameraId === null) return;

    this.reportStore.selectedHardwareId.set(selectedCameraId);
    this.reportStore.formMode.set("add");
    this.openSidebar.set(true);

  }

  // GETTING GLOBAL OBJECT DETAILS
  hardwareView = computed(() => {
    const hardware = this.selectedHardwareDetail();
    if (!hardware) return undefined;
    const hardwareGlobalDetails = [
      {label: 'Type', value: hardware.type},
      {label: 'Name', value: hardware.name },
      {label: 'Brand', value: hardware.brand},
      {label: 'Model', value: hardware.model},
      {label: 'Serial Number', value: hardware.serialNumber },
      {label: 'Location', value: hardware.location},
    ];
    let hardwarePhotos = this.getPhotosDependsOnType(hardware);
    const hardwareInfo = this.getDataDependsOnType(hardware);
    // const lastMaintenanceDate = {label: 'Last Maintenance Date', value: this.utilityService.isValidDate(hardware.lastMaintenanceDate)};

    return {...hardware,
      hardwareGlobalDetails,
      hardwarePhotos,
      hardwareInfo,
      lastMaintenanceDate: this.utilityService.validLongDate(hardware.lastMaintenanceDate),
      }
  });

  // GETTING DETAILS DEPENDING ON HARDWARE TYPE
  getPhotosDependsOnType(hardware: HardwareUnion):{label: string, filepath: string | null, default: string, photoType: 'VIEW_FROM_CAMERA' | 'VIEW_TO_CAMERA', link: string} [] {
    switch (hardware.type) {
      case ('Camera'):
        return [
          {
            label: 'View from Camera',
            filepath: hardware.viewFromCameraPhoto?.filePath
              ? this.apiUrlBaseService.imageBaseUrl + hardware.viewFromCameraPhoto.filePath
              : null,
            default: this.fallbackCameraImage,
            photoType: "VIEW_FROM_CAMERA",
            link: this.hardwareStore.getHardwarePhotoUrl(this.hardwareStore.selectedHardwareId()?? 0,"VIEW_FROM_CAMERA")
          },
          {
            label: 'View to Camera',
            filepath: hardware.viewToCameraPhoto?.filePath
              ? this.apiUrlBaseService.imageBaseUrl + hardware.viewToCameraPhoto.filePath
              : null,
            default: this.fallbackCameraImage,
            photoType: "VIEW_TO_CAMERA",
            link: this.hardwareStore.getHardwarePhotoUrl(this.hardwareStore.selectedHardwareId()?? 0,"VIEW_TO_CAMERA")
          } ]
      default: return []
    }
  }

  getDataDependsOnType(hardware: HardwareUnion):{label: string, value: string}[] {
    switch (hardware.type) {
      case ('Camera'):
        return [
          {label: 'Camera ID', value: hardware.cameraId },
          {label: 'Mac Address', value: hardware.macAddress },
          {label: 'IP Address', value: hardware.ipAddress },
          {label: 'IDF', value: hardware.idf },
          {label: 'Username', value: hardware.username },
          {label: 'Password', value: hardware.password }
        ]
      default: return []
    }
  }

  lastReports = computed(() => {
    return this.hardwareView()?.recentActiveReports.map(report => {
      const date = new Date(report.dueDate)
      return{
        ...report,
        dueDate: date
      }
    })
  });
}
