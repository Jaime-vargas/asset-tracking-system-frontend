import {ReportCountDTO} from './report/report-count.dto';

export interface BranchTableDto {
  id: number;
  name: string;
  createdDate: string;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
}
