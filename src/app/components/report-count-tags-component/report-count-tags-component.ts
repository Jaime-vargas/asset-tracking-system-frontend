import {Component, computed, input, signal} from '@angular/core';
import {ReportCountDTO} from '../../interfaces/report-dto/report-count.dto';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-report-count-tags-component',
  imports: [
    NzTagComponent
  ],
  templateUrl: './report-count-tags-component.html',
  styleUrl: './report-count-tags-component.css',
})
export class ReportCountTagsComponent {
  constructor(private utilityService: UtilityService) {
  }

  reports = input.required<ReportCountDTO[]>();
  activeReportCount = computed(() => {
    const now = new Date();
    const totalReports = this.reports().length;
    const overdueReports = this.reports().filter(report =>
      new Date(report.dueDate) < now
      ).length;
    const activeReports = totalReports - overdueReports;
    return {
      activeReports,
      overdueReports,
    };
  })
  activeReports = computed(() => this.activeReportCount().activeReports + " " + "ACTIVE");
  overdueReports = computed(() => this.activeReportCount().overdueReports + " " + "OVERDUE");

  tagActiveColor= computed(() =>
    this.activeReportCount().activeReports > 0 ? this.utilityService.baseColors.yellow : this.utilityService.baseColors.gray);
  tagOverdueColor= computed(() =>
    this.activeReportCount().overdueReports > 0 ? this.utilityService.baseColors.red : this.utilityService.baseColors.gray);
}
