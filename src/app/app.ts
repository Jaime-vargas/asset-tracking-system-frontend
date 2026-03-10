import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Components
import {MenuSidebarComponent} from './components/menu-sidebar-component/menu-sidebar-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuSidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
