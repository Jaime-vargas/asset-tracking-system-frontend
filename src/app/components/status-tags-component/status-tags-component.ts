import {Component, computed, input} from '@angular/core';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-status-tags-component',
  imports: [
    NzTagComponent
  ],
  templateUrl: './status-tags-component.html',
  styleUrl: './status-tags-component.css',
})
export class StatusTagsComponent {

  constructor(private utilityService: UtilityService) {
  }

  // when status is not sent, is asumes that data from backend comes with only active reports.
  status = input<boolean>(true);
  dueDate = input.required<Date>();

  label = computed(()=> {
    if(this.status()){
      const now = new Date();
      return this.dueDate() > now ?  "ACTIVE" :  "OVERDUE";
    }
    return "CLOSED"
  });
  tagColor = computed(()=> {
    if (this.label() === "ACTIVE") return this.utilityService.tagColors.yellow;
    if (this.label() === "OVERDUE") return this.utilityService.tagColors.red;
    if (this.label() === "CLOSED") return this.utilityService.tagColors.green;
    return this.utilityService.tagColors.gray;
  })
}
