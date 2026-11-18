import { MultiSelectDone } from '../multi-select-done/multi-select-done';
import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { finalize } from 'rxjs';
import { ReportTableDto } from '../../interfaces/report/report-table.dto';
import { ReportsService } from '../../services/report.service';
import { PriorityTagsComponent } from '../priority-tags-component/priority-tags-component';
import { SingleStatusTagsComponent } from '../single-status-tags-component/single-status-tags-component';

@Component({
  selector: 'app-project-reports',
  imports: [MultiSelectDone, RouterLink, NzButtonModule, NzModalModule,
    PriorityTagsComponent, SingleStatusTagsComponent],
  templateUrl: './project-reports.html',
  styleUrl: './project-reports.css',
})
export class ProjectReports {
  projectId = input.required<number>();
  private api = inject(ReportsService);
  private destroyRef = inject(DestroyRef);

  protected reports = signal<ReportTableDto[]>([]);
  protected candidates = signal<ReportTableDto[]>([]);
  reportOptions = computed(() => this.candidates().map(item => ({ id: item.id, name: `#${item.id} · ${item.title} · ${item.hardwareName} · ${item.tagName}` })));
  protected selectedIds = signal<number[]>([]);
  protected loading = signal(false);
  protected loadError = signal(false);
  protected editorOpen = signal(false);
  protected loadingCandidates = signal(false);
  protected candidatesError = signal(false);
  protected saving = signal(false);
  protected saveError = signal('');

  constructor() {
    effect(onCleanup => {
      const request = this.loadReports(this.projectId());
      onCleanup(() => request.unsubscribe());
    });
  }

  protected loadReports(projectId: number) {
    this.loading.set(true);
    this.loadError.set(false);
    return this.api.getProjectReports(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: reports => this.reports.set(reports),
        error: () => this.loadError.set(true),
      });
  }

  protected openEditor() {
    this.selectedIds.set(this.reports().map(report => report.id));
    this.saveError.set('');
    this.editorOpen.set(true);
    this.loadCandidates();
  }

  protected loadCandidates() {
    this.loadingCandidates.set(true);
    this.candidatesError.set(false);
    this.api.getProjectReportCandidates(this.projectId())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingCandidates.set(false)))
      .subscribe({
        next: reports => this.candidates.set(reports),
        error: () => this.candidatesError.set(true),
      });
  }

  protected save() {
    if (this.saving() || this.loadingCandidates() || this.candidatesError()) return;
    this.saving.set(true);
    this.saveError.set('');
    this.api.updateProjectReports(this.projectId(), this.selectedIds())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.saving.set(false)))
      .subscribe({
        next: reports => {
          this.reports.set(reports);
          this.editorOpen.set(false);
        },
        error: error => this.saveError.set(error.error?.message ?? 'Could not save related reports. Please try again.'),
      });
  }
}
