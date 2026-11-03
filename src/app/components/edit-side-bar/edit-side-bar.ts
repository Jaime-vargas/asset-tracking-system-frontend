import { Component, inject, input } from '@angular/core';
import { NzModalComponent, NzModalContentDirective } from 'ng-zorro-antd/modal';
import { SidebarStore } from '../../store/sidebar.store';
@Component({
  selector: 'app-edit-side-bar',
  imports: [NzModalComponent, NzModalContentDirective],
  templateUrl: './edit-side-bar.html',
  styleUrl: './edit-side-bar.css',
})
export class EditSideBar {
  width = input<number | string>(600);
  sidebarStore = inject(SidebarStore);
  isOpen = this.sidebarStore.isOpen;
  onClose() {
    this.isOpen.set(false);
  }
}
