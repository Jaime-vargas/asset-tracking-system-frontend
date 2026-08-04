import {
  Component,
  effect,
  inject,
  OnInit,
  signal, TemplateRef,
  ViewChild
} from '@angular/core';
import {AuthService} from '../../services/auth-service';
import {UserData} from '../../interfaces/users/current-user-data';

import {NzFlexDirective} from 'ng-zorro-antd/flex';

import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {NzPopoverDirective} from 'ng-zorro-antd/popover';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {Router} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {UserChangePasswordForm} from '../forms/user-change-password-form/user-change-password-form';

@Component({
  selector: 'app-current-user-component',
  imports: [
    NzFlexDirective,
    NzMenuDirective,
    NzPopoverDirective,
    NzButtonComponent,
    UserChangePasswordForm,
  ],
  templateUrl: './current-user-component.html',
  styleUrl: './current-user-component.css',
})
export class CurrentUserComponent implements OnInit {
  protected authService = inject(AuthService);
  protected modalService = inject(NzModalService);
  private router = inject(Router);

  userData = signal<UserData | null>(null);

  constructor() {
    effect(() => {
      this.authService.token();
      this.setUserData();
    });
  }

  ngOnInit() {
    this.setUserData()
  }

  setUserData() {
    const token =  localStorage.getItem('token');
    const userData = this.authService.getAllUserDataOnToken(token);
    if(userData === null){
      this.userData.set(userData)
      this.authService.token.set(false);
    }
    this.userData.set(userData);
  }

  @ViewChild('changePasswordModal',{static: true})
  changePasswordModal!: TemplateRef<any>;
  protected modalRef?: NzModalRef;
  changePassword(){
    this.modalRef = this.modalService.create({
      nzContent: this.changePasswordModal,
      nzFooter: null
    })
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
