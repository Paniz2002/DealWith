import { Component, OnInit, inject } from '@angular/core';
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
import {NgClass, NgForOf} from "@angular/common";
import {AuctionDetailsCountdownComponent} from "../auction-details-countdown/auction-details-countdown.component";
import { MatIconModule } from '@angular/material/icon';
import { ReplyDialogComponent } from '../reply-dialog/reply-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {ActivatedRoute} from "@angular/router";
import {NotificationService} from "../../services/popup/notification.service";
import {LocalStorageService} from "../../services/localStorage/localStorage.service";
import axios from "axios";
import {environments} from "../../../environments/environments";
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
    NgForOf,
    NgClass,
    AuctionDetailsCountdownComponent,
  ],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
})
export class AuctionDetailsComponent implements OnInit {
  months: Array<string> = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  protected whoAmI!: string;
  auctionID: string;
  auctionDetails!: any;
  publicComments: Array<any> = [];
  privateComments: Array<any> = [];
  endDate!: Date ;
  endDateTime!: any;
  auctionPrice: Number = -1;
  isLastBidOwner!: boolean;
  form: FormGroup = new FormGroup({
    bidPrice: new FormControl('', [Validators.required]),
  });
  commentForm: FormGroup = new FormGroup({
    publicComment: new FormControl('', [Validators.required]),
    privateComment: new FormControl('', [Validators.required]),
  });
  coursesUniversities: Array<string> = Array<string>();
  replyDialog: MatDialog = inject(MatDialog);
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

  private isClientLastBidOwner(bids: any):any {
    if(bids.length === 0) {
      return false;
    }

    let currMax: Number = -1;
    let owner = '';
    bids.forEach((bid: any) => {
      if (bid.price > currMax) {
        currMax = bid.price;
        owner = bid.user.toString();
      }
    });

    return axios.get(environments.BACKEND_URL + '/api/auth/me').then((res: any) => {
      console.log(res.data._id);
      console.log(owner);
      console.log(res.data._id === owner);

      return res.data._id === owner;
    }).catch((err) => {
      console.error(err);
    });

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
        this.endDateTime = `${
          this.months[this.endDate.getMonth()]
        } ${this.endDate.getDate()}, ${this.endDate.getFullYear()}`;
        this.auctionPrice = this.getLastBidPrice(
          this.auctionDetails.bids,
          this.auctionDetails.starting_price,
        );

        this.isLastBidOwner = this.isClientLastBidOwner(this.auctionDetails.bids);

        this.form.controls['bidPrice'].setValue(this.auctionPrice.valueOf() + 0.01);

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

    window.location.reload();
  }
  protected async submitComment(isPrivate: boolean = false): Promise<void> {
    const msg = isPrivate
      ? this.commentForm.value.privateComment
      : this.commentForm.value.publicComment;
    const params = {
      isPrivate: isPrivate ? isPrivate : null,
      text: msg,
    };
    const response = await axios.post(
      environments.BACKEND_URL +
        '/api/auctions/' +
        this.auctionID +
        '/comments',
      params,
    );
    if (response.status === 200) {
      this.snackBar.notify('Message sent successfully');
      // TODO: socket update
    }
  }
  protected async replyTo(commentID: string, isPrivate: boolean = false) {
    this.replyDialog.open(ReplyDialogComponent, {
      data: {
        commentID: commentID,
        auctionID: this.auctionID,
        isPrivate: isPrivate,
      },
    });
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

  onPriceChange($event: any) {
    let value = $event.target.value;

    if (value <= this.auctionPrice) {
      value = this.auctionPrice.valueOf() + 0.01;
    }

    this.form.controls['bidPrice'].setValue(parseFloat(value).toFixed(2));
  }

}
