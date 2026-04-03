import { Component } from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {DasboardBoxComponent} from '../../components/dasboard-box-component/dasboard-box-component';
import {DasboardCardComponent} from '../../components/dasboard-card-component/dasboard-card-component';
import {DasboardGreyCardComponent} from '../../components/dasboard-grey-card-component/dasboard-grey-card-component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzFlexDirective} from 'ng-zorro-antd/flex';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzTableComponent, NzThMeasureDirective} from 'ng-zorro-antd/table';
import {PriorityTagsComponent} from '../../components/priority-tags-component/priority-tags-component';
import {SingleStatusTagsComponent} from '../../components/single-status-tags-component/single-status-tags-component';

@Component({
  selector: 'app-users-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
    DasboardBoxComponent,
    DasboardCardComponent,
    DasboardGreyCardComponent,
    NzButtonComponent,
    NzColDirective,
    NzFlexDirective,
    NzIconDirective,
    NzRowDirective,
    NzTableComponent,
    NzThMeasureDirective,
    PriorityTagsComponent,
    SingleStatusTagsComponent
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage {

}
