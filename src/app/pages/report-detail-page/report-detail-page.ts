import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {ActivatedRoute} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {NzImageModule } from 'ng-zorro-antd/image';
import {CarouselComponent} from '../../components/carousel-component/carousel-component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';
import {UtilityService} from '../../services/utility.service';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormControlComponent, NzFormDirective} from 'ng-zorro-antd/form';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {ReportStore} from '../../store/report.store';
import {finalize} from 'rxjs';
import {CommentStore} from '../../store/comment.store';
import {SidebarStore} from '../../store/sidebar.store';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {ReportForm} from '../../components/forms/report-form/report-form';
import {UploadButtonComponent} from '../../components/upload-button-component/upload-button-component';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-report-detail-page',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    NzFlexDirective,
    DashboardBoxComponent,
    NzTypographyComponent,
    NzRowDirective,
    NzColDirective,
    PriorityTagsComponent,
    NzAvatarComponent,
    NzInputDirective,
    CdkTextareaAutosize,
    NzImageModule,
    CarouselComponent,
    NzIconDirective,
    SingleStatusTagsComponent,
    ReactiveFormsModule,
    NzFormDirective,
    NzFormControlComponent,
    NzEmptyComponent,
    NzPopconfirmDirective,
    BreadcrumbComponent,
    EditSideBar,
    ReportForm,
    UploadButtonComponent,
    DatePipe
  ],
  templateUrl: './report-detail-page.html',
  styleUrl: './report-detail-page.css',
})

export class ReportDetailPage implements OnInit {

  private apiUrlBaseService = inject(ApiUrlBaseService);
  private utilityService = inject(UtilityService);

  /************************************************************/

  private commentStore = inject(CommentStore);
  private reportStore = inject(ReportStore);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private routeContext = inject(RouteContextService);
  private sidebarStore = inject(SidebarStore);

  closeButtonLoading = signal<boolean>(false);
  commentButtonLoading = signal<boolean>(false);
  openSideBar = this.sidebarStore.isOpen;
  selectedReport = this.reportStore.selectedReport;

  reportId!: number

  constructor() {
    effect(() => {
      const comment = this.commentStore.commentSavedTrigger();
      if (comment === null) return;
      this.reportStore.updateReportComments(comment);
    });
  }

  ngOnInit() {
    this.routeContext.setFromRoute(this.route);

    const reportId = this.routeContext.reportId();
    if (reportId === null) return;
    this.reportId = reportId;
    this.reportStore.getReportDetails(this.reportId);
  }

  // Breadcrumb
  breadcrumb = computed<{label:string | number | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches',this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware']},
      {label: this.routeContext.hardwareSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches', this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware', this.routeContext.hardwareId(), this.routeContext.hardwareSlug()]},
      {label: 'Reports',
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches', this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware', this.routeContext.hardwareId(), this.routeContext.hardwareSlug(), 'reports']},
      {label: this.routeContext.reportId()}
    ]);

  // Photo
  uploadUrl(): string {
    return this.reportStore.getUploadPhotoReportUrl(this.reportId);
  }

  uploadSuccessPhoto(){
    this.reportStore.getReportDetails(this.reportId);
  }

  deletePhoto(photoId: number) {
    this.reportStore.deleteReportPhoto(this.reportId, photoId).subscribe({
      next: () => {
        this.selectedReport.update(curr => {
          if (!curr) return curr;
          return {
            ...curr,
            photos: curr.photos.filter(photo => photo.id !== photoId)
          }
        })
      }
    })
  }

  // Form
  openEditForm(): void {
    this.reportStore.formMode.set("edit");
    this.sidebarStore.isOpen.set(true);
  }

  // Report
  closeReport() {
    this.closeButtonLoading.set(true);
    this.reportStore.closeReport()?.pipe(
      finalize(() => this.closeButtonLoading.set(false)),
    ).subscribe();
  }

  // Comment
  // Form for comments
  private fb = inject(NonNullableFormBuilder);
  protected commentForm = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(255)]]
  });

  submitComment(){
    this.commentButtonLoading.set(true);
    const comment = this.commentForm.getRawValue();
    this.commentStore.saveComment(this.reportId, comment).pipe(
      finalize(()=> this.commentButtonLoading.set(false)),
    ).subscribe({
      next: () => this.commentForm.reset(),
    });
  }

  // Computed
  reportDetailsView = computed(() => {
    const report = this.selectedReport();
    if (!report) return [];
    const dueDate = this.utilityService.validLongDate(report.dueDate);
    const createdAt = this.utilityService.validLongDate(report.createdAt);
    const updatedAt = this.utilityService.validLongDate(report.updatedAt);
    const closedAt = this.utilityService.validLongDate(report.closedAt);
    const isClosed = () =>
      report.status ? { label:"Last Update", value: updatedAt} :
        { label:"Closed At", value: closedAt};
    return [
      {label: "Hardware", value: report.hardwareName, type: "text"},
      {label: "Created by", value: report.reportedBy, type: "text"},
      {label: "Created At", value: createdAt, type: "text"},
      {label: "Priority", value: report.priority, type: "priority"},
      {label: "Due Date", value: dueDate, type: "text"},
      {label: "Status", value: report.status, type: "status"},
      {label: isClosed().label, value: isClosed().value, type: "text"},
    ]
  })

  // List of photos
  reportPhotos = computed(() =>{
    const reportPhotos = this.selectedReport()?.photos ?? [];
    return reportPhotos.map(photo => {
      return{
        ...photo,
        filePath: this.apiUrlBaseService.imageBaseUrl + photo.filePath,
      }
    });
  });
}
