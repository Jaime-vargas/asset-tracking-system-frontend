import {Component, inject, signal} from '@angular/core';
import {NzDrawerComponent, NzDrawerContentDirective} from 'ng-zorro-antd/drawer';
import {SidebarStore} from '../../store/sidebar.store';

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

  constructor(
    private sidebarStore: SidebarStore
  ) {}

  ngOnInit() {
    this.sidebarStore.isOpen$.subscribe(isOpen => {
      this.isOpened.set(isOpen);
    })
  }

  isOpened = signal(false);

  onClose() {
    this.sidebarStore.close();
  }

}
