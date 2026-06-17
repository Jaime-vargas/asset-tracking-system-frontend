import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token =
    new BehaviorSubject<string>('');

  public token$ = this.token.asObservable();

  setToken(token: string): void  {
    this.token.next(token);
    console.log("set token: " + token);
    localStorage.setItem('token', token);
  }

  logout(){
    this.token.next('');
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
