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
    if (this.label() === "ACTIVE") return this.utilityService.baseColors.yellow;
    if (this.label() === "OVERDUE") return this.utilityService.baseColors.red;
    if (this.label() === "CLOSED") return this.utilityService.baseColors.green;
    return this.utilityService.baseColors.gray;
  })
}
