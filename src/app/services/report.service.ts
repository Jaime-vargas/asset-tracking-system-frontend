import {inject, Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ReportTableDto} from '../interfaces/report/report-table.dto';
import {ReportDetailDto} from '../interfaces/report/report-detail.dto';
import {FileEntityDto} from '../interfaces/fileEntityDto';
import {ReportHistoryDto} from '../interfaces/report/report-history.dto';
import {ReportRequestDto} from '../interfaces/report/report-request.dto';
import {ReportResponseDto} from '../interfaces/report/report-response.dto';

@Injectable({providedIn: 'root'})
export class ReportsService {
  apiService = inject(ApiUrlBaseService)

  getAllReports(): Observable<ReportTableDto[]>{
    return this.apiService.get(`reports`);
  }

  getReportById(reportId: number): Observable<ReportDetailDto>{
    return this.apiService.get(`reports/${reportId}`);
  }

  postReportByHardwareId(hardwareId: number, reportRequest: ReportRequestDto): Observable<ReportHistoryDto>{
    return this.apiService.post(`hardware/${hardwareId}/reports`, reportRequest);
  }

  updateReportByReportId(reportId: number, reportRequest: ReportRequestDto):Observable<ReportResponseDto>{
    return this.apiService.put(`reports/${reportId}`, reportRequest);
  }

  closeReport(reportId: number): Observable<void>{
    return this.apiService.put(`reports/${reportId}/close`, reportId);
  }

  // Photos
  getUploadPhotoReportUrl(reportId:number){
    return `${this.apiService.baseUrl}/reports/${reportId}/photos`;
  }

  deleteReportPhoto(reportId:number, photoId:number){
    return this.apiService.delete(`reports/${reportId}/photos/${photoId}`);
  }

}
