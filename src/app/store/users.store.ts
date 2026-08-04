import {inject, Injectable, signal} from '@angular/core';
import {UsersService} from '../services/users.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {UserEntityResponseDto} from '../interfaces/users/user-entity-response.dto';
import {catchError, EMPTY, take, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UserRoleDto} from '../interfaces/users/user-role.dto';
import {UserPasswordUpdateRequestDto} from '../interfaces/users/user-password-update-request.dto';
import {UserEntityUpdateRequestDto} from '../interfaces/users/user-entity-update-request.dto';
import {UserEntityRequestDto} from '../interfaces/users/user-entity-request.dto';

@Injectable({providedIn: "root"})
export class UsersStore{
  private userService = inject(UsersService);
  private messageService = inject(NzMessageService);
  private notification = inject(NzNotificationService);

  public formMode = signal<"add" | "edit" | null>(null);

  usersList = signal<UserEntityResponseDto[]>([]);
  selectedUser = signal<UserEntityResponseDto | null>(null);

  usersRoleList = signal<UserRoleDto[]>([]);

  getUsersList(){
    this.userService.getUsersList().subscribe({
      next: usersList => this.usersList.set(usersList),
      error: err => this.messageService.error(err),
    })
  }

  getUsersRoleList(){
    this.userService.getUserRolesList().subscribe({
      next: usersRoleList => this.usersRoleList.set(usersRoleList),
      error: err => this.messageService.error(err)
    })
  }

  saveUser(user: UserEntityRequestDto){
    return this.userService.saveUser(user).pipe(
      tap(newUser => this.usersList.update(curr => {
        return [...curr, newUser];
      })),
      tap(() => this.messageService.success('User created successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    )
  }

  updateUser(userId:number, user: UserEntityUpdateRequestDto){
    return this.userService.updateUser(userId, user).pipe(
      tap(userResponse => this.usersList.update( curr =>
      curr.map(user => user.id === userId ? userResponse : user))),
      tap(() => this.messageService.success('User edited successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    )
  }

  updateUsersPassword(userChangePasswordRequest: UserPasswordUpdateRequestDto){
    return this.userService.updateUserPassword(userChangePasswordRequest).pipe(
      tap(() => this.messageService.success('Password changed succesfully')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  resetUserPassword(userId:number, resetPassword:{newPassword:string} ) {
    return this.userService.resetUserPassword(userId, resetPassword).pipe(
      tap(() => this.messageService.success('Successfully reset password.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  disableUserEntity(userId:number){
    return this.userService.disableUserEntity(userId).pipe(
      tap(userEntityResponseDto => {
        this.usersList.update(curr =>
          curr.map(user =>
            user.id === userId ? userEntityResponseDto : user
          ))
      }),
      tap(() => this.messageService.success('User disabled successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  enableUserEntity(userId:number){
    return this.userService.enableUserEntity(userId).pipe(
      tap(userEntityResponseDto => {
        this.usersList.update(curr =>
          curr.map(user =>
            user.id === userId ? userEntityResponseDto : user
          ))
      }),
      tap(() => this.messageService.success('User enabled successfully.')),
      catchError((err: HttpErrorResponse) => {
        this.responseError(err);
        return EMPTY;})
    );
  }

  responseError(error: HttpErrorResponse) {
    this.notification.error(
      'Request Failed',
      error?.error?.message || error?.message,
      {nzDuration: 0}
    )
  }
}
