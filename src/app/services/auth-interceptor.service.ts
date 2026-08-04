import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';

export const authInterceptorService: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next,
)=> {

  const tokenService = inject(AuthService);
  const token = localStorage.getItem('token');
  if(!token){
    return next(req);
  }
  tokenService.isValidToken();
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })
  return next(authReq);
};
