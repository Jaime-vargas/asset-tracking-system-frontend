import {Component, input, InputSignal} from '@angular/core';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-dashboard-card-component',
  imports: [
    NzTypographyComponent
  ],
  templateUrl: './dashboard-card-component.html',
  styleUrl: './dashboard-card-component.css',
})
export class DashboardCardComponent {
    cardTitle = input();
}
