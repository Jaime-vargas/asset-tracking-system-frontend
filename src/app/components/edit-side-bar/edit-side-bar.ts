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
export class EditSideBar implements OnInit, OnDestroy {

  constructor(
    private sidebarStore: SidebarStore
  ) {}

  subscriptions = new Subscription();
  ngOnInit() {
    this.subscriptions.add(
      this.sidebarStore.isOpen$.subscribe(isOpen => {
        this.isOpened.set(isOpen);
      })
    );
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isOpened = signal(false);

  onClose() {
    this.sidebarStore.close();
  }

}
