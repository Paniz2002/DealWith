import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { environments } from '../../../enviroments/environments';
export const AdminGuard: CanActivateFn = async () => {
  try {
    const res = await axios.get(environments.BACKEND_URL + '/api/auth/me');
    return res.status === 200 && res.data.is_moderator === true;
  } catch (e) {}
  return false;
};
