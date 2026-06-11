import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {HardwareService} from '../../services/hardware.service';
import {ReportTableDto} from '../../interfaces/report/report-table.dto';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {FormsModule} from '@angular/forms';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {BreadcrumbComponent} from '../../components/breadcrumb-component/breadcrumb-component';
import {TableData} from '../../interfaces/table/table-data';
import {TableComponent} from '../../components/table-component/table-component';
import {TableColumnsHardwareReportsService} from '../../services/table-columns-service/table-columns-hardware-reports.service';

@Component({
  selector: 'app-hardware-reports-page',
  imports: [
    NzButtonComponent,
    DasboardBoxComponent,
    NzDividerComponent,
    NzRowDirective,
    NzColDirective,
    FormsModule,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzOptionComponent,
    NzSelectComponent,
    BreadcrumbComponent,
    TableComponent
  ],
  templateUrl: './hardware-reports-page.html',
  styleUrl: './hardware-reports-page.css',
})
export class HardwareReportsPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext: RouteContextService = inject(RouteContextService)

  constructor(private hardwareService: HardwareService,
              protected tableHardwareReportsService: TableColumnsHardwareReportsService) {
    this.routeContext.setFromRoute(this.route);
    this.getHardwareReports();
  }
  // BREADCRUMB
  breadcrumb = computed<{label:string | null, link?:(string|number|null)[]}[]>(() =>
    [{label: 'Clients',
      link: ['/clients']},
      {label: this.routeContext.clientSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug()]},
      {label: this.routeContext.branchSlug(),
        link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches',this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware']},
      {label: this.routeContext.hardwareSlug(),
      link: ['/clients', this.routeContext.clientId(), this.routeContext.clientSlug(),'branches', this.routeContext.branchId(), this.routeContext.branchSlug(),'hardware', this.routeContext.hardwareId(), this.routeContext.hardwareSlug()]},
      {label: 'Reports'}
    ]);


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

  // TABLE DATA
  tableData = computed<TableData[]>(() => {
    return this.filteredReports().map((report) => {
      return {
        ...report,
        id: "# " + report.id,
        actions: [
          {label: 'View', type: 'link', link:['/clients',report.clientId,report.clientName,
              'branches',report.branchId,report.branchName,
              'hardware',report.hardwareId,report.hardwareName,
              'reports',report.id]}
        ]
      };
    })
  });

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

  filteredReports = computed(()=>
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
