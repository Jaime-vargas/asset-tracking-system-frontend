import { ImportTemplate } from '../interfaces/importResponse.type';
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
import { ComputerDetailDto, ComputerRequestDto } from '../interfaces/hardware/computer.dto';
import {HttpResponse} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class HardwareService{

  private api = inject(ApiUrlBaseService);

  // TODO - implement one service depends on hardware type
  getAllHardware(): Observable<HardwareTableDto[]> {
    return this.api.get(`hardware`);
  }

  getClientHardware(clientId: number): Observable<HardwareTableDto[]> {
    return this.api.get(`clients/${clientId}/hardware`);
  }

  saveCameraForClient(clientId: number, camera: CameraRequestDto): Observable<CameraResponseDto> {
    return this.api.post(`clients/${clientId}/hardware/camera`, camera);
  }

  getHardwareByBranchId(branchId:number): Observable<HardwareTableDto[]>{
    return this.api.get(`branches/${branchId}/hardware`);
  }

  updateRelatedHardware(projectId: number, hardwareIds: number[]): Observable<HardwareTableDto[]> {
    return this.api.put(`projects/${projectId}/hardware`, { hardwareIds });
  }

  getHardwareDetail(hardwareID: number): Observable<HardwareUnion> {
    return this.api.get(`hardware/${hardwareID}`);
  }

  getHardwareReports(hardwareID: number): Observable<ReportTableDto[]>{
    return this.api.get(`hardware/${hardwareID}/reports`);
  }

  createComputer(clientId: number, computer: ComputerRequestDto): Observable<ComputerDetailDto> {
    return this.api.post(`clients/${clientId}/hardware/computer`, computer);
  }

  getComputer(id: number): Observable<ComputerDetailDto> {
    return this.api.get(`hardware/${id}/computer`);
  }

  updateComputer(id: number, computer: ComputerRequestDto): Observable<ComputerDetailDto> {
    return this.api.put(`hardware/${id}/computer`, computer);
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

  exportClientHardware(clientId: number, format: string, tagId: number | null): Observable<HttpResponse<Blob>> {
    return this.api.getMultipartXLS(`clients/${clientId}/hardware/export/${format}${tagId === null ? '' : '?tagId=' + tagId}`);
  }

  getClientImportTemplate(clientId: number): Observable<HttpResponse<Blob>> {
    return this.api.getMultipartXLS(`clients/${clientId}/hardware/import-template`);
  }

  importClientCameras(clientId: number, tagId: number, file: File): Observable<ImportTemplate> {
    const body = new FormData();
    body.append('file', file);
    return this.api.post(`clients/${clientId}/hardware/import-cameras?tagId=${tagId}`, body);
  }

  // Generation of PDF documents
  getPhotoReportByCameraId(cameraId: number):Observable<HttpResponse<Blob>>{
    return this.api.getMultipartXLS(`${cameraId}/photoReportByCameraID`)
  }

  getPhotoReportByBranchId(branchID:number): Observable<HttpResponse<Blob>>{
    return this.api.getMultipartXLS(`${branchID}/photoReport`);
  }

  getTechnicalMemoryByBranchId(branchID:number): Observable<HttpResponse<Blob>>{
    return this.api.getMultipartXLS(`${branchID}/technicalMemory`);
  }

  getQrCodesByBranchId(branchID:number):Observable<HttpResponse<Blob>>{
    return this.api.getMultipartXLS(`qr/pdf/${branchID}`);
  }
}
