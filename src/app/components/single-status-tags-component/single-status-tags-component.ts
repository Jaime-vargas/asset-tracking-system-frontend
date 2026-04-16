import {Component, computed, input} from '@angular/core';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-single-status-tags-component',
  imports: [
    NzTagComponent
  ],
  templateUrl: './single-status-tags-component.html',
  styleUrl: './single-status-tags-component.css',
})
export class SingleStatusTagsComponent {

  constructor(private utilityService: UtilityService) {
  }

  status = input<string>();
  tagColor = computed(()=> {
    if (this.status() === "ACTIVE") return this.utilityService.baseColors.yellow;
    if (this.status() === "OVERDUE") return this.utilityService.baseColors.red;
    if (this.status() === "CLOSED") return this.utilityService.baseColors.green;
    return this.utilityService.baseColors.gray;
  })
}
