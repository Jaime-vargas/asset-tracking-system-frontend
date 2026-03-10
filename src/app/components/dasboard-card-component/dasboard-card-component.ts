import {Component, input, InputSignal} from '@angular/core';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-dasboard-card-component',
  imports: [
    NzTypographyComponent
  ],
  templateUrl: './dasboard-card-component.html',
  styleUrl: './dasboard-card-component.css',
})
export class DasboardCardComponent {
    cardTitle = input.required();
}
