import {Component, computed, input} from '@angular/core';
import {ReportCountDTO} from '../../interfaces/report/report-count.dto';
import { UiTag } from '../ui-tag/ui-tag';

@Component({
  selector: 'app-report-count-tags-component',
  imports: [
    UiTag
  ],
  templateUrl: './report-count-tags-component.html',
  styleUrl: './report-count-tags-component.css',
})
export class ReportCountTagsComponent {
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
    this.activeReportCount().activeReports > 0 ? 'GOLD' : null);
  tagOverdueColor= computed(() =>
    this.activeReportCount().overdueReports > 0 ? 'RED' : null);
}
