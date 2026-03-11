
import {ReportTableDto} from "./report-table.dto";
import {ClientDashboardDto} from './client-dashboard.dto';

export interface DashboardDataDto {
  openReports: number;
  overdueReports: number;
  totalHardware: number;
  totalClients: number;
  recentReports: ReportTableDto[];
  clients: ClientDashboardDto[];
  totalCameras: number;
  totalSwitches: number;
  totalOtherHardware: number;
}
