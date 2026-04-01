import {ReportCountDTO} from './report-dto/report-count.dto';

export interface ClientTableDto {
  id: number;
  name: string;
  branches: number;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
}
