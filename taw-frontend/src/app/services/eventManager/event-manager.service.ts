import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventManagerService {
  loginOk = new EventEmitter<void>();
  logoutOk = new EventEmitter<void>();
  constructor() {}
}
