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
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DasboardCardComponent, DasboardGreyCardComponent, DasboardBoxComponent, NzTypographyComponent, NzDividerComponent, NzFlexDirective, NzIconModule, NzTableComponent, NzGridModule, NzButtonComponent, NzThMeasureDirective, NzCellBreakWordDirective, NzTagComponent, DasboardGreyCardComponent, RouterLink, PriorityTagsComponent, SingleStatusTagsComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {

  constructor(private dashboardService:DashboardService, protected utilityService: UtilityService) {
    this.getDashboardData();
  }

  private dashboardData = signal<DashboardDataDto | undefined>(undefined);
  // TOP CARDS
  protected topCardsView = computed(() => {
    const topCards = this.dashboardData();
    if (!topCards) return [];
    return [
      {label: "Open Reports", value: topCards.openReports, color: this.utilityService.baseColors.yellow},
      {label: "Overdue Reports", value: topCards.overdueReports, color: this.utilityService.baseColors.red},
      {label: "Total hardware", value: topCards.totalHardware, color: this.utilityService.baseColors.blue},
      {label: "Active Clients", value: topCards.totalClients, color: this.utilityService.baseColors.green},
    ]
  })

  // RECENT ACTIVE REPORTS
  public recentReports = computed(() => {
    return this.dashboardData()?.recentReports.map(report   => {
      return {
        ...report,
        dueDate: new Date(report.dueDate),
      };
    }) ?? [];
  });
  // QUICK ACCESS CLIENTS
  public clients = computed(() =>
    this.dashboardData()?.clients ?? []);
  // HARDWARE OVERVIEW
  public totalCameras = computed(() =>
    this.dashboardData()?.totalCameras ?? 0);
  public totalSwitches = computed(() =>
    this.dashboardData()?.totalSwitches ?? 0);
  public totalOtherHardware = computed(() =>
    this.dashboardData()?.totalOtherHardware ?? 0);

  // SERVICE DATA REQUEST
  getDashboardData(){
    this.dashboardService.getDashboardData().subscribe({
      next: data => {
        this.dashboardData.set(data);
      }
    })
  }
}
