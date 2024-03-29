import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
const isAuthenticated = async () => {
  try {
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me');
    if (res.status == 200) return true;
  } catch (e) {}
  return false;
};
export const authenticationGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  // Basically inject is the equivalent of
  // constructor(param: ...) when you are not using a class.
  // This means that it injects the object if it exists, else it creates
  // a new one.
  const router = inject(Router);
  const isAuth = await isAuthenticated();
  if (!isAuth) return router.createUrlTree(['/login']);
  return true;
};
