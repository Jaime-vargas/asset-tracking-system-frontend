import {Component, computed, signal} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NgOptimizedImage} from '@angular/common';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {DasboardCardComponent} from '../../components/dasboard-card-component/dasboard-card-component';
import {HardwareService} from '../../services/hardware.service';
import {HardwareDetailDto} from '../../interfaces/hardware-detail.dto';
import {computeMsgId} from '@angular/compiler';
import {CameraDetailDto} from '../../interfaces/camera-detail.dto';

@Component({
  selector: 'app-hardware-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    DasboardBoxComponent,
    NzButtonComponent,
    NzIconDirective,
    NzFlexDirective,
    NgOptimizedImage,
    NzEmptyComponent,
    DasboardCardComponent
  ],
  templateUrl: './hardware-page.html',
  styleUrl: './hardware-page.css',
})
export class HardwarePage {

  constructor(private hardwareService: HardwareService) {
    this.getHardwareDetail();
  }

  defaultCameraImage: string = '/defaultCamera.webp';
  hardwareDetailData = signal<HardwareDetailDto | undefined>(undefined);
  // COMPUTED TO ASSIGN TYPES
  hardwareDetail = computed(() => {
    const hardware = this.hardwareDetailData();
    if (hardware?.type === 'Camera') {
      return hardware as CameraDetailDto;
    }
    return null;
  });

  lastMaintenanceDate = computed(() =>{
    const stringDate = this.hardwareDetail()?.lastMaintenanceDate;
    if (!stringDate) return '';
    const date = new Date(stringDate);
    return date.toLocaleDateString('en-CA');
  });
  lastReports = computed(() => {
    const now = new Date();
    return this.hardwareDetail()?.recentActiveReports.map(report => {
      const date = new Date()
      const iconStyle = {closed: {icon:"close-circle", color:"bg-red"},
                        open: {icon:"check-circle", color:"bg-green"}};
      const icon = date < now ? iconStyle.closed : iconStyle.open;
      return{
        ...report,
        dueDate: date.toLocaleDateString('en-CA'),
        icon: icon
      }
    })
  });



  getHardwareDetail() {
    return this.hardwareService.getHardwareDetail(1,1,3).subscribe({
      next: data => {
          return this.hardwareDetailData.set(data);
      }
    })
  }
}
