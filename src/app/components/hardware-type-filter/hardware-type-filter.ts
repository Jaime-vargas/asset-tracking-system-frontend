import { Component, computed, input, model } from '@angular/core';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-hardware-type-filter',
  imports: [UiIcon],
  templateUrl: './hardware-type-filter.html',
  styleUrl: './hardware-type-filter.css',
})
export class HardwareTypeFilter {
  equipment = input.required<readonly HardwareTableDto[]>();
  selected = model<string | null>(null);

  protected types = computed(() => {
    const counts = new Map<string, number>();
    for (const item of this.equipment()) {
      counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    }
    return Array.from(counts, ([type, count]) => ({ type, count }))
      .sort((a, b) => a.type.localeCompare(b.type));
  });
}
