import {Component, computed, input, signal} from '@angular/core';
import {NzTagComponent} from "ng-zorro-antd/tag";
import {UtilityService} from '../../services/utility.service';

@Component({
  selector: 'app-double-status-tag-component',
    imports: [
        NzTagComponent
    ],
  templateUrl: './double-status-tag-component.html',
  styleUrl: './double-status-tag-component.css',
})
export class DoubleStatusTagComponent {
  constructor(protected utilityService: UtilityService) {
  }

  status = input.required<boolean>();
  dueDate = input.required<Date>();

  overdue = computed(()=> {
    const now = new Date();
    return this.dueDate() < now;
  });

  label = computed(()=>
    this.status() ?  "ACTIVE" : "CLOSED"
  );

  tagColor = computed(()=> {
    if (this.label() === "ACTIVE") return this.utilityService.baseColors.yellow;
    if (this.label() === "CLOSED") return this.utilityService.baseColors.green;
    return this.utilityService.baseColors.gray;
  })
}
