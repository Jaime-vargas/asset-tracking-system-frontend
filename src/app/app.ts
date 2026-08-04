import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Components
import {MenuSidebarComponent} from './components/menu-sidebar-component/menu-sidebar-component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {CurrentUserComponent} from './components/current-user-component/current-user-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuSidebarComponent, NzRowDirective, NzColDirective,CurrentUserComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
