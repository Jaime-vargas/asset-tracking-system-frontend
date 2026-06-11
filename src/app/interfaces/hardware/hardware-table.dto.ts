import {ReportCountDTO} from '../report-dto/report-count.dto';

export interface HardwareTableDto{
  id: number;
  type: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  lastMaintenanceDate: string;
  reportsActive: ReportCountDTO[];
  clientId: number;
  clientName: string;
  branchId: number;
  branchName: string;
}
