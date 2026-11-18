import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {EMPTY, Subject} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NzModalService} from 'ng-zorro-antd/modal';
import {UsersPage} from './users-page';
import {UsersStore} from '../../store/users.store';
import {SidebarStore} from '../../store/sidebar.store';
import {UserEntityResponseDto} from '../../interfaces/users/user-entity-response.dto';

describe('User directory', () => {
  const users: UserEntityResponseDto[] = [
    {id: 1, fullName: 'Ana Lopez', username: 'alopez', role: 'Administrator', active: true},
    {id: 2, fullName: 'Luis Garcia', username: 'lgarcia', role: 'Standard User', active: false},
    {id: 3, fullName: 'Maria Ruiz', username: 'mruiz', role: 'Standard User', active: true},
  ];
  let store: {
    usersList: ReturnType<typeof signal<UserEntityResponseDto[]>>;
    selectedUser: ReturnType<typeof signal<UserEntityResponseDto | null>>;
    formMode: ReturnType<typeof signal<string | null>>;
    getUsersList: ReturnType<typeof vi.fn>;
    disableUserEntity: ReturnType<typeof vi.fn>;
    enableUserEntity: ReturnType<typeof vi.fn>;
  };
  let sidebar: {isOpen: ReturnType<typeof signal<boolean>>};
  beforeEach(async () => {
    store = {usersList: signal(users), selectedUser: signal(null), formMode: signal(null),
      getUsersList: vi.fn(), disableUserEntity: vi.fn(() => EMPTY), enableUserEntity: vi.fn(() => EMPTY)};
    sidebar = {isOpen: signal(false)};
    await TestBed.configureTestingModule({imports: [UsersPage], providers: [
      {provide: UsersStore, useValue: store}, {provide: SidebarStore, useValue: sidebar},
      {provide: NzModalService, useValue: {create: vi.fn()}},
    ]}).overrideComponent(UsersPage, {set: {template: ''}}).compileComponents();
  });
  async function createPage() {
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable();
    return fixture;
  }
  it('combines name or username search with role and status filters', async () => {
    const page = (await createPage()).componentInstance;
    expect(page.totals()).toEqual({all: 3, active: 2, admins: 1});
    page.search.set(' LGARCIA ');
    expect(page.filteredUsers().map(user => user.id)).toEqual([2]);
    page.roleFilter.set('Standard User'); page.statusFilter.set('active');
    expect(page.filteredUsers()).toEqual([]);
    page.search.set('ruiz');
    expect(page.filteredUsers().map(user => user.id)).toEqual([3]);
    page.clearFilters();
    expect(page.filteredUsers()).toHaveLength(3);
  });
  it('resets pagination on filters and clamps it when the list shrinks', async () => {
    const fixture = await createPage(); const page = fixture.componentInstance;
    store.usersList.set(Array.from({length: 25}, (_, index) => ({...users[0], id: index + 1, fullName: `User ${index}`})));
    page.page.set(3); expect(page.visibleUsers()).toHaveLength(1);
    page.search.set('User 1'); await fixture.whenStable();
    expect(page.currentPage()).toBe(1);
    page.search.set(''); await fixture.whenStable(); page.page.set(3);
    store.usersList.set(users); expect(page.currentPage()).toBe(1);
  });
  it('clears the edited user before opening the creation form', async () => {
    const page = (await createPage()).componentInstance;
    page.editUser(users[1]); expect(store.selectedUser()).toBe(users[1]);
    page.saveUser(); expect(store.selectedUser()).toBeNull();
    expect(store.formMode()).toBe('add'); expect(sidebar.isOpen()).toBe(true);
  });
  it('only marks the affected user busy and clears the state on completion', async () => {
    const page = (await createPage()).componentInstance;
    const request = new Subject<UserEntityResponseDto>();
    store.disableUserEntity.mockReturnValue(request);
    page.toggleStatus(users[0]); expect(page.busyUserId()).toBe(1);
    page.toggleStatus(users[1]); expect(store.enableUserEntity).not.toHaveBeenCalled();
    request.complete(); expect(page.busyUserId()).toBeNull();
    page.toggleStatus(users[1]); expect(store.enableUserEntity).toHaveBeenCalledWith(2);
    expect(page.busyUserId()).toBeNull();
  });
});
