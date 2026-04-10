import {Component, computed, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {ReportsService} from '../../services/report.service';
import {ReportDetailDto} from '../../interfaces/report-dto/report-detail.dto';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
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
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {CommentService} from '../../services/comment.service';
import {CommentDto} from '../../interfaces/comment.dto';
import {CommentRequestDTO} from '../../interfaces/comment-request.dto';
import {FormBuilder, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzFormControlComponent, NzFormDirective} from 'ng-zorro-antd/form';

// TYPE FOR SWITCH CASE USE INFERRING FROM TYPES
type ReportDetailItem =
  | { label: string; value: string; type: 'text' }
  | { label: string; value: string; type: 'priority' }
  | { label: string; value: boolean; type: 'status' };

@Component({
  selector: 'app-report-detail-page',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    RouterLink,
    NzFlexDirective,
    DasboardBoxComponent,
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
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    ReactiveFormsModule,
    NzFormDirective,
    NzFormControlComponent
  ],
  templateUrl: './report-detail-page.html',
  styleUrl: './report-detail-page.css',
})


export class ReportDetailPage {

  route: ActivatedRoute = inject(ActivatedRoute)
  routeContext = inject(RouteContextService)

  constructor(private commentService: CommentService, private reportsService: ReportsService, private utilityService: UtilityService) {
    this.routeContext.setFromRoute(this.route);
    this.getReportById();
  }

  testImage = ["1","2","3","4","5","6","7","8","9","10"];

  reportData = signal<ReportDetailDto | undefined>(undefined);
  reportView = computed(() => {
    const report = this.reportData();
    if (!report) return undefined;
    return {
      ...report,
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt),
      closedAt: new Date(report.closedAt),
      dueDate: new Date(report.dueDate)
    }
  });

  reportDetailsView = computed<ReportDetailItem[]>(() => {
    const report = this.reportData();
    if (!report) return [];
    const dueDate = new Date(report.dueDate).toDateString();
    const createdAt = new Date(report.createdAt).toDateString();
    const updatedAt = this.utilityService.isValidDate(report.updatedAt);
    const closedAt = this.utilityService.isValidDate(report.closedAt);
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

  reportId = computed(()=>{
    return this.routeContext.reportId() ?? 0
  });


  private fb = inject(NonNullableFormBuilder);
  protected commentForm = this.fb.group({
    text: ['', [Validators.required, Validators.maxLength(250)]]
  });
  buttonLoading = signal(false);
  submitComment(){
    this.buttonLoading.set(true);
    const comment = this.commentForm.getRawValue();
    this.postComment(comment);
    this.buttonLoading.set(false);
    this.commentForm.reset();
  }

  getReportById(){
    this.reportsService.getReportById(this.reportId()).subscribe({
      next: data => {
        this.reportData.set(data);
      }
    })
  }

  postComment(comment: CommentRequestDTO) {
    this.commentService.postComment(this.reportId(), comment).subscribe({
      next: data => {
        this.getReportById();
      }
    })
  }
}
