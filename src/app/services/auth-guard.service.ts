import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthService} from './auth-service';

export const AuthGuardService: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isValidToken()) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  return true
}
