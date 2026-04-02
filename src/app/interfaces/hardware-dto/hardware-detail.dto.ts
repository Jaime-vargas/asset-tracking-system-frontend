import {ReportHistoryDto} from '../report-dto/report-history.dto';

export interface HardwareDetailDto {
  id: number;
  type: 'Camera' | 'Server';
  model: string;
  serialNumber: string;
  location: string;
  name: string;
  lastMaintenanceDate: string;
  recentActiveReports: ReportHistoryDto[];
}
