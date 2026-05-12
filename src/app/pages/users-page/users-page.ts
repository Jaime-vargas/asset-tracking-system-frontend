import { Component } from '@angular/core';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-users-page',
  imports: [
    NzDividerComponent,
    NzTypographyComponent,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.css',
})
export class UsersPage {

}
