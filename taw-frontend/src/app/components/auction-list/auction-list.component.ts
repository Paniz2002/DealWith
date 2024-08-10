import { Component, OnInit } from '@angular/core';
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import axios from 'axios';
import { enviroments } from '../../../enviroments/enviroments';
import { AuctionCard } from '../auction-card/auction-card.component';
import { NotificationService } from '../../services/popup/notification.service';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface Filter {
  q: string | null;
  min_starting_price: Number | null;
  max_starting_price: Number | null;
  min_condition: string;
  active: boolean | null;
}

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatLabel,
    AuctionCardComponent,
    MatSliderModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
  ],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css',
})
/*
 * TODO:
 * Add filters (you find them in backend)
 * NOTE:
 * When selecting filters, if you click search the app-auction-list
 * fetches again the data and reloads the component.
 */
export class AuctionListComponent implements OnInit {
  availableAuctions: Array<AuctionCard> = Array<AuctionCard>();
  minPrice: Number = 0;
  searchText: string = '';
  condition: string = '';
  maxPrice: Number = Number.MAX_SAFE_INTEGER;
  showOnlyActive: boolean = false;
  constructor(private snackBar: NotificationService) {}

  ngOnInit(): void {
    axios
      .get(enviroments.BACKEND_URL + '/api/auctions')
      .then((auctions: any) => {
        auctions.data.forEach((auction: any) => {
          this.availableAuctions.push(<AuctionCard>{
            ID: auction._id,
            bookTitle: auction.book.title,
            bidDescription: auction.description,
            base64Images: auction.images as string[],
            bookAuthor: 'ciano',
            currentPrice:
              auction.bids.length > 0
                ? this.getLastBidPrice(auction.bids, auction.starting_price)
                : auction.starting_price,
          });
        });
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }
  private getLastBidPrice(bids: any, startingPrice: Number): Number {
    let currMax: Number = -1;
    // There might be a "functional" way of doing it,
    // don't care though.
    bids.forEach((bid: any) => {
      currMax = bid.price > currMax ? bid.price : currMax;
    });
    return currMax >= startingPrice ? currMax : startingPrice;
  }

  searchWithFilters(): void {
    // Funny javascript moment
    // Clears the array.
    this.availableAuctions.length = 0;
    const params = <Filter>{
      min_starting_price: this.minPrice,
      max_starting_price: this.maxPrice,
      active: this.showOnlyActive,
    };
    if (this.searchText) {
      params.q = this.searchText;
    }
    if (this.condition) {
      params.min_condition = this.condition;
    }
    axios
      .get(enviroments.BACKEND_URL + '/api/auctions', { params })
      .then((auctions: any) => {
        auctions.data.forEach((auction: any) => {
          // FIXME:
          this.availableAuctions.push(<AuctionCard>{
            ID: auction._id,
            bookTitle: auction.book.title,
            bookAuthor: auction.book.author,
            bidDescription: auction.description,
            currentPrice:
              auction.bids.length > 0
                ? this.getLastBidPrice(auction.bids, auction.starting_price)
                : auction.starting_price,
            base64Images: auction.images,
          });
        });
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }

  toggleActive(): void {
    this.showOnlyActive = !this.showOnlyActive;
  }
}
