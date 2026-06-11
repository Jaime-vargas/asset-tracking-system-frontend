import {ReportCountDTO} from './report/report-count.dto';
import {PhotoDto} from './photo.dto';

export interface ClientTableDto {
  id: number;
  name: string;
  branches: number;
  totalHardware : number;
  reportsActive: ReportCountDTO[];
  photo: PhotoDto;
}
