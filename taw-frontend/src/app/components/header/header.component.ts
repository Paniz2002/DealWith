import {Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {LocalStorageService} from '../../services/localStorage/localStorage.service';
import {Subscription} from 'rxjs';
import {EventManagerService} from '../../services/eventManager/event-manager.service';
import {SocketService} from "../../socket.service";
import axios from "axios";
import {environments} from "../../../environments/environments";
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import {NgClass} from "@angular/common";

interface Notification {
  isRead: boolean;
  text: string;
  _id: string;
  auction: string;
}


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatButton, RouterLink, MatMenuModule, MatMenuTrigger, MatIconButton, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected userType: string | null = this.localStorage.get('userType');
  protected isUserLoggedIn: string | null = this.localStorage.get('isUserLoggedIn');
  protected changes: Subscription = new Subscription();
  private menuTimeout: any;  // Timer for closing the menu
  protected notifications: Array<Notification> = []; // Array to hold notification messages
  protected notificationsCnt: number = 0; // Count of unread notifications


  constructor(
    protected localStorage: LocalStorageService,
    protected eventManager: EventManagerService,
    protected socketService: SocketService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.changes.add(
      this.eventManager.loginOk.subscribe(() => {
        this.notifications = []; // Reset notifications
        this.userType = this.localStorage.get('userType');
        this.isUserLoggedIn = this.localStorage.get('isUserLoggedIn');
        this.initSocket();
        this.socketService.receiveMessage((message) => {
          this.setNotificationCnt(message);
        });
      }),
    );

    this.changes.add(
      this.eventManager.logoutOk.subscribe(() => {
        this.notifications = []; // Clear notifications
        this.userType = this.localStorage.get('userType');
        this.isUserLoggedIn = this.localStorage.get('isUserLoggedIn');
      }),
    );

    if (this.isUserLoggedIn) {
      this.initSocket();
      this.socketService.receiveMessage((message) => {
        this.setNotificationCnt(message);
      });
    }
  }

  private setNotificationCnt(notification: Notification[]) {
    console.log('Notification received', notification);
    if (notification && notification.length > 0) {
      this.notifications = notification; // Store notifications

      //count notification with isRead=false
      this.notificationsCnt = notification.filter((notification) => !notification.isRead).length;
    }
  }

  openMenu(menu: MatMenuTrigger) {
    clearTimeout(this.menuTimeout);
    menu.openMenu();
  }

  keepMenuOpen() {
    clearTimeout(this.menuTimeout);
  }

  closeMenu(menu: MatMenuTrigger) {
    this.menuTimeout = setTimeout(() => {
      menu.closeMenu();
    }, 300); // Adjust the timeout as needed
  }

  ngOnDestroy(): void {
    this.changes.unsubscribe();
  }

  async viewAuction(auctionId: string) {
    return await this.router.navigate(['/' + auctionId]); //FIXME: does not change page when I'm in an auction detail page
  }




  markNotificationAsSeen(notificationId: string) {
    if (notificationId) {
      let notification = this.notifications.find(notification => notification._id === notificationId);
      if (notification && !notification.isRead) {
        axios.patch(environments.BACKEND_URL + '/api/notifications/' + notificationId).then(res => {
          if (res.status === 200) {
            this.notificationsCnt--;
          }
        }).catch(err => {
          console.error(err);
        })
      }
    }
  }

  deleteNotification(notificationId: string) {
    if (notificationId) {
      let notification = this.notifications.find(notification => notification._id === notificationId);
      if (notification) {
        axios.delete(environments.BACKEND_URL + '/api/notifications/' + notificationId).then(res => {
          if (res.status === 200) {
            this.notificationsCnt--;
            //remove notification from the list
            this.notifications = this.notifications.filter(notification => notification._id !== notificationId);
          }
        }).catch(err => {
          console.error(err);
        })
      }
    }
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

