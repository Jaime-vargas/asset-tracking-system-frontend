import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Components
import {MenuSidebarComponent} from './components/menu-sidebar-component/menu-sidebar-component';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {EditSideBar} from './components/edit-side-bar/edit-side-bar';
import {NzFlexDirective} from 'ng-zorro-antd/flex';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuSidebarComponent, NzRowDirective, NzColDirective, EditSideBar, NzFlexDirective],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
