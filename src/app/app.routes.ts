import {CanActivateFn, Routes} from '@angular/router';
import {DashboardPage} from './pages/dashboard-page/dashboard-page';
import {ClientsPage} from './pages/clients-page/clients-page';
import {ClientBranchesPage} from './pages/client-branches-page/client-branches-page';
import {BranchHardwarePage} from './pages/branch-hardware-page/branch-hardware-page';
import {HardwareDevicePage} from './pages/hardware-device-page/hardware-device-page';
import {HardwarePage} from './pages/hardware-page/hardware-page';
import {HardwareReportsPage} from './pages/hardware-reports-page/hardware-reports-page';
import {ReportsPage} from './pages/reports-page/reports-page';
import {ReportDetailPage} from './pages/report-detail-page/report-detail-page';
import {UsersPage} from './pages/users-page/users-page';
import {LoginPage} from './pages/login-page/login-page';
import {AuthService} from './services/auth-service';
import {AuthGuardService} from './services/auth-guard.service';
import {QrScannerComponent} from './components/qr-scanner-component/qr-scanner-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage},
  { path: 'dashboard', component: DashboardPage,
  canActivate: [AuthGuardService]},
  { path: 'clients', component: ClientsPage },
  { path: 'clients/:clientId/:clientSlug', component: ClientBranchesPage },
  { path: 'hardware', component: HardwarePage },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware',
    component: BranchHardwarePage
  },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware/:hardwareId/:hardwareSlug',
    component: HardwareDevicePage
  },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware/:hardwareId/:hardwareSlug/reports',
    component: HardwareReportsPage
  },
  { path: 'reports', component: ReportsPage },
  {
    path: 'clients/:clientId/:clientSlug/branches/:branchId/:branchSlug/hardware/:hardwareId/:hardwareSlug/reports/:reportId',
    component: ReportDetailPage
  },
  { path: 'users', component: UsersPage },
  { path: 'qr', component: QrScannerComponent },
];
