import {computed, inject, Injectable, signal} from '@angular/core';
import {HardwareService} from '../services/hardware.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {HardwareTableDto} from '../interfaces/hardware/hardware-table.dto';
import {HttpErrorResponse} from '@angular/common/http';
import {CameraResponseDto} from '../interfaces/hardware/camera/camera-response.dto';
import {CameraRequestDto} from '../interfaces/hardware/camera/camera-request.dto';
import {catchError, EMPTY, tap} from 'rxjs';
import {HardwareUnion} from '../interfaces/hardware/hardware-union';
import {CameraDetailDto} from '../interfaces/camera-detail.dto';
import {ReportHistoryDto} from '../interfaces/report/report-history.dto';

@Injectable({providedIn: 'root'})
export class HardwareStore {

  hardwareService = inject(HardwareService);
  messageService = inject(NzMessageService);
  notificationService = inject(NzNotificationService);

  public currentBranchId = signal<number | null>(null);
  public hardwareList = signal<HardwareTableDto[]>([]);
  public selectedHardwareId = signal<number | null>(null);
  public selectedHardware = signal<CameraResponseDto | null>(null);
  public selectedHardwareDetail = signal<HardwareUnion | null>(null);

  // Form
  public formMode = signal<"add" | "edit" | null>(null);

  public getHardwarePhotoUrl (hardwareId: number, photoType:string):string {
    return this.hardwareService.getUploadCameraPhotoUrl(hardwareId, photoType);
  }

  // HARDWARE
  loadHardware(){
    const branchId = this.currentBranchId();
    if(branchId === null) return;
    this.hardwareService.getHardwareByBranchId(branchId).subscribe({
      next: (data: HardwareTableDto[]) => this.hardwareList.set(data),
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  getHardwareDetail(hardwareId:number){
    return this.hardwareService.getHardwareDetail(hardwareId).subscribe({
      next: data => {return this.selectedHardwareDetail.set(data)},
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  getCameraEditData(hardwareId: number){
    this.hardwareService.getCameraEditData(hardwareId).subscribe({
      next: data => {
        this.selectedHardware.set(data)
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  saveCamera(branchId: number, camera: CameraRequestDto){
    return this.hardwareService.saveCamera(branchId, camera).pipe(
      tap(()=> this.loadHardware()),
      tap(() => this.messageService.success('Camera updated successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;
      }));
  }

  updateCamera(cammeraid: number, camera: CameraRequestDto){
    return this.hardwareService.updateCamera(cammeraid, camera).pipe(
      // response from service
      tap(data =>{
        this.selectedHardware.set(data);
        this.hardwareList.update(currList => currList.map(
          hw => hw.id === data.id ? {
            ...hw,
            name: data.name,
            model: data.model,
            serialNumber: data.serialNumber,
            location: data.location,
          } : hw
        ));
      }),
      // Updating hardware detail if is in use
      tap(data =>{
        this.selectedHardwareDetail.update(curr => {
          if(!curr) return curr;
          return {
            ...curr,
            ...data,
            lastMaintenanceDate: new Date().toLocaleString(),
          }
        });
      }),
      tap(() => this.messageService.success('Camera updated successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  // Reports
  uploadReportHistoryDtoList(reportHistoryDto: ReportHistoryDto){
    this.selectedHardwareDetail.update(curr => {
      if(curr === null) return curr;
      return {
        ...curr,
        activeReportsCount: curr.activeReportsCount + 1,
        recentActiveReports: [
          reportHistoryDto,
          ...curr?.recentActiveReports,
        ].slice(0,4)
      }
    })
  }

  // Camera Photos
  uploadCameraPhoto(hardwareId:number, photoType: string, replaceExisting:boolean, formData: FormData){
    return this.hardwareService.uploadCameraPhoto(hardwareId, photoType, replaceExisting, formData).pipe(
      tap((data:CameraDetailDto)=> this.selectedHardwareDetail.set(data)),
      tap(() => this.messageService.success('Photo updated successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  uploadSuccess(data: HardwareUnion){
    const selectedHardware = this.selectedHardwareDetail();
    if(selectedHardware === null)return;
    this.selectedHardwareDetail.set(data);
  }

  // Generation of PDF documents
  getPhotoReportByCameraId(){
    const cameraId = this.selectedHardwareId();
    if(cameraId === null) return;
    this.hardwareService.getPhotoReportByCameraId(cameraId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  getPhotoReportByBranchId(){
    const branchId  = this.currentBranchId();
    if(branchId === null) return;
    this.hardwareService.getPhotoReportByBranchId(branchId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  getTechnicalMemoryByBranchId(){
    const branchId  = this.currentBranchId();
    if(branchId === null) return;
    this.hardwareService.getTechnicalMemoryByBranchId(branchId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  getQrCodesByBranchId(){
    const branchId  = this.currentBranchId();
    if(branchId === null) return;
    this.hardwareService.getQrCodesByBranchId(branchId).subscribe({
      next: (blob: Blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank');
      },
      error: (err: HttpErrorResponse) => this.responseError(err),
    })
  }

  responseError(error: HttpErrorResponse) {
    this.notificationService.error(
      'Request Failed',
      error?.error?.message,
      {nzDuration: 0}
    )
  }
}

