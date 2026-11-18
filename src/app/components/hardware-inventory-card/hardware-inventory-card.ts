import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-hardware-inventory-card',
  imports: [RouterLink, NzIconDirective],
  templateUrl: './hardware-inventory-card.html',
  styleUrl: './hardware-inventory-card.css',
})
export class HardwareInventoryCard {
  label = input.required<string>();
  icon = input.required<string>();
  count = input.required<number>();
  type = input.required<string>();
}
