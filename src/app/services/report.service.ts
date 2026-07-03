import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ReportTableDto} from '../interfaces/report/report-table.dto';
import {ReportDetailDto} from '../interfaces/report/report-detail.dto';
import {PhotoDto} from '../interfaces/photo.dto';
import {ReportHistoryDto} from '../interfaces/report/report-history.dto';
import {ReportRequestDto} from '../interfaces/report/report-request.dto';
import {ReportResponseDto} from '../interfaces/report/report-response.dto';

@Injectable({providedIn: 'root'})
export class ReportsService {

  constructor(private api: ApiUrlBaseService) {
  }

  getAllReports(): Observable<ReportTableDto[]>{
    return this.api.get(`reports`);
  }

  getReportById(reportId: number): Observable<ReportDetailDto>{
    return this.api.get(`reports/${reportId}`);
  }

  postReportByHardwareId(hardwareId: number, reportRequest: ReportRequestDto): Observable<ReportHistoryDto>{
    return this.api.post(`hardware/${hardwareId}/reports`, reportRequest);
  }

  updateReportByReportId(reportId: number, reportRequest: ReportRequestDto):Observable<ReportResponseDto>{
    return this.api.put(`reports/${reportId}`, reportRequest);
  }

  closeReport(reportId: number): Observable<void>{
    return this.api.put(`reports/${reportId}/close`, reportId);
  }

}
