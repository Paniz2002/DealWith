import { CanActivateFn, Router } from '@angular/router';

const userHomepageRoute = async () => {
  return true;
};
export const roleGuard: CanActivateFn = (route, state) => {
  return userHomepageRoute();
};
