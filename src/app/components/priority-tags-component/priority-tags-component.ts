import { Component, computed, input } from '@angular/core';
import { UiTag } from '../ui-tag/ui-tag';

@Component({
  selector: 'app-priority-tags-component',
  imports: [UiTag],
  templateUrl: './priority-tags-component.html',
  styleUrl: './priority-tags-component.css',
})
export class PriorityTagsComponent {
  priority = input.required<string>();
  protected tone = computed(() => {
    switch (this.priority()) {
      case 'HIGH': return 'RED';
      case 'MEDIUM': return 'GOLD';
      case 'LOW': return 'GREEN';
      default: return null;
    }
  });
}
