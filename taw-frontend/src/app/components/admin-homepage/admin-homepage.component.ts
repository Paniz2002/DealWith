import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { MatTabsModule } from '@angular/material/tabs';
import { enviroments } from '../../../enviroments/enviroments';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { NotificationService } from '../../services/popup/notification.service';
import { TableStatusCardComponent } from '../table-status-card/table-status-card.component';
@Component({
  selector: 'app-admin-homepage',
  standalone: true,
  imports: [MatTabsModule, TableStatusCardComponent],
  templateUrl: './admin-homepage.component.html',
  styleUrl: './admin-homepage.component.css',
})
export class AdminHomepageComponent implements OnInit {
  constructor(
    private localStorage: LocalStorageService,
    private snackBar: NotificationService,
  ) {}
  freeTables = [];
  occupiedTables = [];
  ngOnInit(): void {
    axios
      .get(enviroments.BACKEND_URL + '/api/common/tables', {
        params: {
          status: 'free',
        },
        headers: {
          Authorization: this.localStorage.get('jwt'),
        },
      })
      .then((res) => {
        if (res.status === 200) this.freeTables = res.data;
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) this.snackBar.notify(err.message);
      });

    axios
      .get(enviroments.BACKEND_URL + '/api/common/tables', {
        params: {
          status: 'occupied',
        },
        headers: {
          Authorization: this.localStorage.get('jwt'),
        },
      })
      .then((res) => {
        if (res.status === 200) this.occupiedTables = res.data;
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) this.snackBar.notify(err.message);
      });
  }
}
