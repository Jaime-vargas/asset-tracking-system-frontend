import { Routes } from '@angular/router';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';
import {ClientsPage} from './pages/clients-page/clients-page';
import {ClientBranchesPage} from './pages/client-branches-page/client-branches-page';
import {BranchHardwarePage} from './pages/branch-hardware-page/branch-hardware-page';
import {DevicePage} from './pages/device-page/device-page';
import {HardwarePage} from './pages/hardware-page/hardware-page';
import {HardwareReportsPage} from './pages/hardware-reports-page/hardware-reports-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'clients', component: ClientsPage },
  { path: 'clients/:clientId/:clientSlug', component: ClientBranchesPage },
  { path: 'hardware', component: HardwarePage },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware',
    component: BranchHardwarePage
  },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware/:hardwareId/:hardwareSlug',
    component: DevicePage
  }
];
