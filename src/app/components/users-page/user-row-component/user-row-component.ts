import {Component, computed, inject, input, output, signal} from '@angular/core';
import {UtilityService} from '../../../services/utility.service';
import {DashboardBoxComponent} from '../../dasboard-box-component/dashboard-box.component';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {UserEntityResponseDto} from '../../../interfaces/users/user-entity-response.dto';
import {DashboardCardComponent} from '../../dashboard-card-component/dashboard-card-component';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzDropdownDirective, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzMenuDirective, NzMenuItemComponent} from 'ng-zorro-antd/menu';


type themeType = {
  background: string;
  font: string;
  title: string;
}


@Component({
  selector: 'app-user-row-component',
  imports: [
    DashboardBoxComponent,
    NzFlexDirective,
    NzTypographyComponent,
    DashboardCardComponent,
    NzAvatarComponent,
    NzButtonComponent,
    NzColDirective,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzIconDirective,
    NzMenuDirective,
    NzMenuItemComponent,
    NzRowDirective
  ],
  templateUrl: './user-row-component.html',
  styleUrl: './user-row-component.css',
  standalone: true,
})
export class UserRowComponent {

  private utilityService = inject(UtilityService);

  // Inputs
  themeColors = input.required<"yellow" | "blue">();
  title = input.required<string>();
  userList = input.required<UserEntityResponseDto[]>();
  LoadingOptionsMenu = input.required<boolean>()

  // Outputs
  disableUser = output<number>();
  editUser = output<UserEntityResponseDto>();
  enableUser = output<number>();
  resetPassword = output<UserEntityResponseDto>();

  // Computed
  theme = computed<themeType>(() => {
    switch (this.themeColors()) {
      case 'blue':
        return {
          background: this.utilityService.color.lightBlue,
          font: this.utilityService.color.blue,
          title: this.title()
        }
      case 'yellow':
        return {
          background: this.utilityService.color.yellow,
          font: this.utilityService.color.brown,
          title: this.title()
        }
      default:
        return {
          background: "",
          font: "",
          title: ""
        }
    }
  })

  // Theme colors for active / inactive tags.
  themeActiveTag = {
    activeBg: this.utilityService.color.lightGreen,
    activeDot: this.utilityService.color.green,
    inactiveBg: this.utilityService.color.lightGrey,
    inactiveDot: this.utilityService.color.grey,
  }

}
