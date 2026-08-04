import {Component, computed, inject, OnInit, signal, TemplateRef, ViewChild} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {UsersStore} from '../../store/users.store';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {UserRowComponent} from '../../components/users-page/user-row-component/user-row-component';
import {EditSideBar} from '../../components/edit-side-bar/edit-side-bar';
import {SidebarStore} from '../../store/sidebar.store';
import {UserForm} from '../../components/forms/user-form/user-form';
import {UserEntityResponseDto} from '../../interfaces/users/user-entity-response.dto';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {
  UserResetPasswordForm
} from '../../components/forms/user-reset-password-form/user-reset-password-form/user-reset-password-form';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {UserEntityRequestDto} from '../../interfaces/users/user-entity-request.dto';

@Component({
  selector: 'app-users-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    NzFlexDirective,
    NzIconModule,
    UserRowComponent,
    EditSideBar,
    UserForm,
    UserResetPasswordForm,
    NzButtonComponent,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage implements OnInit{

  protected modalService = inject(NzModalService);
  private sidebarStore = inject(SidebarStore);
  private usersStore = inject(UsersStore);

  /** dependencies */
  openSideBar = this.sidebarStore.isOpen;

  /** Local variables */
  LoadingOptionsMenu = signal<boolean>(false);

  /** Computed */
  adminUsersList = computed(() =>
    this.usersStore.usersList().filter(user => user.role === 'Administrator'));
  standardUsersList = computed(() =>
    this.usersStore.usersList().filter(user => user.role === 'Standard User'));

  ngOnInit() {
    this.usersStore.getUsersList();
  }

  disableUser(userId: number) {
    this.LoadingOptionsMenu.set(true);
    this.usersStore.disableUserEntity(userId).subscribe({
      complete: () => this.LoadingOptionsMenu.set(false)
    })
  }

  enableUser(userId: number) {
    this.LoadingOptionsMenu.set(true);
    this.usersStore.enableUserEntity(userId).subscribe({
      complete: () => this.LoadingOptionsMenu.set(false)
    })
  }

  saveUser() {
    this.openSideBar.set(true);
    this.usersStore.formMode.set('add');
  }

  editUser(user: UserEntityResponseDto) {
    this.openSideBar.set(true);
    this.usersStore.formMode.set("edit");
    this.usersStore.selectedUser.set(user);
  }

  @ViewChild('resetPasswordModal',{static:true})
  resetPasswordModal!: TemplateRef<any>;
  protected modalRef?: NzModalRef;
  resetPassword(user: UserEntityResponseDto) {
    this.usersStore.selectedUser.set(user);
    this.modalRef = this.modalService.create({
      nzContent: this.resetPasswordModal,
      nzFooter: null
    })
  }
}
