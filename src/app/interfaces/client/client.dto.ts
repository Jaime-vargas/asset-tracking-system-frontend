import {PhotoDto} from '../photo.dto';

export interface ClientDto {
  id: number;
  name: string;
  photo: PhotoDto;
}
