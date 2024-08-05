import { Component, OnInit } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  userType: string | null;
  isUserLoggedIn: string | null;
  constructor(protected localStorage: LocalStorageService) {
    this.userType = localStorage.get('userType');
    this.isUserLoggedIn = localStorage.get('isUserLoggedIn');
  }

  ngOnInit(): void {}
}
