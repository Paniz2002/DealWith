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
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatButton } from '@angular/material/button';
import {ActivatedRoute, Router} from "@angular/router";

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
  form!: FormGroup;
  availableAuctions: Array<AuctionCard> = Array<AuctionCard>();
  condition: string = '';
  showOnlyActive: boolean = false;
  constructor(
    private snackBar: NotificationService,
    private filterFormBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.filterFormBuilder.group({
      queryString: ['', [Validators.required, Validators.minLength(1)]],
      minStartingPrice: ['', [Validators.required]],
      maxStartingPrice: ['', [Validators.required]],
      condition: ['', [Validators.required]],
      active: [true],
    });

    this.route.queryParams.subscribe(params => {
      this.form.patchValue({
        queryString: params['q'] || '',
        minStartingPrice: params['min_price'] || '',
        maxStartingPrice: params['max_price'] || '',
        condition: params['min_condition'] || '',
        active: params['active'] === 'true' || false,
      });
    });

    this.searchWithFilters();
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

  searchWithFilters(): void {
    this.availableAuctions.length = 0;
    const params = <Filter>{};

    if (this.form.value.queryString !== '' && this.form.value.queryString) {
      params.q = this.form.value.queryString;
    }else{
      params.q = null;
    }

    if (this.form.value.minStartingPrice) {
      params.min_price = this.form.value.minStartingPrice;
    }else{
      params.min_price = null;
    }

    if (this.form.value.maxStartingPrice) {
      params.max_price = this.form.value.maxStartingPrice;
    }else{
      params.max_price = null;
    }

    if (this.form.value.condition) {
      params.min_condition = this.form.value.condition;
    }

    if (this.form.value.active) {
      params.active = this.form.value.active;
    }else{
      params.active = null;
    }

    // Aggiorna l'URL con i parametri di query filtrati
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge', // Unisce i nuovi parametri con quelli esistenti
    });

    axios
      .get(environments.BACKEND_URL + '/api/auctions', { params })
      .then((auctions: any) => {
        for(const auction of auctions.data){
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
        }
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
