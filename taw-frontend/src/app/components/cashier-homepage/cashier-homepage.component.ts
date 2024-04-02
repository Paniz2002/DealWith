import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { MatTabsModule } from '@angular/material/tabs';
@Component({
  selector: 'app-cashier-homepage',
  standalone: true,
  imports: [MatTabsModule],
  templateUrl: './cashier-homepage.component.html',
  styleUrl: './cashier-homepage.component.css',
})
export class CashierHomepageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
