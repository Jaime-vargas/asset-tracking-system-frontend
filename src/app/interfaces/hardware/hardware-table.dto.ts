import {ReportCountDTO} from '../report/report-count.dto';

export interface HardwareTableDto{
  id: number;
  type: string;
  name: string;
  brand?: string;
  cameraId?: string | null;
  ipAddress?: string | null;
  macAddress?: string | null;
  idf?: string | null;
  model: string;
  serialNumber: string;
  location: string;
  lastMaintenanceDate: string;
  reportsActive: ReportCountDTO[];

  clientId: number;
  clientName: string;
  branchId: number | null;
  branchName: string | null;
  tagId: number;
  tagName: string;
  tagColor?: string;
}
