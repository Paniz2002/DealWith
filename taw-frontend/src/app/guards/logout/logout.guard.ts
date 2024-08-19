import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { EventManagerService } from '../../services/eventManager/event-manager.service';
import {SocketService} from "../../socket.service";
export const LogoutGuard: CanActivateFn = async () => {
  const router: Router = inject(Router);
  const eventManager: EventManagerService = inject(EventManagerService);
  const localStorage: LocalStorageService = inject(LocalStorageService);
  const socketService: SocketService = inject(SocketService);  // Inject the SocketService
  try {
    await axios.post(environments.BACKEND_URL + '/api/auth/logout');
  } finally {
    // Disconnect from the Socket.IO server
    socketService.disconnect();
    localStorage.clean();
    eventManager.logoutOk.emit();
    return router.createUrlTree(['/login']);
  }
};
