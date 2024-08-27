import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../../socket.service';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { HeaderHeightService } from '../../services/header/header-height.service';
import { NgClass, NgOptimizedImage } from '@angular/common';

interface Notification {
  isRead: boolean;
  text: string;
  _id: string;
  auction: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    RouterLink,
    MatMenuModule,
    MatMenuTrigger,
    MatIconButton,
    NgClass,
    NgOptimizedImage,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('header', { static: true }) header!: ElementRef;

  protected userType: string | null = '';
  protected isUserLoggedIn: boolean = false;
  protected changes: Subscription = new Subscription();
  private menuTimeout: any; // Timer for closing the menu
  protected notifications: Array<Notification> = []; // Array to hold notification messages
  protected notificationsCnt: number = 0; // Count of unread notifications

  constructor(
    protected localStorage: LocalStorageService,
    protected socketService: SocketService,
    private router: Router,
    private headerHeightService: HeaderHeightService,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
      const headerHeight = this.el.nativeElement.offsetHeight;
      this.headerHeightService.setHeaderHeight(headerHeight);
    }, 0);
  }

  async ngOnInit(): Promise<void> {
    this.notifications = []; // Reset notifications
    this.changes = this.router.events.subscribe(async (event) => {
      const res = await axios.get(environments.BACKEND_URL + '/api/auth/me');
      this.isUserLoggedIn = res.status === 200;
      if (this.isUserLoggedIn) {
        this.userType = res.data.is_moderator ? 'moderator' : 'student';
        this.initSocket();
        this.socketService.receiveMessage((message) => {
          this.setNotificationCnt(message);
        });
      }
    });
  }

  private setNotificationCnt(notification: Notification[]) {
    console.log('Notification received', notification);
    if (notification && notification.length > 0) {
      this.notifications = notification; // Store notifications

      //count notification with isRead=false
      this.notificationsCnt = notification.filter(
        (notification) => !notification.isRead,
      ).length;
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
      let notification = this.notifications.find(
        (notification) => notification._id === notificationId,
      );
      if (notification && !notification.isRead) {
        axios
          .patch(
            environments.BACKEND_URL + '/api/notifications/' + notificationId,
          )
          .then((res) => {
            if (res.status === 200) {
              this.notificationsCnt--;
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }

  deleteNotification(notificationId: string) {
    if (notificationId) {
      let notification = this.notifications.find(
        (notification) => notification._id === notificationId,
      );
      if (notification) {
        axios
          .delete(
            environments.BACKEND_URL + '/api/notifications/' + notificationId,
          )
          .then((res) => {
            if (res.status === 200) {
              this.notificationsCnt--;
              //remove notification from the list
              this.notifications = this.notifications.filter(
                (notification) => notification._id !== notificationId,
              );
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }

  initSocket() {
    if (this.isUserLoggedIn) {
      axios.get(environments.BACKEND_URL + '/api/auth/me').then((res) => {
        if (res.status === 200 && res.data && res.data._id) {
          this.socketService.joinRoom(res.data._id);
        }
      });
    }
  }
  async logout() {
    try {
      await axios.post(environments.BACKEND_URL + '/api/auth/logout');
    } finally {
      // Disconnect from the Socket.IO server
      this.socketService.disconnect();
      this.localStorage.clean();
      this.isUserLoggedIn = false;
      this.userType = '';
      return this.router.navigate(['/login']);
    }
  }
}
