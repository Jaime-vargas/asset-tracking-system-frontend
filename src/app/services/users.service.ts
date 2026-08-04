import {inject, Injectable} from '@angular/core'
import {ApiUrlBaseService} from './api-url-base.service';
import {UserEntityRequestDto} from '../interfaces/users/user-entity-request.dto';
import {UserEntityUpdateRequestDto} from '../interfaces/users/user-entity-update-request.dto';
import {UserPasswordUpdateRequestDto} from '../interfaces/users/user-password-update-request.dto';
import {Observable} from 'rxjs';
import {UserEntityResponseDto} from '../interfaces/users/user-entity-response.dto';
import {UserRoleDto} from '../interfaces/users/user-role.dto';

@Injectable({providedIn: 'root'})
export class UsersService{

  apiService = inject(ApiUrlBaseService)

  getUsersList():Observable<UserEntityResponseDto[]>{
    return this.apiService.get(`users`);
  }

  saveUser(user: UserEntityRequestDto):Observable<UserEntityResponseDto>{
    return this.apiService.post(`users`, user);
  }

  updateUser(userId: number, user: UserEntityUpdateRequestDto):Observable<UserEntityResponseDto>{
    return this.apiService.put(`users/${userId}`, user);
  }

  updateUserPassword(userChangePasswordRequest: UserPasswordUpdateRequestDto):Observable<void>{
    return this.apiService.put(`users/me/password`, userChangePasswordRequest);
  }

  resetUserPassword(userId:number, resetPassword:{newPassword:string} ) {
    return this.apiService.put(`users/${userId}/reset-password`, resetPassword);
  }

  disableUserEntity(userId:number):Observable<UserEntityResponseDto>{
    return this.apiService.put(`users/${userId}/disable-user`, null);
  }

  enableUserEntity(userId:number):Observable<UserEntityResponseDto>{
    return this.apiService.put(`users/${userId}/enable-user`, null);
  }

  /** Roles */
  getUserRolesList():Observable<UserRoleDto[]>{
    return this.apiService.get(`users/roles`);
  }

}
