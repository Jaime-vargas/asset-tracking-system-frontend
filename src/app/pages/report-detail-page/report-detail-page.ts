import {Component, computed, effect, inject, OnInit, signal, TemplateRef, ViewChild} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {ActivatedRoute} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {ReportsService} from '../../services/report.service';
import {ReportDetailDto} from '../../interfaces/report/report-detail.dto';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {DatePipe} from '@angular/common';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {NzImageModule } from 'ng-zorro-antd/image';
import {CarouselComponent} from '../../components/carousel-component/carousel-component';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';
import {UtilityService} from '../../services/utility.service';
import {CommentService} from '../../services/comment.service';
import {CommentRequestDTO} from '../../interfaces/comment-request.dto';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormControlComponent, NzFormDirective} from 'ng-zorro-antd/form';
import {NzUploadChangeParam, NzUploadComponent, NzUploadFile} from 'ng-zorro-antd/upload';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {NzPopconfirmDirective} from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {ReportStore} from '../../store/report.store';
import {finalize} from 'rxjs';
import {CommentStore} from '../../store/comment.store';
import {CommentDto} from '../../interfaces/comment.dto';
import {SidebarStore} from '../../store/sidebar.store';
import {ClientForm} from '../../components/forms/client-form/client-form';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {ReportForm} from '../../components/forms/report-form/report-form';


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
    DatePipe,
    NzInputDirective,
    CdkTextareaAutosize,
    NzImageModule,
    CarouselComponent,
    NzIconDirective,
    SingleStatusTagsComponent,
    ReactiveFormsModule,
    NzFormDirective,
    NzFormControlComponent,
    NzUploadComponent,
    NzEmptyComponent,
    NzPopconfirmDirective,
    BreadcrumbComponent,
    ClientForm,
    EditSideBar,
    ReportForm
  ],
  templateUrl: './report-detail-page.html',
  styleUrl: './report-detail-page.css',
})

export class ReportDetailPage implements OnInit {

  constructor(private apiUrlBaseService: ApiUrlBaseService,
              private utilityService: UtilityService,
              private message: NzMessageService,
              private notification: NzNotificationService) {
    this.routeContext.setFromRoute(this.route);

    effect(() => {
      const comment = this.commentStore.commentSavedTrigger();
      if (comment === null) return;
      this.reportStore.updateReportComments(comment);
    });
  }

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

  // Computed


  ngOnInit() {
    const reportId = this.routeContext.reportId();
    if (reportId === null) return;
    this.reportId = reportId;
    this.reportStore.getReportDetails(this.reportId);
  }

  /************************************************************/

  @ViewChild('errorTpl', { static: false })
  errorTpl!: TemplateRef<any>;

  // Computed
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

  // REPORT PHOTOS
  reportPhotos = computed(() =>{
    const reportPhotos = this.selectedReport()?.photos ?? [];
    return reportPhotos.map(photo => {
      return{
        ...photo,
        filePath: this.apiUrlBaseService.imageBaseUrl + photo.filePath,
      }
    });
  });

  // Form for comments
  private fb = inject(NonNullableFormBuilder);
  protected commentForm = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(255)]]
  });

  // FUNCTIONS FOR UPLOADING PHOTOS
  uploadFileList: NzUploadFile[] = [];
  uploadUrl(): string {
    return `${this.apiUrlBaseService.baseUrl}/reports/${this.routeContext.reportId()}/photos`;
  }
  onUploadChange(event: NzUploadChangeParam): void {
    let { file, fileList } = event;
    // message error uploading image
    if (file.status === 'error') {
      this.message.error(file.error.error.message);
    }
    // message success uploading image
    if (file.status === 'done') {
      this.message.success("File uploaded successfully: " + file.name);
    }
    // if there was an error, show a modal with all errors
    const stillUploading = fileList.some(f => f.status === 'uploading');
    if (!stillUploading && fileList.length > 0) {
      const filesOnError = fileList.filter(f => f.status === 'error');
      const errorList = filesOnError.map(f =>
        f.error?.error?.message || 'Error uploading file: ' + f.name
      );
      if (errorList.length > 0) {
        this.notification.template(this.errorTpl, {
          nzData: errorList,
          nzDuration: 0,
        });
      }
      this.uploadFileList = [];
    }
  }

  /************************************************************/
  openEditForm(): void {
    this.reportStore.formMode.set("edit");
    this.sidebarStore.isOpen.set(true);
  }

  closeReport() {
    this.closeButtonLoading.set(true);
    setTimeout(() => {
      this.reportStore.closeReport()?.pipe(
        finalize(() => this.closeButtonLoading.set(false)),
      ).subscribe();
    },1000)
  }

  submitComment(){
    this.commentButtonLoading.set(true);
    const comment = this.commentForm.getRawValue();
    setTimeout(()=>{
      this.commentStore.saveComment(this.reportId, comment).pipe(
        finalize(()=> this.commentButtonLoading.set(false)),
      ).subscribe({
        next: () => this.commentForm.reset(),
      });
    },1000)
  }
  /************************************************************/

}
