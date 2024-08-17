import { OnInit, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { enviroments } from '../../../enviroments/enviroments';
import axios from 'axios';
export interface AuctionCard {
  ID: string;
  bookTitle: string;
  bookAuthor: string;
  bidDescription: string;
  currentPrice: Number;
}

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatChipsModule, MatButtonModule],
  templateUrl: './auction-card.component.html',
  styleUrl: './auction-card.component.css',
})
export class AuctionCardComponent implements OnInit {
  @Input({ required: true }) auctionID!: string;
  @Input({ required: true }) currentPrice!: string;
  @Input({ required: true }) bookTitle!: string;
  @Input({ required: true }) bookAuthor!: string;
  @Input({ required: true }) bidDescription!: string;
  images?: string[];
  ngOnInit(): void {
    axios
      .get(
        enviroments.BACKEND_URL + '/api/auctions/' + this.auctionID + '/images',
        {},
      )
      .then((res: any) => {
        this.images = res.data.images;
        for (let image of this.images!) {
          image = 'data:image/jpg;base64,' + image;
        }
      });
  }
}
