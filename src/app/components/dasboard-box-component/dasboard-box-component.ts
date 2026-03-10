import {Component, input} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-dasboard-box-component',
  imports: [
    NzDividerComponent,
    NzTypographyComponent
  ],
  templateUrl: './dashboard-box-component.html',
  styleUrl: './dasboard-box-component.css',
})
export class DasboardBoxComponent {
  boxTitle = input.required();
}
