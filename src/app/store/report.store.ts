import {inject, Injectable, signal} from '@angular/core';
import {ReportsService} from '../services/report.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {ReportRequestDto} from '../interfaces/report/report-request.dto';
import {catchError, EMPTY, Observable, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ReportHistoryDto} from '../interfaces/report/report-history.dto';
import {ReportDetailDto} from '../interfaces/report/report-detail.dto';
import {CommentDto} from '../interfaces/comment.dto';

@Injectable({providedIn: 'root'})
export class ReportStore{

  private messageService = inject(NzMessageService);
  private notificationService = inject(NzNotificationService);
  private reportService = inject(ReportsService);

  // Form
  public formMode = signal<"add" | "edit" | null>(null);
  public selectedHardwareId = signal<number | null>(null);
  public selectedReport = signal<ReportDetailDto|null>(null);
  public reportHistoryTrigger = signal<ReportHistoryDto | null>(null);


  // NO SERVICE LAYER
  getUploadPhotoReportUrl(reportId:number){
    return this.reportService.getUploadPhotoReportUrl(reportId);
  }

  updateReportComments(comment: CommentDto){
    this.selectedReport.update((current) => {
      if(current === null) return current;
      return {...current,
      comments: [...current.comments, comment]
      }
    })
  }

  // SERVICE LAYER
  getReportDetails(reportId: number){
    this.reportService.getReportById(reportId).subscribe({
      next: (report : ReportDetailDto) => this.selectedReport.set(report),
      error: (err: HttpErrorResponse) => this.responseError(err)
    })
  }

  saveReport(reportId: number, report: ReportRequestDto) {
    return this.reportService.postReportByHardwareId(reportId, report).pipe(
      tap(() => this.messageService.success('Report created successfully.')),
      tap((data) => this.reportHistoryTrigger.set(data)),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  updateReport(reportId: number, report: ReportRequestDto) {
    return this.reportService.updateReportByReportId(reportId, report).pipe(
      tap((reportResponse)=>{
        this.selectedReport.update(curr => {
          if(curr === null) return curr;
          return{
            ...curr,
            title: reportResponse.title,
            priority: reportResponse.priorityEnum,
            reportDetails: reportResponse.reportDetails,
            status: reportResponse.status,
            dueDate: reportResponse.dueDate
          }
        })
      }),
      tap(() => this.messageService.success('Report updated successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    )
  }

  closeReport() {
    const selectedReport = this.selectedReport();
    if (selectedReport === null) return;
    return this.reportService.closeReport(selectedReport.id).pipe(
      tap(() => this.selectedReport.update(curr => {
        if(curr === null) return curr;
        return {
          ...curr,
          status: 'CLOSED',
        }
      })),
      tap(() => this.messageService.success('Report closed successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    )
  }

  // Photos
  deleteReportPhoto(reportId: number, photoId:number) {
    return this.reportService.deleteReportPhoto(reportId, photoId).pipe(
      tap(() => this.messageService.success('Photo deleted successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    )
  }

  responseError(error: HttpErrorResponse) {
    this.notificationService.error(
      'Request Failed',
      error?.error?.message,
      {nzDuration: 0}
    )
  }
}
