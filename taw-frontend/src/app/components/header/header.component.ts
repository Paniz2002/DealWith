import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbar, MatIcon, MatButton, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnChanges {
  userType: string | null = this.localStorage.get('userType');
  isUserLoggedIn: string | null = this.localStorage.get('isUserLoggedIn');
  constructor(protected localStorage: LocalStorageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.userType = this.localStorage.get('userType');
    this.isUserLoggedIn = this.localStorage.get('isUserLoggedIn');
  }
}
