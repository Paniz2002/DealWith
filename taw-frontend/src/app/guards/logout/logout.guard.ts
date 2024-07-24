import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
export const LogoutGuard: CanActivateFn = () => {
  const router: Router = inject(Router);
  axios.post(enviroments.BACKEND_URL + '/api/auth/logout').then(() => {
    return router.createUrlTree(['/login']);
  });
  return router.createUrlTree(['/login']);
};
