import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HardwareTableDto } from '../../interfaces/hardware/hardware-table.dto';
import { MultiSelectDone } from '../multi-select-done/multi-select-done';

@Component({
  selector: 'app-related-equipment-picker',
  imports: [FormsModule, NzButtonModule, NzSelectModule, MultiSelectDone],
  templateUrl: './related-equipment-picker.html',
  styleUrl: './related-equipment-picker.css',
})
export class RelatedEquipmentPicker {
  equipment = input.required<readonly HardwareTableDto[]>();
  loading = input(false);
  disabled = input(false);
  selectedIds = model<number[]>([]);

  protected type = signal<string | null>(null);
  protected siteId = signal<number | null>(null);
  protected types = computed(() =>
    [...new Set(this.equipment().map(item => item.type))].sort((a, b) => a.localeCompare(b)),
  );
  protected sites = computed(() =>
    [...new Map(this.equipment().map(item => [item.tagId, item.tagName])).entries()]
      .sort((a, b) => a[1].localeCompare(b[1])),
  );
  private matching = computed(() => this.equipment().filter(item =>
    (this.type() === null || item.type === this.type()) &&
    (this.siteId() === null || item.tagId === this.siteId()),
  ));
  protected matchingCount = computed(() => this.matching().length);
  protected options = computed(() => {
    const visible = new Set(this.matching().map(item => item.id));
    return this.equipment().map(item => ({
      id: item.id,
      name: [item.name, item.type, item.tagName, item.serialNumber].filter(Boolean).join(' · '),
      hidden: !visible.has(item.id),
    }));
  });
  protected unselectedMatchingIds = computed(() => {
    const selected = new Set(this.selectedIds());
    return this.matching().filter(item => !selected.has(item.id)).map(item => item.id);
  });

  protected selectAllMatching() {
    this.selectedIds.update(selected => [...selected, ...this.unselectedMatchingIds()]);
  }
}
