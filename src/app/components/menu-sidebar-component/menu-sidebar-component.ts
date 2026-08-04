import {Component, inject, OnInit} from '@angular/core';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-menu-sidebar-component',
  imports: [
    NzMenuDirective,
    RouterLinkActive,
    RouterLink,
    NzMenuItemComponent,
    NzIconDirective
  ],
  templateUrl: './menu-sidebar-component.html',
  styleUrl: './menu-sidebar-component.css',
})
export class MenuSidebarComponent {

  private authService = inject(AuthService);
  protected router = inject(Router);

  currentRole = this.authService.getUserRole;
}
