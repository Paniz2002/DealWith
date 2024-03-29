import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
const isAuthenticated = async () => {
  const localStorage = inject(LocalStorageService);
  try {
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me', {
      headers: {
        Authorization: localStorage.get('jwt'),
      },
    });
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
  return isAuth ? true : router.navigateByUrl('/login');
};
