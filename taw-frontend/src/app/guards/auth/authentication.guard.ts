import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { environments } from '../../../environments/environments';

export const AuthenticationGuard: CanActivateFn = async () => {
  // Simplest way possible:
  // When we login we get the JWT from the backend.
  // When we need to access an authenticated route, we request this endpoint
  // that checks our JWT (it also does other things but we don't need them right now)
  // and if the request is successful, it means that we successfully authenticated
  // before.
  const router = inject(Router);

  try {
    const res = await axios.get(environments.BACKEND_URL + '/api/auth/me');
    return res.status === 200;
  } catch (e) {}
  return router.createUrlTree(['/login']);
};
