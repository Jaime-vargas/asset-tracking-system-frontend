import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  SearchOutline,
  PlusOutline,
  TeamOutline,
  EditOutline,
} from '@ant-design/icons-angular/icons';
import { AuthService } from '../../services/auth-service';
import { RecentClientsService } from '../../services/recent-clients.service';
import { ClientsPage } from './clients-page';
import { ClientStore } from '../../store/client.store';
import { SidebarStore } from '../../store/sidebar.store';
import { ClientTableDto } from '../../interfaces/client-table.dto';

describe('Client directory', () => {
  const clients = [
    { id: 1, name: 'Yazaki', totalHardware: 15, branches: 3, reportsActive: [{ reportId: 1 }] },
    { id: 2, name: 'Acme', totalHardware: 2, branches: 1, reportsActive: [] },
  ] as ClientTableDto[];
  const getUserRole = vi.fn();
  const getIds = vi.fn<() => number[]>();
  let store: {
    clientList: ReturnType<typeof signal<ClientTableDto[]>>;
    selectedClient: ReturnType<typeof signal<ClientTableDto | null>>;
    formMode: ReturnType<typeof signal<string | null>>;
    selectedClientImage: ReturnType<typeof signal<string | null>>;
    clientPhotoUrl: ReturnType<typeof signal<string | null>>;
    tableLoading: ReturnType<typeof signal<boolean>>;
    loadError: ReturnType<typeof signal<boolean>>;
    loadClients: ReturnType<typeof vi.fn>;
  };
  beforeEach(async () => {
    getUserRole.mockReturnValue('USER');
    getIds.mockReturnValue([]);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    store = {
      clientList: signal([...clients]),
      selectedClient: signal<ClientTableDto | null>(null),
      formMode: signal<string | null>(null),
      selectedClientImage: signal<string | null>(null),
      clientPhotoUrl: signal<string | null>(null),
      tableLoading: signal(false),
      loadError: signal(false),
      loadClients: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ClientsPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons([SearchOutline, PlusOutline, TeamOutline, EditOutline]),
        { provide: ClientStore, useValue: store },
        { provide: AuthService, useValue: { getUserRole } },
        { provide: RecentClientsService, useValue: { getIds } },
      ],
    }).compileComponents();
  });
  it('searches names, sorts equipment and filters open reports without changing the stored order', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.filteredClients().map((client) => client.id)).toEqual([2, 1]);
    page.sort.set('hardware');
    expect(page.filteredClients().map((client) => client.id)).toEqual([1, 2]);
    page.onlyOpenReports.set(true);
    expect(page.filteredClients().map((client) => client.id)).toEqual([1]);
    page.clientNameFilter.set(' ACME ');
    expect(page.filteredClients()).toEqual([]);
    page.onlyOpenReports.set(false);
    expect(page.filteredClients().map((client) => client.id)).toEqual([2]);
    expect(store.clientList().map((client) => client.id)).toEqual([1, 2]);
  });
  it('keeps workspace navigation and admin creation without an edit action on cards', () => {
    getUserRole.mockReturnValue('ADMIN');
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector(
      'a[aria-label="Open Yazaki"]',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/clients/1/yazaki');
    expect(fixture.nativeElement.querySelector('button[aria-label="Edit Yazaki"]')).toBeNull();
    fixture.componentInstance.openNewSidebar();
    expect(store.selectedClient()).toBeNull();
    expect(store.formMode()).toBe('add');
    expect(TestBed.inject(SidebarStore).isOpen()).toBe(true);
  });
  it('prioritizes visits and hides client creation for regular users', () => {
    getIds.mockReturnValue([1]);
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredClients().map((client) => client.id)).toEqual([1, 2]);
    expect(fixture.nativeElement.querySelector('.add-client')).toBeNull();
    fixture.componentInstance.openNewSidebar();
    expect(store.formMode()).toBeNull();
  });
  it('shows retry when loading fails instead of presenting an empty directory', () => {
    const fixture = TestBed.createComponent(ClientsPage);
    store.loadError.set(true);
    store.clientList.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Clients could not be loaded');
    const retry = [
      ...(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>),
    ].find((button) => button.textContent?.includes('Try again'))!;
    retry.click();
    expect(store.loadClients).toHaveBeenCalledTimes(2);
  });
});
