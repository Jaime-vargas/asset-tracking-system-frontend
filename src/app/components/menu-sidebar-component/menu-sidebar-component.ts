import { Component } from '@angular/core';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NzIconDirective} from 'ng-zorro-antd/icon';

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
}
