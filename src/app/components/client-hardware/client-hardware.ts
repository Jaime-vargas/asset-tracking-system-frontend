import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { EditSideBar } from '../edit-side-bar/edit-side-bar';
import { CameraForm } from '../forms/camera-form/camera-form.component';
import { HardwareStore } from '../../store/hardware.store';
import { SidebarStore } from '../../store/sidebar.store';
import { TagStore } from '../../store/tag.store';
import { ListPagination } from '../list-pagination/list-pagination';
@Component({
  selector: 'app-client-hardware',
  imports: [
    RouterLink,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzIconDirective,
    EditSideBar,
    CameraForm,
    ListPagination,
  ],
  templateUrl: './client-hardware.html',
  styleUrl: './client-hardware.css',
  providers: [HardwareStore, SidebarStore, TagStore],
})
export class ClientHardware {
  clientId = input.required<number>();
  protected store = inject(HardwareStore);
  protected sidebar = inject(SidebarStore);
  protected tags = inject(TagStore);
  search = signal('');
  siteFilter = signal<number | null>(null);
  page = signal(1);
  readonly pageSize = 8;
  filteredHardware = computed(() =>
    this.store
      .hardwareList()
      .filter(
        (hardware) =>
          (this.siteFilter() === null || hardware.tagId === this.siteFilter()) &&
          [hardware.name, hardware.model, hardware.serialNumber].some((value) =>
            (value ?? '').toLowerCase().includes(this.search().trim().toLowerCase()),
          ),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
  currentPage = computed(() =>
    Math.min(this.page(), Math.max(1, Math.ceil(this.filteredHardware().length / this.pageSize))),
  );
  visibleHardware = computed(() =>
    this.filteredHardware().slice(
      (this.currentPage() - 1) * this.pageSize,
      this.currentPage() * this.pageSize,
    ),
  );
  constructor() {
    effect(() => {
      this.search();
      this.siteFilter();
      this.page.set(1);
    });
    effect((onCleanup) => {
      this.store.currentClientId.set(this.clientId());
      this.store.currentBranchId.set(null);
      this.store.hardwareList.set([]);
      const hardware = this.store.loadHardware();
      const tags = this.tags.loadTags(this.clientId()).subscribe();
      onCleanup(() => {
        hardware?.unsubscribe();
        tags.unsubscribe();
      });
    });
  }
  clearFilters() {
    this.search.set('');
    this.siteFilter.set(null);
  }
  openNew() {
    this.store.selectedHardware.set(null);
    this.store.formMode.set('add');
    this.sidebar.isOpen.set(true);
  }
  openEdit(hardwareId: number) {
    this.store.selectedHardware.set(null);
    this.store.formMode.set('edit');
    this.store.getCameraEditData(hardwareId);
    this.sidebar.isOpen.set(true);
  }
}
