import { TagColor } from './tag-color';
export interface TagDto {
  id: number;
  name: string;
  clientId: number;
  color?: TagColor;
}
