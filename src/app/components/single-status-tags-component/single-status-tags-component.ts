import { Component, computed, input } from '@angular/core';
import { UiTag } from '../ui-tag/ui-tag';

@Component({
  selector: 'app-single-status-tags-component',
  imports: [UiTag],
  templateUrl: './single-status-tags-component.html',
  styleUrl: './single-status-tags-component.css',
})
export class SingleStatusTagsComponent {
  status = input<string>();
  protected tone = computed(() => {
    switch (this.status()) {
      case 'ACTIVE': return 'GOLD';
      case 'OVERDUE': return 'RED';
      case 'CLOSED': return 'GREEN';
      default: return null;
    }
  });
}
