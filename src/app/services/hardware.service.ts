import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {HardwareTableDto} from '../interfaces/hardware/hardware-table.dto';
import {ReportTableDto} from '../interfaces/report/report-table.dto';
import {HardwareUnion} from '../interfaces/hardware/hardware-union';
import {CameraResponseDto} from '../interfaces/hardware/camera/camera-response.dto';
import {CameraRequestDto} from '../interfaces/hardware/camera/camera-request.dto';
import {ClientDto} from '../interfaces/client/client.dto';
import {CameraDetailDto} from '../interfaces/camera-detail.dto';

@Injectable({providedIn: 'root'})
export class HardwareService{

  private api = inject(ApiUrlBaseService);

  // TODO - implement one service depends on hardware type
  getAllHardware(): Observable<HardwareTableDto[]> {
    return this.api.get(`hardware`);
  }

  getHardwareByBranchId(branchId:number): Observable<HardwareTableDto[]>{
    return this.api.get(`branches/${branchId}/hardware`);
  }

  getHardwareDetail(hardwareID: number): Observable<HardwareUnion> {
    return this.api.get(`hardware/${hardwareID}`);
  }

  getHardwareReports(hardwareID: number): Observable<ReportTableDto[]>{
    return this.api.get(`hardware/${hardwareID}/reports`);
  }

  // Camera endpoints
  getCameraEditData(cameraId: number): Observable<CameraResponseDto>{
    return this.api.get(`hardware/${cameraId}/camera`);
  }

  saveCamera(branchId: number, camera: CameraRequestDto): Observable<CameraResponseDto>{
    return this.api.post(`branches/${branchId}/hardware/camera`, camera);
  }

  updateCamera(cameraId: number, camera:CameraRequestDto):Observable<CameraResponseDto>{
    return this.api.put(`hardware/${cameraId}/camera`, camera);
  }

  // Photo
  // --------------------
  uploadCameraPhoto(hardwareId: number, photoType: string, replaceExisting: boolean, photo: FormData): Observable<CameraDetailDto>{
    return this.api.post(`hardware/${hardwareId}/camera/photos?photoType=${photoType}&replaceExisting=${replaceExisting}`, photo);
  }

  getUploadCameraPhotoUrl(hardwareId: number, photoType: string){
    return `${this.api.baseUrl}/hardware/${hardwareId}/camera/photos?photoType=${photoType}`
  }

  // Generation of PDF documents
  getPhotoReportByCameraId(cameraId: number):Observable<Blob>{
    return this.api.getMultipart(`${cameraId}/photoReportByCameraID`)
  }

  getPhotoReportByBranchId(branchID:number): Observable<Blob>{
    return this.api.getMultipart(`${branchID}/photoReport`);
  }

  getTechnicalMemoryByBranchId(branchID:number): Observable<Blob>{
    return this.api.getMultipart(`${branchID}/technicalMemory`);
  }

  getQrCodesByBranchId(branchID:number):Observable<Blob>{
    return this.api.getMultipart(`jwt/qr/pdf/${branchID}`);
  }

}
