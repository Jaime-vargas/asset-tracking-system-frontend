import {HttpInterceptor, HttpInterceptorFn, HttpRequest} from '@angular/common/http';

export const authInterceptorService: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next,
)=> {
  const token = localStorage.getItem('token');
  if(!token){
    return next(req);
  }
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })
  return next(authReq);
};
