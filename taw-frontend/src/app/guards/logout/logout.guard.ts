import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
export const LogoutGuard: CanActivateFn = () => {
  const router: Router = inject(Router);
  const localStorage: LocalStorageService = inject(LocalStorageService);
  axios.post(enviroments.BACKEND_URL + '/api/auth/logout').then(() => {
    localStorage.clean();
    return router.createUrlTree(['/login']);
  });
  localStorage.clean();
  return router.createUrlTree(['/login']);
};
