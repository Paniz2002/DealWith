import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
export const AdminGuard: CanActivateFn = async () => {
  try {
    const res = await axios.get(enviroments.BACKEND_URL + '/api/auth/me');
    if (res.status === 200) {
      return res.data.is_moderator === true;
    }
  } catch (e) {}
  return false;
};
