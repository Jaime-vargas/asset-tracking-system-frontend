import {ReportCountDTO} from './report/report-count.dto';
import {FileEntityDto} from './fileEntityDto';

export interface ClientTableDto {
  id: number;
  name: string;
  branches: number;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
  photo: FileEntityDto;
}
