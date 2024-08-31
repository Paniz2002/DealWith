import {
  Component,
  OnInit,
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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { NgClass, NgForOf } from '@angular/common';
import { AuctionDetailsCountdownComponent } from '../auction-details-countdown/auction-details-countdown.component';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/popup/notification.service';
import { LocalStorageService } from '../../services/localStorage/localStorage.service';
import axios from 'axios';
import { environments } from '../../../environments/environments';
import { ChatComponent } from '../chat/chat.component';
import { SocketService } from '../../socket.service';
import { HeaderHeightService } from '../../services/header/header-height.service';
import { AuctionEditComponent } from '../auction-edit/auction-edit.component';
import {MatDialog} from "@angular/material/dialog";
import {DialogComponent} from "../dialog/dialog.component";
import {ChatUnavailableComponent} from "../chat-unavailable/chat-unavailable.component";
import {Location} from "@angular/common";

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
    AuctionEditComponent,
    ChatUnavailableComponent,
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
  startDate!: Date;

  endDateTime!: any;
  startDateTime!: any;
  auctionPrice: Number = -1;
  isActive!: boolean;
  isLastBidOwner!: boolean;
  isNewBidReceived: boolean = false;
  form: FormGroup = new FormGroup({
    bidPrice: new FormControl('', [Validators.required]),
  });

  coursesUniversities: Array<Course> = Array<Course>();

  auctionDetailsColumnHeight: string = '100vh';
  isClientEditingAuction: boolean = false;
  auctionId: any;

  constructor(
    private route: ActivatedRoute,
    private snackBar: NotificationService,
    private router: Router,
    protected socketService: SocketService,
    private headerHeightService: HeaderHeightService,
    public dialog: MatDialog,
    private location: Location
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

  isOwner(): boolean {
    return this.auctionDetails.seller._id === this.myId;
  }

  protected isClientLastBidOwner(bids: any): any {
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
    if(this.isUserLoggedIn)
      return this.myId === lastBidOwner;
    else
      return false;
  }

  ngOnInit(): void {
    this.loadAuctionDetails();

    this.initSocket();
    this.socketService.receivePublicComment((comment) => {
      console.log('Received public comment');
      this.reloadPublicChatContent(comment);
    });

    this.socketService.receivePrivateComment((comment) => {
      console.log('Received private comment');
      this.reloadPrivateChatContent(comment);
    });

    this.socketService.receiveNewBid((comment) => {
      // partial update of auction details
      this.reloadBidDetails();
      this.isNewBidReceived = true;
    });
  }

  loadAuctionDetails() {
    this.auctionID = this.route.snapshot.paramMap.get('id')!;
    axios.get(environments.BACKEND_URL + '/api/auth/me').then((res: any) => {
      this.whoAmI = res.data.username;
      this.myId = res.data._id;
      this.isUserLoggedIn = true;
      this.userType = res.data.is_moderator ? 'moderator' : 'student';
    }).catch((err) => {
      //if (err.status === 400) {
        this.isUserLoggedIn = false;
      /*}else{
        this.router.navigate(['/login']);
        this.snackBar.notify(err.message);
      }*/
    });

    this.headerHeightService.headerHeight$.subscribe((height) => {
      this.auctionDetailsColumnHeight = `calc(100vh - ${height}px)`;
    });

    axios
      .get(environments.BACKEND_URL + '/api/auctions/' + this.auctionID)
      .then((details: any) => {
        this.auctionDetails = details.data;
        this.endDate = new Date(this.auctionDetails.end_date);
        this.startDate = new Date(this.auctionDetails.start_date);
        this.endDateTime = `${
          this.months[this.endDate.getMonth()]
        } ${this.endDate.getDate()}, ${this.endDate.getFullYear()}`;
        this.startDateTime = `${
          this.months[this.startDate.getMonth()]
        } ${this.startDate.getDate()}, ${this.startDate.getFullYear()}`;
        this.auctionPrice = this.getLastBidPrice(
          this.auctionDetails.bids,
          this.auctionDetails.starting_price,
        );
        this.isActive = details.data.isActive;

        this.isLastBidOwner = this.isClientLastBidOwner(this.auctionDetails.bids);

        this.form.controls['bidPrice'].setValue(
          this.auctionPrice.valueOf() + 0.01,
        );

        if (
          this.auctionDetails &&
          this.auctionDetails.book &&
          this.auctionDetails.book.courses
        )
        {
          this.coursesUniversities = [];
          this.auctionDetails.book.courses.forEach((course: any) => {
            this.coursesUniversities.push({
              name: course.name,
              university: course.university.name,
              year1: course.year.year1,
              year2: course.year.year2,
            });
          });
        }

        this.loadAuctionImages();
      })
      .catch((err) => {
        if (!err.ok) {
          //navigate to 404 page
          this.router.navigate(['/notfound']);
          return;
        }
        this.snackBar.notify(err.message);
      });
  }

  reloadBidDetails() {
    axios.get(environments.BACKEND_URL + '/api/auctions/' + this.auctionID).then((details: any) => {
      this.auctionDetails.bids = details.data.bids;
      this.auctionDetails.starting_price = details.data.starting_price;
      this.auctionPrice = this.getLastBidPrice(
        this.auctionDetails.bids,
        this.auctionDetails.starting_price,
      );

      this.isLastBidOwner = this.isClientLastBidOwner(this.auctionDetails.bids);

      this.form.controls['bidPrice'].setValue(
        this.auctionPrice.valueOf() + 0.01,
      );
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

    this.reloadBidDetails();
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

  openAuctionEdit() {
    this.isClientEditingAuction = true;
  }

  closeAuctionEdit() {
    this.isClientEditingAuction = false;
  }

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

  backClicked() {
    this.location.back();
  }

  async deleteAuction() {

    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: {title: 'Delete Auction', content: 'Are you sure you want to delete this auction?'}
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {

          const res = await axios.delete(
            environments.BACKEND_URL + '/api/auctions/' + this.auctionID,
          );

          if (res.status === 200) {
            this.snackBar.notify('Auction deleted successfully');
            return this.router.navigate(['/']);
          }
          return;
        } catch (err) {
          console.log(err);
          this.snackBar.notify('Error while deleting auction');
          return;
        }
      }else{
        this.snackBar.notify('Auction deletion cancelled');
        return;
      }
    });
  }
}
