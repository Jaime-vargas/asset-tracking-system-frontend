import {DatePipe} from '@angular/common';
import {Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {RouterLink} from '@angular/router';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon';
import { HardwareInventoryCard } from '../../components/hardware-inventory-card/hardware-inventory-card';
import { AuthService } from '../../services/auth-service';
import {ClientService} from '../../services/client.service';
import {RecentClientsService} from '../../services/recent-clients.service';
import {DashboardService} from '../../services/dashboard.service';
import {ApiUrlBaseService} from '../../services/api-url-base.service';
import {UtilityService} from '../../services/utility.service';
import {DashboardDataDto} from '../../interfaces/dashboard-data.dto';
import {ClientDashboardDto} from '../../interfaces/client-dashboard.dto';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, NzButtonComponent, NzIconModule, PriorityTagsComponent, SingleStatusTagsComponent, HardwareInventoryCard],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected readonly fullName = inject(AuthService)
    .getAllUserDataOnToken(localStorage.getItem('token'))?.fullName?.trim();
  private clientService = inject(ClientService);
  private recentIds = inject(RecentClientsService).getIds();
  private recentClients = signal<ClientDashboardDto[]>([]);
  private dashboardService = inject(DashboardService);
  private api = inject(ApiUrlBaseService);
  private destroyRef = inject(DestroyRef);
  protected utility = inject(UtilityService);
  data = signal<DashboardDataDto | null>(null);
  loading = signal(false);
  loadError = signal(false);
  updatedAt = signal<Date | null>(null);
  private failedImages = signal(new Set<string>());

  metrics = computed(() => {
    const data = this.data();
    return [
      {label: 'Open reports', value: data?.openReports, icon: 'file-text', tone: 'primary', hint: 'Reports awaiting resolution'},
      {label: 'Overdue reports', value: data?.overdueReports, icon: 'clock-circle', tone: data?.overdueReports ? 'warning' : 'neutral', hint: 'Open reports past their due date'},
      {label: 'Equipment', value: data?.totalHardware, icon: 'desktop', tone: 'neutral', hint: 'Across all client sites'},
      {label: 'Clients', value: data?.totalClients, icon: 'apartment', tone: 'neutral', hint: 'Client workspaces'},
    ];
  });
  recentReports = computed(() => (this.data()?.recentReports ?? []).map(report => {
    const date = new Date(report.dueDate);
    return {...report, dueDate: report.dueDate && !Number.isNaN(date.getTime()) ? date : null};
  }));
  clients = computed(() => {
    const recent = this.recentClients();
    const visited = new Set(recent.map(client => client.id));
    const suggestions = (this.data()?.clients ?? []).filter(client => !visited.has(client.id));
    return [...recent, ...suggestions].slice(0, 4);
  });
  inventory = computed(() => [
    {label: 'Cameras', icon: 'video-camera', count: this.data()?.totalCameras ?? 0, type: 'Camera'},
    {label: 'Switches', icon: 'apartment', count: this.data()?.totalSwitches ?? 0, type: 'Switch'},
    {label: 'Servers', icon: 'desktop', count: this.data()?.totalComputers ?? 0, type: 'Computer'},
  ]);
  constructor() {
    this.getDashboardData();
    if (this.recentIds.length) {
      this.clientService.getClients().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: clients => {
          const byId = new Map(clients.map(client => [client.id, client]));
          this.recentClients.set(this.recentIds.flatMap(id => byId.get(id) ?? []).slice(0, 4));
        },
        error: () => this.recentClients.set([]),
      });
    }
  }
  getDashboardData() {
    if (this.loading()) return;
    this.loading.set(true);
    this.loadError.set(false);
    this.dashboardService.getDashboardData().pipe(takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false))).subscribe({
      next: data => { this.data.set(data); this.updatedAt.set(new Date()); },
      error: () => this.loadError.set(true),
    });
  }
  clientLink(client: ClientDashboardDto) { return ['/clients', client.id, this.utility.slugify(client.name)]; }
  initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '?'; }
  photoUrl(client: ClientDashboardDto) {
    const url = client.photo?.filePath ? this.api.imageBaseUrl + client.photo.filePath : null;
    return url && !this.failedImages().has(url) ? url : null;
  }
  imageFailed(url: string) { this.failedImages.update(previous => new Set([...previous, url])); }
}
