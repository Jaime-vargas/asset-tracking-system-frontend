import {Component, inject, signal} from '@angular/core';
import {NzDrawerComponent, NzDrawerContentDirective} from 'ng-zorro-antd/drawer';

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


  isVisible = signal(false);

  onClose(){
    this.isVisible.update(value => !value);
  }
}
