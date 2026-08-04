import {FileEntityDto} from '../fileEntityDto';

export interface ClientDto {
  id: number;
  name: string;
  photo: FileEntityDto;
}
