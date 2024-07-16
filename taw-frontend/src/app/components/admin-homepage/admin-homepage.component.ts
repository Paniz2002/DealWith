import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { NotificationService } from '../../services/popup/notification.service';
@Component({
  selector: 'app-admin-homepage',
  standalone: true,
  imports: [MatTabsModule],
  templateUrl: './admin-homepage.component.html',
  styleUrl: './admin-homepage.component.css',
})
export class AdminHomepageComponent implements OnInit {
  constructor(
    private localStorage: LocalStorageService,
    private snackBar: NotificationService,
  ) {}
  ngOnInit(): void {}
}
