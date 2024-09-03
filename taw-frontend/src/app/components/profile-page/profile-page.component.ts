import {Component, OnInit} from '@angular/core';
import {AuctionCard, AuctionCardComponent} from "../auction-card/auction-card.component";
import axios, {AxiosResponse} from "axios";
import {environments} from "../../../environments/environments";
import {Router, RouterLink} from "@angular/router";
import {NotificationService} from "../../services/popup/notification.service";
import {HeaderHeightService} from "../../services/header/header-height.service";
import {MatIcon} from "@angular/material/icon";
import {UpdatePasswordComponent} from "../update-password/updatepassword.component";

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    AuctionCardComponent,
    RouterLink,
    MatIcon,
    UpdatePasswordComponent,
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  profile!: any;
  auctions: any[] = [];
  profilePageColumnHeight = '100vh';
  participatedAuctions: any[] = [];
  isClientEditing = false;
  constructor(
    private router: Router,
    private snackBar: NotificationService,
    protected headerHeightService: HeaderHeightService,
  ) {}

  async ngOnInit() : Promise<void>{
    axios.get(environments.BACKEND_URL + '/api/auth/me').then(async (res) => {
      this.profile = res.data;
      this.profile.createdAt = new Date(this.profile.createdAt);
      if(!this.profile.is_moderator) {
        // Fetch available auctions for the user
        this.auctions = await this.fetchAvailableAuctions();
        this.participatedAuctions = await this.fetchParticipatedAuctions();
        for (const auction of this.auctions) {
          auction.start_date = new Date(auction.start_date);
          auction.end_date = new Date(auction.end_date);
          auction.base64Images = await this.loadAuctionImages(auction);
        }
      }

      this.headerHeightService.headerHeight$.subscribe((height) => {
        this.profilePageColumnHeight = `calc((100vh - ${height}px - 5vh))`;
      });
    }).catch((err) => {
      this.snackBar.notify('Error fetching profile data');
    });
  }

  async fetchAvailableAuctions(): Promise<any[]> {
    if(!this.profile.is_moderator) {
      const res = await axios.get(environments.BACKEND_URL + '/api/auctions/me');
      return res.data;
    }else
      return [];
  }

  getLastBidPrice(bids: any, startingPrice: Number): Number {
    let currMax: Number = -1;
    bids.forEach((bid: any) => {
      currMax = bid.price > currMax ? bid.price : currMax;
    });
    return currMax >= startingPrice ? currMax : startingPrice;
  }

  protected async loadAuctionImages(auction: any) {
    try {
      const res = await axios.get(`${environments.BACKEND_URL}/api/auctions/${auction._id}/images`);
      return res.data.images;
    } catch (error) {
      this.snackBar.notify(`Error loading images for auction ${auction.ID}`);
    }
  }

  async fetchParticipatedAuctions() {
    const res = await axios.get(environments.BACKEND_URL + '/api/auctions/me/participated');
    return res.data;
  }


  openProfileEdit() {
    this.isClientEditing = true;
  }

  closeProfileEdit() {
    this.isClientEditing = false;
  }
}
