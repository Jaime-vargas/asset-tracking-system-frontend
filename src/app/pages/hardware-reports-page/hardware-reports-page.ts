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
    SingleStatusTagsComponent
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

  filteredReports = computed(()=>
    this.reportsView()
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
