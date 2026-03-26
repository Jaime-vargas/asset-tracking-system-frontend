import {Component, computed, input} from '@angular/core';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-priority-tags-component',
  imports: [
    NzTagComponent
  ],
  templateUrl: './priority-tags-component.html',
  styleUrl: './priority-tags-component.css',
})
export class PriorityTagsComponent {
  constructor(private utilityService: UtilityService) {
  }

  priority = input.required<string>();
  tagColor = computed(() => {
    if (this.priority() === 'HIGH') return this.utilityService.tagColors.red;
    if (this.priority() === 'MEDIUM') return this.utilityService.tagColors.yellow;
    if (this.priority() === 'LOW') return this.utilityService.tagColors.green;
    return this.utilityService.tagColors.gray;
  });
}


