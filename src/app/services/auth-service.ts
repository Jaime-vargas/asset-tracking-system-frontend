import {inject, Injectable, OnInit, signal} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserData} from '../interfaces/users/current-user-data';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  router = inject(Router);

  public token = signal<boolean>(true);

  setToken(token: string): void  {
    localStorage.setItem('token', token);
    this.token.set(true);
  }

  logout(){
    localStorage.removeItem('token');
    this.token.set(false);
  }


  isValidToken(): boolean{
    const token = localStorage.getItem('token');
    if (token === null) return false;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    if (now >= exp) this.logout();
    return exp >= now;
  }

  getAllUserDataOnToken(token: string | null): UserData | null {
    if (token === null) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      username: payload.sub,
      fullName: payload.fullName,
      role: payload.role,
    }
  }

  getUserRole():string{
    const token = localStorage.getItem('token');
    if (token === null) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }
}
