import {HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';
import { ApiUrlBaseService } from './api-url-base.service';

export const authInterceptorService: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next,
)=> {

  const api = new URL(inject(ApiUrlBaseService).baseUrl, document.baseURI);
  const target = new URL(req.url, document.baseURI);
  if (target.origin !== api.origin ||
      (target.pathname !== api.pathname && !target.pathname.startsWith(api.pathname + '/'))) {
    return next(req);
  }

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
