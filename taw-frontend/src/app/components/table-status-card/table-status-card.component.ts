import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: '[app-table-status-card]',
  standalone: true,
  imports: [],
  templateUrl: './table-status-card.component.html',
  styleUrl: './table-status-card.component.css',
})
export class TableStatusCardComponent implements OnInit {
  @Input('app-table-status-card') filters: any;
  constructor() {
    this.filters = JSON.parse(this.filters);
  }
  ngOnInit(): void {}
}
