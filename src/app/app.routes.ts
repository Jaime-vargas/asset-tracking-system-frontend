import { Routes } from '@angular/router';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage }
];
