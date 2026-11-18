import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { finalize, Subscription } from 'rxjs';
import { CarouselComponent } from '../../components/carousel-component/carousel-component';
import { EditSideBar } from '../../components/edit-side-bar/edit-side-bar';
import { ReportForm } from '../../components/forms/report-form/report-form';
import { PriorityTagsComponent } from '../../components/priority-tags-component/priority-tags-component';
import { SingleStatusTagsComponent } from '../../components/single-status-tags-component/single-status-tags-component';
import { UploadButtonComponent } from '../../components/upload-button-component/upload-button-component';
import { evidencePhotoUrls } from '../../services/evidence-photo-urls';
import { ReportsService } from '../../services/report.service';
import { UtilityService } from '../../services/utility.service';
import { CommentStore } from '../../store/comment.store';
import { ReportStore } from '../../store/report.store';
import { SidebarStore } from '../../store/sidebar.store';

@Component({
  selector: 'app-report-detail-page',
  imports: [
    DatePipe, ReactiveFormsModule, RouterLink, NzButtonComponent, NzIconDirective,
    NzPopconfirmDirective, CarouselComponent, EditSideBar, ReportForm,
    PriorityTagsComponent, SingleStatusTagsComponent, UploadButtonComponent,
  ],
  templateUrl: './report-detail-page.html',
  styleUrls: ['../../styles/native-controls.css', './report-detail-page.css'],
})
export class ReportDetailPage implements OnInit {
  private utility = inject(UtilityService);
  private commentStore = inject(CommentStore);
  private reports = inject(ReportsService);
  private reportStore = inject(ReportStore);
  private sidebarStore = inject(SidebarStore);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private fb = inject(NonNullableFormBuilder);
  private reportId = 0;
  private request?: Subscription;

  protected closeButtonLoading = signal(false);
  protected commentButtonLoading = signal(false);
  protected capturedPhotoUploading = signal(false);
  protected captureError = signal('');
  protected loadError = signal(false);
  protected openSideBar = this.sidebarStore.isOpen;
  protected selectedReport = this.reportStore.selectedReport;

  protected commentForm = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(250)]],
  });

  protected reportDetailsView = computed(() => {
    const report = this.selectedReport();
    if (!report) return [];
    const date = (value: string) => value ? this.utility.validLongDate(value) : '—';
    return [
      { label: 'Created by', value: report.reportedBy || '—' },
      { label: 'Created', value: date(report.createdAt) },
      { label: 'Due date', value: date(report.dueDate) },
      report.status === 'CLOSED'
        ? { label: 'Closed', value: date(report.closedAt) }
        : { label: 'Last updated', value: date(report.updatedAt) },
    ];
  });

  private photoIds = computed(() => this.selectedReport()?.photos.map(photo => photo.id) ?? []);
  private photoUrls = evidencePhotoUrls(this.photoIds);

  protected reportPhotos = computed(() => (this.selectedReport()?.photos ?? []).map(photo => ({
    ...photo,
    filePath: this.photoUrls().get(photo.id) ?? '/defaultImgPlaceholder.png',
  })));

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.reportId = Number(params.get('reportId'));
      this.selectedReport.set(null);
      this.commentForm.reset();
      this.captureError.set('');
      this.openSideBar.set(false);
      this.loadReport();
    });
  }

  protected loadReport() {
    this.request?.unsubscribe();
    this.loadError.set(false);
    if (!Number.isSafeInteger(this.reportId) || this.reportId <= 0) {
      this.loadError.set(true);
      return;
    }
    this.request = this.reportStore.getReportDetails(this.reportId)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        error: () => this.loadError.set(true),
      });
  }

  protected uploadUrl() {
    return this.reportStore.getUploadPhotoReportUrl(this.reportId);
  }

  protected uploadSuccessPhoto() {
    this.loadReport();
  }

  protected uploadCapturedPhoto(input: HTMLInputElement) {
    const photo = input.files?.[0];
    input.value = '';
    const report = this.selectedReport();
    if (!photo || !report || report.status === 'CLOSED' || this.capturedPhotoUploading()) return;
    this.captureError.set('');
    this.capturedPhotoUploading.set(true);
    this.reports.uploadReportPhoto(report.id, photo)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.capturedPhotoUploading.set(false)))
      .subscribe({
        next: () => { if (this.reportId === report.id) this.loadReport(); },
        error: error => {
          if (this.reportId === report.id) {
            this.captureError.set(error.error?.message || 'Photo could not be uploaded. Please try again.');
          }
        },
      });
  }

  protected deletePhoto(photoId: number) {
    const reportId = this.reportId;
    this.reportStore.deleteReportPhoto(reportId, photoId)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.selectedReport.update(current =>
          current?.id === reportId ? { ...current, photos: current.photos.filter(photo => photo.id !== photoId) } : current,
        ),
      });
  }

  protected openEditForm() {
    this.reportStore.formMode.set('edit');
    this.openSideBar.set(true);
  }

  protected closeReport() {
    const request = this.reportStore.closeReport();
    if (!request || this.closeButtonLoading()) return;
    const reportId = this.reportId;
    this.closeButtonLoading.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.closeButtonLoading.set(false)))
      .subscribe({ next: () => { if (this.reportId === reportId) this.loadReport(); } });
  }

  protected submitComment() {
    const text = this.commentForm.controls.text.value.trim();
    if (!text || this.commentForm.invalid || this.commentButtonLoading()) return;
    const reportId = this.reportId;
    this.commentButtonLoading.set(true);
    this.commentStore.saveComment(reportId, { text })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.commentButtonLoading.set(false)))
      .subscribe({
        next: comment => {
          if (this.selectedReport()?.id !== reportId) return;
          this.reportStore.updateReportComments(comment);
          this.commentForm.reset();
        },
      });
  }
}
