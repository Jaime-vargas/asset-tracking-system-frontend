import {Component, computed, inject, signal} from '@angular/core';
import {ReportsService} from '../../services/report.service';
import {ReportTableDto} from '../../interfaces/report-dto/report-table.dto';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {RouteContextService} from '../../services/route-context.service';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzInputDirective, NzInputPrefixDirective, NzInputWrapperComponent} from 'ng-zorro-antd/input';

@Component({
  selector: 'app-reports-page',
  imports: [
    NzButtonComponent,
    NzDividerComponent,
    DasboardBoxComponent,
    NzEmptyComponent,
    NzTableComponent,
    NzThMeasureDirective,
    PriorityTagsComponent,
    SingleStatusTagsComponent,
    RouterLink,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzTypographyComponent,
    NzRowDirective,
    NzColDirective,
    NzIconDirective,
    NzInputDirective,
    NzInputPrefixDirective,
    NzInputWrapperComponent
  ],
  templateUrl: './reports-page.html',
  styleUrl: './reports-page.css',
})
export class ReportsPage {

  constructor(private reportsService: ReportsService) {
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
  filteredReports = computed(()=>{
    return this.reportView();
  })

  getReports(){
    return this.reportsService.getAllReports().subscribe({
      next: (data)=>{
        return this.reportsData.set(data); },
    })
  }
}
