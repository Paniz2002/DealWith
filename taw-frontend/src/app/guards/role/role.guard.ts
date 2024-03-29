import { CanActivateFn, Router } from '@angular/router';

import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { verify } from 'jsonwebtoken';
import { enviroments } from '../../../enviroments/enviroments';
import { inject } from '@angular/core';
const userHomepageRoute = async () => {
  const localStorage = inject(LocalStorageService);
  const router = inject(Router);
  const payload = verify(
    localStorage.get('jwt')!,
    enviroments.JWT_SECRET,
  ) as any;
  console.log(payload.role);
  // switch (payload.role) {
  //   case 'CASHIER':
  //     return router.createUrlTree(['/cashier']);
  //   default:
  //     return false;
  // }
  return true;
};
export const roleGuard: CanActivateFn = (route, state) => {
  return userHomepageRoute();
};
