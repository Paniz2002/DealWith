import { Component } from '@angular/core';
import { AuctionCardComponent } from '../auction-card/auction-card.component';

@Component({
  selector: 'app-auction-list',
  standalone: true,
  imports: [AuctionCardComponent],
  templateUrl: './auction-list.component.html',
  styleUrl: './auction-list.component.css',
})
export class AuctionListComponent {}
