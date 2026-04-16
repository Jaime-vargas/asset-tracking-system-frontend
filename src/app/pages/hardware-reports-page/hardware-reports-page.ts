import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {HardwareService} from '../../services/hardware.service';
import {ReportTableDto} from '../../interfaces/report-dto/report-table.dto';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FormsModule} from '@angular/forms';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';

@Component({
  selector: 'app-hardware-reports-page',
  imports: [
    NzButtonComponent,
    RouterLink,
    DasboardBoxComponent,
    NzEmptyComponent,
    NzTableComponent,
    NzThMeasureDirective,
    NzDividerComponent,
    PriorityTagsComponent,
    SingleStatusTagsComponent,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzRowDirective,
    NzColDirective,
    FormsModule,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzOptionComponent,
    NzSelectComponent
  ],
  templateUrl: './hardware-reports-page.html',
  styleUrl: './hardware-reports-page.css',
})
export class HardwareReportsPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext: RouteContextService = inject(RouteContextService)

  constructor(private hardwareService: HardwareService) {
    this.routeContext.setFromRoute(this.route);
    this.getHardwareReports();
  }

  reportsData = signal<ReportTableDto[]>([]);
  reportsView = computed(()=>
    this.reportsData().map((report) => {
      return {
        ...report,
        createdDate: new Date(report.createdDate),
        dueDate: new Date(report.dueDate),
      }
    })
  );

  // FILTERS FOR SEARCH REPORTS
  // LISTS FOR NZ-SELECT
  priorityList = computed(() =>
    new Set(this.reportsView().map((report) => {
      return report.priority;
    }))
  );
  statusList = computed(() =>
    new Set (this.reportsView().map((report) =>{
      return report.status;
    }))
  );

  // SIGNALS FOR FILTERS
  idFilter = signal<number | null>(null);
  titleFilter = signal<string>("");
  priorityFilter = signal("");
  createdAtFilter = signal<string>("");
  dueDateFilter = signal<string>("");
  statusFilter = signal("");
  reportsFilter = computed(()=>
    this.reportsView().filter(report => {
      return (
        (this.idFilter() === null || report.id === this.idFilter()) &&
        report.title.toLowerCase().includes(this.titleFilter().toLowerCase()) &&
        (!this.priorityFilter() || report.priority === this.priorityFilter()) &&
        report.createdDate.toDateString().toLowerCase().includes(this.createdAtFilter().toLowerCase()) &&
        report.dueDate.toDateString().toLowerCase().includes(this.dueDateFilter().toLowerCase()) &&
        (!this.statusFilter() || report.status === this.statusFilter())
      );
    })
  );

  hardwareId = computed(()=> this.routeContext.hardwareId() ?? 0);
  getHardwareReports(){
    this.hardwareService.getHardwareReports(this.hardwareId()).subscribe({
      next: data => {
        this.reportsData.set(data);
      }
    })
  }
}
