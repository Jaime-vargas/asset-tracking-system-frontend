import { OfflineProjectComponent } from '../../components/offline-project/offline-project';
import { DatePipe } from '@angular/common';
import { SidebarStore } from '../../store/sidebar.store';
import { BranchForm } from '../../components/forms/branch-form/branch-form';
import { EditSideBar } from '../../components/edit-side-bar/edit-side-bar';
import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { RouteContextService } from '../../services/route-context.service';
import { BranchStore } from '../../store/branch.store';
import { ClientDocuments } from '../../components/client-documents/client-documents';
import { ProjectMaintenance } from '../../components/project-maintenance/project-maintenance';
import { ProjectReports } from '../../components/project-reports/project-reports';
import { ClientHardware } from '../../components/client-hardware/client-hardware';

@Component({
  selector: 'app-branch-hardware-device-page',
  imports: [DatePipe, BranchForm, EditSideBar, RouterLink, NzButtonModule, NzIconDirective, ClientDocuments, ClientHardware, ProjectReports, ProjectMaintenance, OfflineProjectComponent],
  templateUrl: './branch-hardware-page.html',
  styleUrl: './branch-hardware-page.css',
  providers: [SidebarStore],
})
export class BranchHardwarePage implements OnInit {
  protected readonly maintenance = viewChild(ProjectMaintenance);
  protected readonly maintenanceHardwareRevision = signal(0);

  protected refreshMaintenanceHardware() {
    this.maintenanceHardwareRevision.update(revision => revision + 1);
  }
  protected routeContext = inject(RouteContextService);
  protected branchStore = inject(BranchStore);
  protected sidebar = inject(SidebarStore);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  clientId = this.routeContext.clientId;
  currentProject = computed(() => this.branchStore.branchList().find((item) => item.id === this.routeContext.branchId()));
  projectName = computed(() => this.currentProject()?.name ?? this.routeContext.branchSlug() ?? 'Project');
  openProjectEditor() {
    const project = this.currentProject();
    if (!project) return;
    this.branchStore.selectedBranch.set(project);
    this.branchStore.formMode.set('edit');
    this.sidebar.isOpen.set(true);
  }
  ngOnInit() {
    this.routeContext.setFromRoute(this.route);
    this.branchStore.currentClientId.set(this.clientId());
    const projects = this.branchStore.loadBranches();
    this.destroyRef.onDestroy(() => {
      projects?.unsubscribe();
      this.sidebar.isOpen.set(false);
    });
  }
}
