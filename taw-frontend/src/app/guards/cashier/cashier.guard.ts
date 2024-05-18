import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { inject } from '@angular/core';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
export const CashierGuard: CanActivateFn = async () => {
  try {
    const localStorage = inject(LocalStorageService);
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me', {
      headers: {
        Authorization: localStorage.get('jwt')!,
      },
    });
    if (res.status === 200) {
      // TODO: Redirect on effective role?
      // I mean:
      // - If a bartender tries to access this route, we redirect him to
      // the bartender homepage
      return res.data.role === 'CASHIER';
    }
  } catch (e) {}
  return false;
};
