import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { NotificationService } from '../../services/popup/notification.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import {NgClass, NgForOf} from "@angular/common";
import {AuctionDetailsCountdownComponent} from "../auction-details-countdown/auction-details-countdown.component";
@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    NgForOf,
    NgClass,
    AuctionDetailsCountdownComponent,
  ],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
})
export class AuctionDetailsComponent implements OnInit {
  auctionID: string;
  auctionDetails!: any;
  publicComments!: any;
  privateComments!: any;
  endDate!: Date ;
  auctionPrice: Number = -1;
  form: FormGroup = new FormGroup({
    bidPrice: new FormControl('', [Validators.required]),
  });
  commentForm: FormGroup = new FormGroup({
    comment: new FormControl('', [Validators.required]),
  });
  coursesUniversities: Array<string> = Array<string>();
  constructor(
    private route: ActivatedRoute,
    private snackBar: NotificationService,
    protected localStorage: LocalStorageService,
  ) {
    this.auctionID = this.route.snapshot.paramMap.get('id')!;
  }

  // TODO: import from auctionlist
  private getLastBidPrice(bids: any, startingPrice: Number): Number {
    let currMax: Number = -1;
    bids.forEach((bid: any) => {
      currMax = bid.price > currMax ? bid.price : currMax;
    });
    return currMax >= startingPrice ? currMax : startingPrice;
  }

  // TODO: ERROR TypeError: ctx.auctionDetails is undefined
  // this happens because fetching from mongo web is slow as fuck.
  // (fix even if you use mongo docker)
  ngOnInit(): void {
    axios
      .get(environments.BACKEND_URL + '/api/auctions/' + this.auctionID)
      .then((details: any) => {
        this.auctionDetails = details.data;
        this.endDate = new Date(this.auctionDetails.end_date);
        this.auctionPrice = this.getLastBidPrice(
          this.auctionDetails.bids,
          this.auctionDetails.starting_price,
        );
        this.auctionDetails.book.courses.forEach((course: any) => {
          this.coursesUniversities.push(
            course.name + ', ' + course.university.name,
          );
        });

        this.loadAuctionImages();
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });

    axios
      .get(environments.BACKEND_URL + '/api/auctions/comments', {
        params: {
          isPrivate: true,
          auctionID: this.auctionID,
        },
      })
      .then((res: any) => {
        console.log(res.data);
      });
  }
  protected async submitBid(): Promise<void> {
    const params = {
      auctionID: this.auctionID,
      price: this.form.value.bidPrice,
    };
    const res = await axios.post(
      environments.BACKEND_URL + '/api/auctions/' + this.auctionID,
      params,
    );

    window.location.reload();
  }
  protected async submitComment(isPublic: boolean = true): Promise<void> {
    const params = {};
  }

  private loadAuctionImages(): void {
    try {
      const response = axios.get(
        `${environments.BACKEND_URL}/api/auctions/${this.auctionID}/images`,
      ).then((res) => {
        this.auctionDetails.base64Images = res.data.images;
      });

    } catch (error) {
      console.error(`Error loading images for auction ${this.auctionID}`, error);
    }
  }

  protected readonly Date = Date;
}
