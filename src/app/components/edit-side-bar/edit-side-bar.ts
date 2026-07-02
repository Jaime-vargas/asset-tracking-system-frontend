import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {NzDrawerComponent, NzDrawerContentDirective} from 'ng-zorro-antd/drawer';
import {SidebarStore} from '../../store/sidebar.store';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-edit-side-bar',
  imports: [
    NzDrawerComponent,
    NzDrawerContentDirective,
    NzDrawerContentDirective,

  ],
  templateUrl: './edit-side-bar.html',
  styleUrl: './edit-side-bar.css',
})
export class EditSideBar {

  sidebarStore = inject(SidebarStore);

  isOpen = this.sidebarStore.isOpen;

  onClose() {
    this.isOpen.set(false);
  }
}
