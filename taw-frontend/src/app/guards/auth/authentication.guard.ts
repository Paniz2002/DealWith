import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
export const authenticationGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  // Basically inject is the equivalent of
  // constructor(param: ...) when you are not using a class.
  // This means that it injects the object if it exists, else it creates
  // a new one.
  const routes = inject(Router);
  let cond = false;
  if (cond) return true;
  return routes.navigateByUrl('/login');
};
