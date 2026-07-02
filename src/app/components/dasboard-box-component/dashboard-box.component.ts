import {Component, computed, input} from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-dasboard-box-component',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
  ],
  templateUrl: './dashboard-box-component.html',
  styleUrl: './dashboard-box.component.css',
})
export class DashboardBoxComponent {
  boxTitle = input<string>();
  flex = input<boolean>(false);
  bgColor = input<string>("#fff");
}
