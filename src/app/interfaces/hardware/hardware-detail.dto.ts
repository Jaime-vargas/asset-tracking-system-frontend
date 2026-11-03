import {ReportHistoryDto} from '../report/report-history.dto';

export interface HardwareDetailDto {
  clientId: number;
  clientName: string;
  tagId: number;
  tagName: string;
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
