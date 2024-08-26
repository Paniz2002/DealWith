import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { NgClass, NgForOf, NgOptimizedImage } from '@angular/common';
export interface AuctionCard {
  ID: string;
  bookTitle: string;
  bookAuthor: string;
  bidDescription: string;
  base64Images: string[];
  currentPrice: Number;
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
  @Input({ required: true }) auctionID!: string;
  @Input({ required: true }) currentPrice!: string;
  @Input({ required: true }) bookTitle!: string;
  @Input({ required: true }) bookAuthor!: string;
  @Input({ required: true }) bidDescription!: string;
  @Input() base64Images?: string[];
  constructor(
    private router: Router,
  ){};

  viewDetails() {
    this.router.navigate(['/', this.auctionID]);
  }
}
