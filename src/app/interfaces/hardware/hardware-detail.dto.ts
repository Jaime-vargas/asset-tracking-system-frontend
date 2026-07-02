import {ReportHistoryDto} from '../report/report-history.dto';

export interface HardwareDetailDto {
  id: number;
  type: 'Camera' | 'Server';
  brand: string;  // NEW
  model: string;
  serialNumber: string;
  location: string;
  name: string;
  lastMaintenanceDate: string;

  overdueReportsCount:number;
  activeReportsCount:number;

  recentActiveReports: ReportHistoryDto[];
}
