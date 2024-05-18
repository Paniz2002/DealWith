import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
export const LogoutGuard: CanActivateFn = () => {
  const localStorage: LocalStorageService = inject(LocalStorageService);
  const router: Router = inject(Router);
  localStorage.set('jwt', '');
  return router.createUrlTree(['/login']);
};
