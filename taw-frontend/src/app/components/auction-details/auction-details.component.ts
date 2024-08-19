import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import { NotificationService } from '../../services/popup/notification.service';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [
    MatListModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
  ],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
})
export class AuctionDetailsComponent implements OnInit {
  protected whoAmI!: string;
  auctionID: string;
  auctionDetails!: any;
  publicComments: Array<any> = [];
  privateComments: Array<any> = [];
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
    axios.get(environments.BACKEND_URL + '/api/auth/me').then((res: any) => {
      this.whoAmI = res.data._id;
    });
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
        this.auctionPrice = this.getLastBidPrice(
          this.auctionDetails.bids,
          this.auctionDetails.starting_price,
        );
        this.auctionDetails.book.courses.forEach((course: any) => {
          this.coursesUniversities.push(
            course.name + ', ' + course.university.name,
          );
        });
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
      });

    axios
      .get(
        environments.BACKEND_URL +
          '/api/auctions/' +
          this.auctionID +
          '/comments',
        {
          params: {
            isPrivate: true,
          },
        },
      )
      .then((res: any) => {
        console.log(res.data);
        for (let data of res.data.public_comments) {
          this.publicComments.push(data);
        }
        for (let data of res.data.private_comments) {
          this.privateComments.push(data);
        }
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
  }
  protected async submitComment(isPrivate: boolean = false): Promise<void> {
    const params = {};
  }
  protected async replyDialog() {}
}
