import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ViewChildren,
  QueryList,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {MatDividerModule} from '@angular/material/divider';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {NgClass, NgForOf} from '@angular/common';
import {AuctionDetailsCountdownComponent} from '../auction-details-countdown/auction-details-countdown.component';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {NotificationService} from '../../services/popup/notification.service';
import {LocalStorageService} from '../../services/localStorage/localStorage.service';
import axios from 'axios';
import {environments} from '../../../environments/environments';
import {ChatComponent} from '../chat/chat.component';
import {SocketService} from '../../socket.service';
import {HeaderHeightService} from "../../services/header/header-height.service";

interface Course {
  name: string;
  university: string;
  year1: number;
  year2: number;
}


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
    ChatComponent,
  ],
  templateUrl: './auction-details.component.html',
  styleUrl: './auction-details.component.css',
})
export class AuctionDetailsComponent implements OnInit {
  @ViewChildren(ChatComponent) chatComponents!: QueryList<ChatComponent>;
  @ViewChild('tabs') tabGroup!: MatTabGroup;
  months: Array<string> = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  protected userType: string | null = '';
  protected isUserLoggedIn: boolean = false;
  protected whoAmI!: string;
  protected myId!: string;
  auctionID: string;
  auctionDetails!: any;
  endDate!: Date;
  endDateTime!: any;
  auctionPrice: Number = -1;
  isActive!: boolean;
  isLastBidOwner!: boolean;
  form: FormGroup = new FormGroup({
    bidPrice: new FormControl('', [Validators.required]),
  });

  coursesUniversities: Array<Course> = Array<Course>();

  auctionDetailsColumnHeight: string = '100vh';

  constructor(
    private route: ActivatedRoute,
    private snackBar: NotificationService,
    protected localStorage: LocalStorageService,
    protected socketService: SocketService,
    private headerHeightService: HeaderHeightService,
  ) {
    this.auctionID = this.route.snapshot.paramMap.get('id')!;
    axios.get(environments.BACKEND_URL + '/api/auth/me').then((res: any) => {
      this.whoAmI = res.data.username;
      this.myId = res.data._id;
      this.isUserLoggedIn = true;
      this.userType = res.data.is_moderator ? 'moderator' : 'student';
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

  isOwner(): boolean {
    return this.auctionDetails.seller._id === this.myId;
  }

  private isClientLastBidOwner(bids: any): any {
    if (bids.length === 0) {
      return false;
    }

    let currMax: Number = -1;
    let lastBidOwner = '';
    bids.forEach((bid: any) => {
      if (bid.price > currMax) {
        currMax = bid.price;
        lastBidOwner = bid.user.toString();
      }
    });

    return this.myId === lastBidOwner;
  }

  ngOnInit(): void {
    this.headerHeightService.headerHeight$.subscribe((height) => {
      this.auctionDetailsColumnHeight = `calc(100vh - ${height}px)`;
      console.log('navbard height', height);
    });
    this.initSocket();
    this.socketService.receivePublicComment((comment) => {
      console.log('Received public comment');
      this.reloadPublicChatContent(comment);
    });

    this.socketService.receivePrivateComment((comment) => {
      console.log('Received private comment');
      this.reloadPrivateChatContent(comment);
    });

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
        this.isActive = details.data.isActive;

        this.isLastBidOwner = this.isClientLastBidOwner(
          this.auctionDetails.bids,
        );

        this.form.controls['bidPrice'].setValue(
          this.auctionPrice.valueOf() + 0.01,
        );

        if (this.auctionDetails && this.auctionDetails.book && this.auctionDetails.book.courses) {
          this.auctionDetails.book.courses.forEach((course: any) => {
            this.coursesUniversities.push(
              {
                name: course.name,
                university: course.university.name,
                year1: course.year.year1,
                year2: course.year.year2,
              }
            );
          });
        }

        this.loadAuctionImages();
      })
      .catch((err) => {
        this.snackBar.notify(err.message);
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

  private loadAuctionImages(): void {
    try {
      const response = axios
        .get(
          `${environments.BACKEND_URL}/api/auctions/${this.auctionID}/images`,
        )
        .then((res) => {
          this.auctionDetails.base64Images = res.data.images;
        });
    } catch (error) {
      console.error(
        `Error loading images for auction ${this.auctionID}`,
        error,
      );
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

  initSocket() {
    this.socketService.joinAuctionRoom('auction_' + this.auctionID);
  }

  reloadPrivateChatContent(comment: any) {
    if (comment.receiver === this.myId || comment.sender === this.myId) {
      if (this.tabGroup.selectedIndex !== 0) this.tabGroup.selectedIndex = 0;
      this.chatComponents.toArray()[0].reloadPrivateChat(comment);
    }
  }

  reloadPublicChatContent(comment: any) {
    if (this.tabGroup.selectedIndex !== 1) this.tabGroup.selectedIndex = 1;
    this.chatComponents.toArray()[1].reloadPublicChat();
  }
}
