import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import axios from 'axios';
import {enviroments} from '../../../enviroments/enviroments';
import {LocalStorageService} from '../../services/localStorage/localStorage.service';

/**
 * This guard redirects the user to his homepage for his role.
 */
export const RoleGuard: CanActivateFn = async () => {
  // TODO: Do we let this rant here when we submit the project?
  // I swear they're funny and innocent, not like the CS:GO ones.
  // Angular does not allow me to natively dynamically load a component
  // without creating spaghetti code.
  // So, I will call the /me endpoint whenever I need to reroute. AND NOBODY WILL STOP ME.
  // Thus, if somebody else modifies that endpoint, the whole universe (the project)
  // will collapse.
  // I swear /whoami is funnier.
  // certified left-pad moment.
  const router = inject(Router);
  const localStorage = inject(LocalStorageService);
  try {
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me', {
      headers: {
        Authorization: localStorage.get('jwt')!,
      },
    });
    if (res.status === 200) {
      if (res.data.is_moderator === true) {
        return router.createUrlTree(['/admin']);
      }
    }
    return router.createUrlTree(['/home']);
  } catch (e) {
    return router.createUrlTree(['/login']);
  }
};
