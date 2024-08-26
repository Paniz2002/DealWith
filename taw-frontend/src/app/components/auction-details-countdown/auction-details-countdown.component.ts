import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'app-auction-details-countdown',
  templateUrl: './auction-details-countdown.component.html',
  standalone: true,
  styleUrls: ['./auction-details-countdown.component.scss'], // Correzione del nome della proprietà
})
export class AuctionDetailsCountdownComponent implements AfterViewInit {
  date: any;
  now: any;
  @Input() targetDate!: any;
  @Input() isEndDate!: boolean;
  targetTime: any;
  difference!: number;
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
  currentTime!: string;

  constructor(private cdRef:ChangeDetectorRef) {}

  @ViewChild('days', { static: true }) days!: ElementRef;
  @ViewChild('hours', { static: true }) hours!: ElementRef;
  @ViewChild('minutes', { static: true }) minutes!: ElementRef;
  @ViewChild('seconds', { static: true }) seconds!: ElementRef;

  ngAfterViewInit() {
    this.currentTime = `${
      this.months[this.targetDate.getMonth()]
    } ${this.targetDate.getDate()}, ${this.targetDate.getFullYear()}`;
    this.cdRef.detectChanges();


    setInterval(() => {
      this.tickTock();
      this.targetTime = this.targetDate.getTime();
      this.difference = this.targetTime - this.now;
      this.difference = this.difference / (1000 * 60 * 60 * 24);

      if (!isNaN(this.days.nativeElement.innerText)) {
        this.days.nativeElement.innerText = Math.floor(
          this.difference,
        ).toString();
      } else {
        this.days.nativeElement.innerHTML = `<mat-spinner></mat-spinner>`;
      }
    }, 1000);
  }

  tickTock() {
    this.date = new Date();
    this.now = this.date.getTime();
    this.days.nativeElement.innerText = Math.floor(this.difference).toString();
    this.hours.nativeElement.innerText = (23 - this.date.getHours()).toString();
    this.minutes.nativeElement.innerText = (
      60 - this.date.getMinutes()
    ).toString();
    this.seconds.nativeElement.innerText = (
      60 - this.date.getSeconds()
    ).toString();
  }
}
