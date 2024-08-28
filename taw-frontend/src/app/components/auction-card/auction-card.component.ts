import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {Router, RouterLink} from '@angular/router';
import {MatChipsModule} from '@angular/material/chips';
import {NgClass, NgForOf, NgOptimizedImage} from '@angular/common';

export interface AuctionCard {
  ID: string;
  bookTitle: string;
  bookAuthor: string;
  bidDescription: string;
  base64Images: string[];
  currentPrice: number;
  bidsLength: number;
  start_date: Date;
  end_date: Date;
}

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    NgForOf,
    NgOptimizedImage,
    NgClass,
  ],
  templateUrl: './auction-card.component.html',
  styleUrl: './auction-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionCardComponent {
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
  @Input({ required: true }) auctionID!: string;
  @Input({ required: true }) currentPrice!: number;
  @Input({ required: true }) bookTitle!: string;
  @Input({ required: true }) bookAuthor!: string;
  @Input({ required: true }) bidDescription!: string;
  @Input() base64Images?: string[];
  @Input() bidsLength!: number;
  @Input() start_date!: Date;
  @Input() end_date!: Date;

  constructor(
    private router: Router,
  ){};

  viewDetails() {
    this.router.navigate(['/', this.auctionID]);
  }

  getDateString(date: Date) {
    return `${
      this.months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  }

  protected readonly Date = Date;
}
