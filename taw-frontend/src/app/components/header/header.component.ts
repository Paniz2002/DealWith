import {Component, OnInit, OnDestroy} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {LocalStorageService} from '../../services/localStorage/localStorage.service';
import {Subscription} from 'rxjs';
import {EventManagerService} from '../../services/eventManager/event-manager.service';
import {SocketService} from "../../socket.service";
import axios from "axios";
import {environments} from "../../../environments/environments";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatButton, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected userType: string | null = this.localStorage.get('userType');
  protected isUserLoggedIn: string | null = this.localStorage.get('isUserLoggedIn');
  protected changes: Subscription = new Subscription();
  protected notificationCount: number = 0; // Initialize notification count //FIXME: init with the real number of notifications of the current user


  constructor(
    protected localStorage: LocalStorageService,
    protected eventManager: EventManagerService,
    protected socketService: SocketService, // Inject SocketService

  ) {
  }

  ngOnInit(): void {

    this.changes.add(
      this.eventManager.loginOk.subscribe(() => {
        this.userType = this.localStorage.get('userType');
        this.isUserLoggedIn = this.localStorage.get('isUserLoggedIn');
      }),
    );
    this.changes.add(
      this.eventManager.logoutOk.subscribe(() => {
        this.userType = this.localStorage.get('userType');
        this.isUserLoggedIn = this.localStorage.get('isUserLoggedIn');
      }),
    );
    this.initSocket();
    this.socketService.receiveMessage((message: string) => {
      this.notificationCount++;
    });
  }

  ngOnDestroy(): void {
    this.changes.unsubscribe();
  }

  initSocket() {
    if (this.isUserLoggedIn) {
      axios.get(environments.BACKEND_URL + '/api/auth/me').then(res => {
        if (res.status === 200 && res.data && res.data._id) {
          this.socketService.joinRoom(res.data._id);
        }
      })
    }
  }
}
