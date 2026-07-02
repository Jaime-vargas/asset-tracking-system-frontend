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
    switch (this.status()) {
      case "ACTIVE":
        return this.utilityService.baseColors.yellow;
      case "OVERDUE":
        return this.utilityService.baseColors.red;
      case "CLOSED":
        return this.utilityService.baseColors.green;
      default:
        return this.utilityService.baseColors.gray;
    }
  })
}
