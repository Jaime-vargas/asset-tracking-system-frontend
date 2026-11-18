import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  SaveOutline,
  EditOutline,
  InfoCircleOutline,
  InboxOutline,
} from '@ant-design/icons-angular/icons';
import { ClientForm } from './client-form';
import { ClientStore } from '../../../store/client.store';
import { SidebarStore } from '../../../store/sidebar.store';
import { ClientTableDto } from '../../../interfaces/client-table.dto';

describe('Client profile editing', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    await TestBed.configureTestingModule({
      imports: [ClientForm],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNzIcons([SaveOutline, EditOutline, InfoCircleOutline, InboxOutline]),
        { provide: NzNotificationService, useValue: { error: vi.fn() } },
        { provide: NzMessageService, useValue: { success: vi.fn() } },
      ],
    }).compileComponents();
  });
  function createForm() {
    const store = TestBed.inject(ClientStore);
    const sidebar = TestBed.inject(SidebarStore);
    const client = {
      id: 9,
      name: 'Yazaki',
      totalHardware: 15,
      branches: 2,
      reportsActive: [],
      photo: null,
    } as unknown as ClientTableDto;
    store.clientList.set([client]);
    store.summary.set({ id: 9, name: 'Yazaki' });
    store.selectedClient.set(client);
    store.formMode.set('edit');
    sidebar.isOpen.set(true);
    const fixture = TestBed.createComponent(ClientForm);
    fixture.detectChanges();
    return { fixture, store, sidebar, http: TestBed.inject(HttpTestingController) };
  }
  it('updates the header data and closes only after a successful response', () => {
    const { fixture, store, sidebar, http } = createForm();
    fixture.componentInstance.editRequest({ name: 'Yazaki Colima' });
    expect(sidebar.isOpen()).toBe(true);
    expect(fixture.componentInstance.saving()).toBe(true);
    http
      .expectOne('/api/v1/clients/9')
      .flush({ id: 9, name: 'Yazaki Colima' });
    expect(store.summary()?.name).toBe('Yazaki Colima');
    expect(store.clientList()[0].name).toBe('Yazaki Colima');
    expect(sidebar.isOpen()).toBe(false);
    expect(fixture.componentInstance.saving()).toBe(false);
    http.verify();
  });
  it('keeps the profile editor open when the update fails', () => {
    const { fixture, store, sidebar, http } = createForm();
    fixture.componentInstance.editRequest({ name: 'Changed name' });
    http
      .expectOne('/api/v1/clients/9')
      .flush({ message: 'Cannot save' }, { status: 409, statusText: 'Conflict' });
    expect(sidebar.isOpen()).toBe(true);
    expect(store.selectedClient()?.id).toBe(9);
    expect(store.summary()?.name).toBe('Yazaki');
    expect(fixture.componentInstance.saving()).toBe(false);
    http.verify();
  });
});
