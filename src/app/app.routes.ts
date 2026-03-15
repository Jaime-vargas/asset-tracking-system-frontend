import { Routes } from '@angular/router';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';
import {ClientsPage} from './pages/clients-page/clients-page';
import {ClientBranchesPage} from './pages/client-branches-page/client-branches-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'clients', component: ClientsPage },
  { path: 'clients/:id/:slug', component: ClientBranchesPage }
];
