import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { inject } from '@angular/core';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
export const AdminGuard: CanActivateFn = async () => {
  try {
    const localStorage = inject(LocalStorageService);
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me', {
      headers: {
        Authorization: localStorage.get('jwt')!,
      },
    });
    if (res.status === 200) {
      return res.data.is_moderator === true;
    }
  } catch (e) {}
  return false;
};
