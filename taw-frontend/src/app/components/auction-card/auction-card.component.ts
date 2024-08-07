import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

export interface AuctionCard {
  ID: string;
  bookTitle: string;
  bookAuthor: string;
  bookDescription: string;
  base64Image: string;
}

@Component({
  selector: 'app-auction-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './auction-card.component.html',
  styleUrl: './auction-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionCardComponent {
  @Input({ required: true }) auctionID!: string;
  @Input({ required: true }) bookTitle!: string;
  @Input({ required: true }) bookAuthor!: string;
  @Input({ required: true }) bookDescription!: string;
  @Input() base64Image?: string;
}
