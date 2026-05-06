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
import {NzImageModule } from 'ng-zorro-antd/image';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {UtilityService} from '../../services/utility.service';
import {HardwareUnion} from '../../interfaces/hardware-dto/hardware-union';
import {DoubleStatusTagComponent} from '../../components/double-status-tag-component/double-status-tag-component';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {NzModalComponent, NzModalService, NzModalModule} from 'ng-zorro-antd/modal';
import {NzUploadChangeParam, NzUploadComponent, NzUploadFile} from 'ng-zorro-antd/upload';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';

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
    RouterLink,
    NzImageModule,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzRowDirective,
    NzColDirective,
    DoubleStatusTagComponent,
    PriorityTagsComponent,
    NzModalComponent,
    NzModalModule,
    NzUploadComponent
  ],
  templateUrl: './hardware-device-page.html',
  styleUrl: './hardware-device-page.css'
})

export class HardwareDevicePage {

  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)
  constructor(protected apiUrlBaseService: ApiUrlBaseService,
              private hardwareService: HardwareService,
              private utilityService: UtilityService,
              private modal: NzModalService,
              private message: NzMessageService,
              private notification: NzNotificationService) {
    this.routeContext.setFromRoute(this.route);
    this.getHardwareDetail();
  }

  defaultCameraImage: string = '/defaultCamera.webp';
  hardwareDetailData = signal<HardwareUnion | undefined>(undefined);

  // MODAL FOR IMAGES
  uploadVisible = signal<boolean>(false);
  showUploadModal(photoType: 'VIEW_FROM_CAMERA' | 'VIEW_TO_CAMERA' | null): void {
    this.photoType.set(photoType);
    this.uploadVisible() ? this.uploadVisible.set(false) : this.uploadVisible.set(true);
  }
  photoType = signal<'VIEW_FROM_CAMERA' | 'VIEW_TO_CAMERA' | null>(null)
  replaceExisting = signal<boolean>(false);

  // MODAL FOR REPLACE CONFIRM
  showReplaceModal(): void {
    this.modal.confirm({
      nzTitle: 'A photo already exists',
      nzContent: '<b style="color: red;">Are you sure you want to replace the photo?</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOnOk: () => this.replaceSubmit(),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }
  replaceSubmit(): void {
    this.replaceExisting.set(true);
    const file = this.failedFile();
    if (!file) return;
    this.retryUpload(file);
  }

  uploadUrl():string {
    return `${this.apiUrlBaseService.baseUrl}/hardware/${this.routeContext.hardwareId()}/camera/photos?photoType=${this.photoType()}&replaceExisting=${this.replaceExisting()}`;
  }
  failedFile = signal<File | undefined>(undefined);
  onUploadChange(event: NzUploadChangeParam): void {
    let { file} = event;
    // message error uploading image
    if (file.status === 'error') {
      const errorResponse = file.error;
      const message: string =
        errorResponse?.error?.message;
      if (message.includes('FileAlreadyExists')) {
        this.failedFile.set(file.originFileObj)
        this.uploadVisible.set(false);
        this.showReplaceModal()
      } else {
        this.uploadVisible.set(false);
        this.notification.error(
          'Upload failed',
          message,
          { nzDuration: 0 }
        );
      }
    }
    // message success uploading image
    if (file.status === 'done') {
      this.message.success("File uploaded successfully: " + file.name);
      this.uploadVisible.set(false);
      this.getHardwareDetail();
    }
  }

  // GETTING GLOBAL OBJECT DETAILS
  hardwareView = computed(() => {
    const hardware = this.hardwareDetailData();
    if (!hardware) return undefined;
    const hardwareGlobalDetails = [
      {label: 'Type', value: hardware.type},
      {label: 'Name', value: hardware.name },
      {label: 'Brand', value: hardware.brand},
      {label: 'Model', value: hardware.model},
      {label: 'Serial Number', value: hardware.serialNumber },
      {label: 'Location', value: hardware.location},
    ];
    const hardwarePhotos = this.getPhotosDependsOnType(hardware);
    const hardwareInfo = this.getDataDependsOnType(hardware);
    const lastMaintenanceDate = {label: 'Last Maintenance Date', value: this.utilityService.isValidDate(hardware.lastMaintenanceDate)};

    return {...hardware,
      hardwareGlobalDetails,
      hardwarePhotos,
      hardwareInfo,
      lastMaintenanceDate
      }
  });
  // GETTING DETAILS DEPENDING ON HARDWARE TYPE
  getPhotosDependsOnType(hardware: HardwareUnion):{label: string, filepath: string, default: string, photoType: 'VIEW_FROM_CAMERA' | 'VIEW_TO_CAMERA' } [] {
    switch (hardware.type) {
      case ('Camera'):
        return [
          {
            label: 'View from Camera',
            filepath: hardware.viewFromCameraPhoto?.filePath
              ? this.apiUrlBaseService.imageBaseUrl + hardware.viewFromCameraPhoto.filePath
              : this.defaultCameraImage,
            default: this.defaultCameraImage,
            photoType: "VIEW_FROM_CAMERA"
          },
          {
            label: 'View to Camera',
            filepath: hardware.viewToCameraPhoto?.filePath
              ? this.apiUrlBaseService.imageBaseUrl + hardware.viewToCameraPhoto.filePath
              : this.defaultCameraImage,
            default: this.defaultCameraImage,
            photoType: "VIEW_TO_CAMERA"
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

  hardwareId = computed(() =>
    this.routeContext.hardwareId() ?? 0);
  getHardwareDetail(){
    return this.hardwareService.getHardwareDetail(this.hardwareId()).subscribe({
      next: data => {
          return this.hardwareDetailData.set(data);
      }
    })
  }

  retryUpload(file:File): void {
    const formData = new FormData();
    formData.append('file', file as any);

    this.apiUrlBaseService.post(`hardware/${this.routeContext.hardwareId()}/camera/photos?photoType=${this.photoType()}&replaceExisting=${this.replaceExisting()}`, formData).subscribe({
      next: () => {
        this.message.success('File replaced successfully');
        this.getHardwareDetail();
        this.replaceExisting.set(false);
        this.failedFile.set(undefined);
      },
      error: (err) => {
        this.replaceExisting.set(false);
        this.failedFile.set(undefined);
        this.notification.error(
          'Upload failed',
          err?.error.message,
          { nzDuration: 0 }
        );
      }
    });
  }
}
