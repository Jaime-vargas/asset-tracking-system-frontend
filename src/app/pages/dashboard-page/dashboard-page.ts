import {Component, computed, signal} from '@angular/core';
import {DasboardCardComponent} from '../../components/dasboard-card-component/dasboard-card-component';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {NzCellBreakWordDirective, NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {DasboardGreyCardComponent} from '../../components/dasboard-grey-card-component/dasboard-grey-card-component';
import {DashboardService} from '../../services/dashboard.service';
import {DashboardDataDto} from '../../interfaces/dashboard-data.dto';
import {Observable} from 'rxjs';
import {RouterLink} from '@angular/router';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [DasboardCardComponent, DasboardGreyCardComponent, DasboardBoxComponent, NzTypographyComponent, NzDividerComponent, NzFlexDirective, NzIconModule, NzTableComponent, NzGridModule, NzButtonComponent, NzThMeasureDirective, NzCellBreakWordDirective, NzTagComponent, DasboardGreyCardComponent, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

  constructor(private dashboardService:DashboardService, protected utilityService: UtilityService) {
    this.getDashboardData();
  }
  // DASHBOARD DATA
  private dashboardData = signal<DashboardDataDto | null>(null);
  public openReports = computed(() =>
    this.dashboardData()?.openReports ?? 0);
  public overdueReports = computed(() =>
    this.dashboardData()?.overdueReports ?? 0);
  public totalHardware = computed(() =>
    this.dashboardData()?.totalHardware ?? 0);
  public totalClients = computed(() =>
    this.dashboardData()?.totalClients ?? 0);
  public recentReports = computed(() => {
    const now = new Date();
    return this.dashboardData()?.recentReports.map(rep => {
      const date = new Date(rep.dueDate);
      return {
        ...rep,
        dueDate: date.toLocaleDateString(),
        status: date < now ? "Overdue" : "Active"
      };
    }) ?? [];
  });
  public clients = computed(() =>
    this.dashboardData()?.clients ?? []);
  public totalCameras = computed(() =>
    this.dashboardData()?.totalCameras ?? 0);
  public totalSwitches = computed(() =>
    this.dashboardData()?.totalSwitches ?? 0);
  public totalOtherHardware = computed(() =>
    this.dashboardData()?.totalOtherHardware ?? 0);


  getDashboardData(){
    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.dashboardData.set(data);
      }
    })
  }

  //COLOR TAGS
  priorityColorTag(priority: string){
      if(priority === 'HIGH') return '#c72e30';
      if (priority === 'MEDIUM')return '#ec8a42';
      if (priority === 'LOW')return '#428d5b';
      else return '#CCC';
  }
  statusColorTag(status: string){
    if(status === 'Overdue') return '#c72e30';
    if (status === 'Active')return '#ec8a42';
    else return '#CCC';
  }
}
