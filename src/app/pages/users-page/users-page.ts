import {Component, computed, DestroyRef, effect, inject, OnInit, signal, TemplateRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzDropdownModule} from 'ng-zorro-antd/dropdown';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {UsersStore} from '../../store/users.store';
import {SidebarStore} from '../../store/sidebar.store';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {UserForm} from '../../components/forms/user-form/user-form';
import {UserResetPasswordForm} from '../../components/forms/user-reset-password-form/user-reset-password-form/user-reset-password-form';
import {ListPagination} from '../../components/list-pagination/list-pagination';
import {UserEntityResponseDto} from '../../interfaces/users/user-entity-response.dto';

@Component({
  selector: 'app-users-page',
  imports: [FormsModule, NzIconModule, NzInputModule, NzButtonComponent, NzDropdownModule,
    NzMenuModule, EditSideBar, UserForm, UserResetPasswordForm, ListPagination],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit {
  protected usersStore = inject(UsersStore);
  private sidebarStore = inject(SidebarStore);
  private modalService = inject(NzModalService);
  private destroyRef = inject(DestroyRef);
  openSideBar = this.sidebarStore.isOpen;
  search = signal('');
  roleFilter = signal('');
  statusFilter = signal('');
  busyUserId = signal<number | null>(null);
  page = signal(1);
  readonly pageSize = 12;
  protected modalRef?: NzModalRef;
  @ViewChild('resetPasswordModal', {static: true}) resetPasswordModal!: TemplateRef<void>;

  totals = computed(() => {
    const users = this.usersStore.usersList();
    return {all: users.length, active: users.filter(user => user.active).length,
      admins: users.filter(user => user.role === 'Administrator').length};
  });
  roles = computed(() => [...new Set(this.usersStore.usersList().map(user => user.role))].sort());
  filteredUsers = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    return this.usersStore.usersList().filter(user =>
      (!query || `${user.fullName} ${user.username}`.toLocaleLowerCase().includes(query))
      && (!this.roleFilter() || user.role === this.roleFilter())
      && (!this.statusFilter() || user.active === (this.statusFilter() === 'active')))
      .sort((first, second) => first.fullName.localeCompare(second.fullName) || first.username.localeCompare(second.username));
  });
  currentPage = computed(() => Math.max(1, Math.min(this.page(), Math.ceil(this.filteredUsers().length / this.pageSize))));
  visibleUsers = computed(() => this.filteredUsers().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize));
  hasFilters = computed(() => !!(this.search() || this.roleFilter() || this.statusFilter()));

  constructor() {
    effect(() => { this.search(); this.roleFilter(); this.statusFilter(); this.page.set(1); });
    this.destroyRef.onDestroy(() => this.modalRef?.destroy());
  }
  ngOnInit() { this.usersStore.getUsersList(); }
  clearFilters() { this.search.set(''); this.roleFilter.set(''); this.statusFilter.set(''); }
  initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '?'; }
  toggleStatus(user: UserEntityResponseDto) {
    if (this.busyUserId() !== null) return;
    this.busyUserId.set(user.id);
    const request = user.active ? this.usersStore.disableUserEntity(user.id) : this.usersStore.enableUserEntity(user.id);
    request.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.busyUserId.set(null))).subscribe();
  }
  saveUser() {
    this.usersStore.selectedUser.set(null);
    this.usersStore.formMode.set('add');
    this.openSideBar.set(true);
  }
  editUser(user: UserEntityResponseDto) {
    this.usersStore.formMode.set('edit');
    this.usersStore.selectedUser.set(user);
    this.openSideBar.set(true);
  }
  resetPassword(user: UserEntityResponseDto) {
    this.usersStore.selectedUser.set(user);
    this.modalRef = this.modalService.create({nzContent: this.resetPasswordModal, nzFooter: null, nzWidth: 440});
  }
}
