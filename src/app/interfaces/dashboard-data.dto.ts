
import {ReportDashboardDto} from "./report-dashboard.dto";
import {ClientDashboardDto} from './client-dashboard.dto';

export interface DashboardDataDto {
  openReports: number;
  overdueReports: number;
  totalHardware: number;
  totalClients: number;
  recentReports: ReportDashboardDto[];
  clients: ClientDashboardDto[];
  totalCameras: number;
  totalSwitches: number;
  totalOtherHardware: number;
}
