import {FileEntityDto} from './fileEntityDto';

export interface ClientDashboardDto {
  id: number;
  name: string;
  photo?: Pick<FileEntityDto, 'filePath'> | null;
}
