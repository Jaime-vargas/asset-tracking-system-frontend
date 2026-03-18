import { Routes } from '@angular/router';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';
import {ClientsPage} from './pages/clients-page/clients-page';
import {ClientBranchesPage} from './pages/client-branches-page/client-branches-page';
import {BranchHardwarePage} from './pages/branch-hardware-page/branch-hardware-page';
import {HardwarePage} from './pages/hardware-page/hardware-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'clients', component: ClientsPage },
  { path: 'clients/:id/:slug', component: ClientBranchesPage },
  { path: 'hardware', component: HardwarePage },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware',
    component: BranchHardwarePage
  }
];
