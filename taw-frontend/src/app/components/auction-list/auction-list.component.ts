import { Component, OnInit } from '@angular/core';
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { AuctionCard } from '../auction-card/auction-card.component';
import { NotificationService } from '../../services/popup/notification.service';
import { MatSliderModule } from '@angular/material/slider';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
    ReactiveFormsModule,
  ],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css',
})
/*
 * NOTE:
 * When selecting filters, if you click search the app-auction-list
 * fetches again the data and reloads the component.
 */
export class AuctionListComponent implements OnInit {
  form: FormGroup;
  availableAuctions: Array<AuctionCard> = Array<AuctionCard>();
  minPrice: Number = 0;
  searchText: string = '';
  condition: string = '';
  maxPrice: Number = Number.MAX_SAFE_INTEGER;
  showOnlyActive: boolean = false;
  constructor(
    private snackBar: NotificationService,
    private filterFormBuilder: FormBuilder,
  ) {
    this.form = this.filterFormBuilder.group({
      bookName: ['', [Validators.required, Validators.minLength(1)]],
      minStartingPrice: [0, [Validators.required]],
      maxStartingPrice: [Number.MAX_SAFE_INTEGER, [Validators.required]],
      condition: ['', [Validators.required]],
      active: [''],
    });
  }

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
          this.loadAuctionImages();
        }
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }

  private loadAuctionImages(): void {
    // Iterates on all available acutions to load images
    for (const auction of this.availableAuctions) {
      try {
        axios
          .get(`${environments.BACKEND_URL}/api/auctions/${auction.ID}/images`)
          .then((res) => {
            auction.base64Images = res.data.images;
          });
      } catch (error) {
        console.error(`Error loading images for auction ${auction.ID}`, error);
      }
    }
  }

  private getLastBidPrice(bids: any, startingPrice: Number): Number {
    let currMax: Number = -1;
    bids.forEach((bid: any) => {
      currMax = bid.price > currMax ? bid.price : currMax;
    });
    return currMax >= startingPrice ? currMax : startingPrice;
  }

  async searchWithFilters(): Promise<void> {
    this.availableAuctions.length = 0;
    const params = <Filter>{
      min_price: this.form.value.minStartingPrice,
      max_price: this.form.value.maxStartingPrice,
    };

    if (this.form.value.active) {
      params.active = true;
    }

    if (this.form.value.bookName) {
      params.q = this.form.value.bookName;
    }
    if (this.form.value.condition) {
      params.min_condition = this.form.value.condition;
    }
    axios
      .get(environments.BACKEND_URL + '/api/auctions', { params })
      .then((auctions: any) => {
        auctions.data.forEach((auction: any) => {
          this.availableAuctions.push(<AuctionCard>{
            ID: auction._id,
            bookTitle: auction.book.title,
            bookAuthor: auction.book.author,
            bidDescription: auction.description,
            currentPrice:
              auction.bids.length > 0
                ? this.getLastBidPrice(auction.bids, auction.starting_price)
                : auction.starting_price,
          });
        });
        this.loadAuctionImages();
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });
  }

  toggleActive(): void {
    this.showOnlyActive = !this.showOnlyActive;
  }
}
