import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { Subscription } from 'rxjs';
import { EventManagerService } from '../../services/eventManager/event-manager.service';
import {socket} from "../../app.module";
// import {socket} from "../../../socket";


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatButton, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected userType: string | null = this.localStorage.get('userType');
  protected isUserLoggedIn: string | null =
    this.localStorage.get('isUserLoggedIn');
  protected changes: Subscription = new Subscription();
  constructor(
    protected localStorage: LocalStorageService,
    protected eventManager: EventManagerService,
  ) {}

  ngOnInit(): void {
    if(socket){
      socket.on("hello", (data: any)=>{
        console.log(data);
      });
    }else{
      console.log("Socket is not connected");
    }

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
  }
  ngOnDestroy(): void {
    this.changes.unsubscribe();
  }
}
