import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {RouteContextService} from '../../services/route-context.service';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzEmptyComponent} from 'ng-zorro-antd/empty';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {HardwareService} from '../../services/hardware.service';
import {ReportTableDto} from '../../interfaces/report-table.dto';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {StatusTagsComponent} from '../../components/status-tags-component/status-tags-component';

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
    StatusTagsComponent
  ],
  templateUrl: './hardware-reports-page.html',
  styleUrl: './hardware-reports-page.css',
})
export class HardwareReportsPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  routeContext = inject(RouteContextService)

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
