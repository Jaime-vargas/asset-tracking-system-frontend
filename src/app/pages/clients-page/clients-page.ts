import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ClientTableDto } from '../../interfaces/client-table.dto';
import { UtilityService } from '../../services/utility.service';
import { ApiUrlBaseService } from '../../services/api-url-base.service';
import { EditSideBar } from '../../components/edit-side-bar/edit-side-bar';
import { ClientForm } from '../../components/forms/client-form/client-form';
import { SidebarStore } from '../../store/sidebar.store';
import { ClientStore } from '../../store/client.store';
import { AuthService } from '../../services/auth-service';
import { RecentClientsService } from '../../services/recent-clients.service';
import { ListPagination } from '../../components/list-pagination/list-pagination';
@Component({
  selector: 'app-clients-page',
  imports: [
    RouterLink,
    FormsModule,
    NzButtonComponent,
    NzIconDirective,
    NzInputModule,
    EditSideBar,
    ClientForm,
    ListPagination,
  ],
  templateUrl: './clients-page.html',
  styleUrl: './clients-page.css',
})
export class ClientsPage implements OnInit {
  protected clientStore = inject(ClientStore);
  private sidebarStore = inject(SidebarStore);
  private utility = inject(UtilityService);
  private imageBase = inject(ApiUrlBaseService).imageBaseUrl;
  openSideBar = this.sidebarStore.isOpen;
  clientNameFilter = signal('');
  protected isAdmin = inject(AuthService).getUserRole() === 'ADMIN';
  private recentRanks = new Map(inject(RecentClientsService).getIds().map((id, index) => [id, index]));
  sort = signal('recent');
  onlyOpenReports = signal(false);
  private failedImages = signal<Set<string>>(new Set());
  page = signal(1);
  readonly pageSize = 12;
  totals = computed(() =>
    this.clientStore.clientList().reduce(
      (total, client) => ({
        hardware: total.hardware + client.totalHardware,
        reports: total.reports + client.reportsActive.length,
      }),
      { hardware: 0, reports: 0 },
    ),
  );
  filteredClients = computed(() =>
    this.clientStore
      .clientList()
      .filter(
        (client) =>
          client.name.toLowerCase().includes(this.clientNameFilter().trim().toLowerCase()) &&
          (!this.onlyOpenReports() || client.reportsActive.length > 0),
      )
      .sort((a, b) => {
        if (this.sort() === 'recent') {
          const aRank = this.recentRanks.get(a.id) ?? this.recentRanks.size;
          const bRank = this.recentRanks.get(b.id) ?? this.recentRanks.size;
          return aRank - bRank || a.name.localeCompare(b.name);
        }
        const difference =
          this.sort() === 'hardware'
            ? b.totalHardware - a.totalHardware
            : this.sort() === 'reports'
              ? b.reportsActive.length - a.reportsActive.length
              : 0;
        return difference || a.name.localeCompare(b.name);
      }),
  );
  currentPage = computed(() =>
    Math.min(this.page(), Math.max(1, Math.ceil(this.filteredClients().length / this.pageSize))),
  );
  visibleClients = computed(() =>
    this.filteredClients().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  constructor() {
    effect(() => {
      this.clientNameFilter();
      this.sort();
      this.onlyOpenReports();
      this.page.set(1);
    });
  }
  ngOnInit() {
    this.clientStore.loadClients();
  }
  clientLink(client: ClientTableDto) {
    return ['/clients', client.id, this.utility.slugify(client.name)];
  }
  initials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }
  photoUrl(client: ClientTableDto) {
    const path = client.photo?.filePath;
    const url = path ? this.imageBase + path : null;
    return url && !this.failedImages().has(url) ? url : null;
  }
  imageFailed(url: string) {
    this.failedImages.update((previous) => new Set([...previous, url]));
  }
  clearFilters() {
    this.clientNameFilter.set('');
    this.onlyOpenReports.set(false);
  }
  openNewSidebar() {
    if (!this.isAdmin) return;
    this.clientStore.selectedClient.set(null);
    this.clientStore.formMode.set('add');
    this.openSideBar.set(true);
  }
}
