import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import axios from 'axios';
export const logoutGuard: CanActivateFn = (route, state) => {
  const localStorage: LocalStorageService = inject(LocalStorageService);
  const router: Router = inject(Router);
  localStorage.set('jwt', '');
  delete axios.defaults.headers.common['Authorization'];
  return router.navigateByUrl('/login');
};
