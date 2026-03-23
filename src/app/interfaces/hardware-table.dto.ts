import {ReportCountDTO} from './report-count.dto';

export interface HardwareTableDto{
  id: number;
  type: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  lastMaintenanceDate: string;
  reportsActive: ReportCountDTO[];
  clientName: string;
  branchName: string;
}
