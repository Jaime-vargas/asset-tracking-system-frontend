import { Component, computed, input } from '@angular/core';
import { SingleStatusTagsComponent } from '../single-status-tags-component/single-status-tags-component';

@Component({
  selector: 'app-double-status-tag-component',
  imports: [SingleStatusTagsComponent],
  templateUrl: './double-status-tag-component.html',
  styleUrl: './double-status-tag-component.css',
})
export class DoubleStatusTagComponent {
  status = input.required<boolean>();
  dueDate = input.required<Date>();
  protected overdue = computed(() => this.status() && this.dueDate() < new Date());
}
