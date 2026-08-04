
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../auth-service';

export const RoleGuardService: CanActivateFn = (route )=> {
  const auth = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'];

  if (auth.getUserRole().match(expectedRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;

}
