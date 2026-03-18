import {Component, input} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzFlexDirective} from 'ng-zorro-antd/flex';

@Component({
  selector: 'app-dasboard-box-component',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    NzFlexDirective
  ],
  templateUrl: './dashboard-box-component.html',
  styleUrl: './dasboard-box-component.css',
})
export class DasboardBoxComponent {
  boxTitle = input();
}
