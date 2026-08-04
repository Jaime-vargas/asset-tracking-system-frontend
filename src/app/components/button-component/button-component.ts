import {Component, input} from '@angular/core';
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-button-component',
  imports: [
    NzButtonComponent,
    NzIconDirective
  ],
  templateUrl: './button-component.html',
  styleUrl: './button-component.css',
})
export class ButtonComponent {
  type = input<'link' | 'edit' | 'download'>('link');
  buttonLabel = input();
}
