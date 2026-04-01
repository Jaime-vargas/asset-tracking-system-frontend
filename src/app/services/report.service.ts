import {Injectable} from '@angular/core';
import {ApiUrlBaseService} from './api-url-base.service';
import {Observable} from 'rxjs';
import {ReportTableDto} from '../interfaces/report-dto/report-table.dto';
import {ReportDetailDto} from '../interfaces/report-dto/report-detail.dto';

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
}
