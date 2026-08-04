import {Component, computed, inject, signal} from '@angular/core';
import {ReportsService} from '../../services/report.service';
import {ReportTableDto} from '../../interfaces/report/report-table.dto';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DashboardBoxComponent} from '../../components/dasboard-box-component/dashboard-box.component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {TableComponent} from '../../components/table-component/table-component';
import {TableData} from '../../interfaces/table/table-data';
import {TableColumnsReportsService} from '../../services/table-columns-service/table-columns-reports.service';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-reports-page',
  imports: [
    NzDividerComponent,
    DashboardBoxComponent,
    NzTypographyComponent,
    NzRowDirective,
    NzColDirective,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent,
    NzOptionComponent,
    NzSelectComponent,
    FormsModule,
    TableComponent
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage {

  constructor(private reportsService: ReportsService,
              protected tableColumnsReportsService: TableColumnsReportsService) {
    this.getReports();
  }

  reportsData = signal<ReportTableDto[]>([]);
  reportView = computed(()=>{
    return this.reportsData().map((reports) => {
      return {
        ...reports,
        createdDate: new Date(reports.createdDate),
        dueDate: new Date(reports.dueDate),
      }
    })
  });

  // TABLE DATA
  tableData = computed<TableData[]>(() => {
    return this.filteredReports().map((report) => {
      return {
        ...report,
        id: '# ' + report.id,
        actions: [
          {label: 'View', type: 'link', link:['/clients',report.clientId,report.clientName,
              'branches',report.branchId,report.branchName,
              'hardware',report.hardwareId,report.hardwareName,
              'reports',report.id]}
        ]
      }
    })
  });

  // TABLE INPUT FILTERS
  clientList = computed(()=>
    new Set(this.reportsData().map((report) =>
      report.clientName
    ))
  )
  branchList = computed(()=>{
    const clientfilter = this.clientFilter()
    return new Set(this.reportsData().filter(report =>
      (!clientfilter || report.clientName === clientfilter)).map(report =>
      report.branchName));
  })
  priorityList = computed(()=>
    new Set(this.reportsData().map((report) =>
      report.priority))
  )
  statusList = computed(()=>
    new Set(this.reportsData().map((report) =>
      report.status))
  )


  idFilter = signal<number | null>(null);
  tittleFilter = signal<string>('');
  clientFilter = signal<string>('');
  branchFilter = signal<string>('');
  hardwareFilter = signal<string>('');
  priorityFilter = signal<string>('');
  createdAtFilter = signal<string>('');
  dueDateFilter = signal<string>('');
  statusFilter = signal<string>('');
  filteredReports = computed(()=>
    this.reportView().filter(report => {
      const idFilter = this.idFilter();
      const titleFilter = this.tittleFilter();
      const clientFilter = this.clientFilter();
      const branchFilter = this.branchFilter();
      const hardwareFilter = this.hardwareFilter();
      const priorityFilter = this.priorityFilter();
      const createdDateFilter = this.createdAtFilter();
      const dueDateFilter = this.dueDateFilter();
      const statusFilter = this.statusFilter();

      const matchId = (idFilter === null || report.id.toString().includes(idFilter.toString()));
      const matchTitle = report.title.toLowerCase().includes(titleFilter.toLowerCase());
      const matchClient = (!clientFilter || report.clientName === clientFilter );
      const matchBranch = (!branchFilter || report.branchName === branchFilter);
      const matchHardware = report.hardwareName.toLowerCase().includes(hardwareFilter.toLowerCase());
      const matchPriority = (!priorityFilter || report.priority === priorityFilter);
      const matchCreatedDate = report.createdDate.toDateString().toLowerCase().includes(createdDateFilter.toLowerCase());
      const matchDueDate = report.dueDate.toDateString().toLowerCase().includes(dueDateFilter.toLowerCase());
      const matchStatus = (!statusFilter || report.status === statusFilter);

      return (matchId &&
          matchTitle &&
          matchClient &&
          matchBranch &&
          matchHardware &&
          matchPriority &&
          matchCreatedDate &&
          matchDueDate &&
          matchStatus
      );
    })
  )

  getReports(){
    return this.reportsService.getAllReports().subscribe({
      next: (data)=>{
        return this.reportsData.set(data); },
    })
  }
}
