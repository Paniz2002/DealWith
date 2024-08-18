import { Component, OnInit } from '@angular/core';
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import axios from 'axios';
import { environments } from '../../../environments/environments';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatButton } from '@angular/material/button';

interface Filter {
  q: string | null;
  min_price: Number | null;
  max_price: Number | null;
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
    MatPaginatorModule,
    MatGridList,
    MatGridTile,
    MatButton,
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
      .get(environments.BACKEND_URL + '/api/auctions')
      .then(async (auctions: any) => {
        for (const auction of auctions.data) {
          this.availableAuctions.push(<AuctionCard>{
            ID: auction._id,
            bookTitle: auction.book.title,
            bidDescription: auction.description,
            base64Images: [],
            bookAuthor: auction.book.author,
            currentPrice:
              auction.bids.length > 0
                ? this.getLastBidPrice(auction.bids, auction.starting_price)
                : auction.starting_price,
          });

          await this.loadAuctionImages();
        }
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }

  private async loadAuctionImages(): Promise<void> {
    // Itera su ogni asta disponibile per caricare le immagini
    for (const auction of this.availableAuctions) {
      try {
        const response = await axios.get(
          `${environments.BACKEND_URL}/api/auctions/${auction.ID}/images`,
        );

        // Aggiorna l'asta con le immagini caricate
        auction.base64Images = response.data.images;
      } catch (error) {
        console.error(`Error loading images for auction ${auction.ID}`, error);
      }
    }
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
      min_price: this.minPrice,
      max_price: this.maxPrice,
    };

    if (this.showOnlyActive) {
      params.active = true;
    }

    if (this.searchText) {
      params.q = this.searchText;
    }
    if (this.condition) {
      params.min_condition = this.condition;
    }
    console.log(params);
    axios
      .get(environments.BACKEND_URL + '/api/auctions', { params })
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
