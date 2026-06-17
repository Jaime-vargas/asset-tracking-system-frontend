import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AuthService} from './auth-service';

export const AuthGuardService: CanActivateFn = () => {

  const token = inject(AuthService);
  const router = inject(Router);

  if (token.isLoggedIn()) {
    return true;
  }

   return router.createUrlTree(['/login'])
}
