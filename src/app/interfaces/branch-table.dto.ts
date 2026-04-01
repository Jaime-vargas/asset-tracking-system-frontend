import {ReportCountDTO} from './report-dto/report-count.dto';

export interface BranchTableDto {
  id: number;
  name: string;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
}
