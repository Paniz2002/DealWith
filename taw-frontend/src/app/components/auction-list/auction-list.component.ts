import { Component, OnInit } from '@angular/core';
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { AuctionCard } from '../auction-card/auction-card.component';
import { NotificationService } from '../../services/popup/notification.service';
@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [AuctionCardComponent],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css',
})
/*
 * TODO:
 * Add filters (you find them in backend)
 * When selecting filters, if you click search the app-auction-list
 * fetches again the data.
 */
export class AuctionListComponent implements OnInit {
  auctions!: Array<AuctionCard>;
  constructor(private snackBar: NotificationService) {
    this.auctions = Array<AuctionCard>();
  }

  ngOnInit(): void {
    axios
      .get(enviroments.BACKEND_URL + '/api/auctions')
      .then((auctions: any) => {
        auctions.data.forEach((auction: any) => {
          this.auctions.push({
            ID: auction._id,
            bookTitle: auction.book.title,
            bookDescription: auction.description,
            base64Image: auction.images[0],
          } as AuctionCard);
        });
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }
}
