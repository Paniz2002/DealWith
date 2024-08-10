import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { NotificationService } from '../../services/popup/notification.service';

@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
})
export class AuctionDetailsComponent implements OnInit {
  auctionID: string;
  auctionDetails: any;
  constructor(
    private route: ActivatedRoute,
    private snackBar: NotificationService,
  ) {
    this.auctionID = this.route.snapshot.paramMap.get('id')!;
  }
  ngOnInit(): void {
    axios
      .get(enviroments.BACKEND_URL + 'api/auctions', {
        params: this.auctionID,
      })
      .then((details: any) => {})
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }
}
