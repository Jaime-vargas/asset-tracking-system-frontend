import {ReportCountDTO} from './report-count.dto';

export interface BranchTableDto {
  id: number;
  name: string;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
}
