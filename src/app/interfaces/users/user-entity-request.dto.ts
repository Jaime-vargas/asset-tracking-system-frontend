import {UserRoleDto} from './user-role.dto';

export interface UserEntityRequestDto {
  username: string;
  password: string;
  fullName: string;
  role: string;
}
