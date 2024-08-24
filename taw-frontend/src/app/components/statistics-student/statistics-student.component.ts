import {Component, OnInit} from '@angular/core';
import {Chart, ChartOptions, ChartType, registerables} from 'chart.js';
import {ChartDataset} from 'chart.js';
import axios from 'axios';
import {BaseChartDirective} from 'ng2-charts';
import {environments} from '../../../environments/environments';
import {Router} from "@angular/router";

@Component({
  selector: 'app-statistics-student',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './statistics-student.component.html',
  styleUrls: ['./statistics-student.component.css']
})
export class StatisticsStudentComponent implements OnInit {
  // Placed Auctions Chart Data
  public lineChartData: ChartDataset[] = [
    {data: [], label: 'Active Auctions', hidden: false},
    {data: [], label: 'Closed and Sold Auctions', hidden: false},
    {data: [], label: 'Closed and Not Sold Auctions', hidden: false}
  ];
  public lineChartLabels: string[] = [];

  // Participated Auctions Chart Data
  public participatedChartData: ChartDataset[] = [
    {data: [], label: 'Participated Auctions', hidden: false}
  ];
  public participatedChartLabels: string[] = [];

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {display: true}
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartLegend = true;
  public lineChartPlugins = [];

  public auctions: any[] = [];
  public participatedAuctions: any[] = [];

  constructor(private router: Router) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Fetch My Placed Auctions
    axios.get(environments.BACKEND_URL + '/api/auctions/me')
      .then(response => {
        const data = response.data;
        this.processPlacedAuctionsData(data);
      })
      .catch(error => {
        console.error('There was an error fetching the auction data!', error);
      });

    // Fetch My Participated Auctions
    axios.get(environments.BACKEND_URL + '/api/auctions/me/participated')
      .then(response => {
        const data = response.data;
        this.processParticipatedAuctionsData(data);
      })
      .catch(error => {
        console.error('There was an error fetching the participated auction data!', error);
      });

    // Force update charts
    setTimeout(() => {
      this.lineChartData = [...this.lineChartData];
      this.participatedChartData = [...this.participatedChartData];
    }, 500);
  }

  processPlacedAuctionsData(data: any): void {
    const activeAuctions: { [key: string]: number } = {};
    const closedSoldAuctions: { [key: string]: number } = {};
    const closedNotSoldAuctions: { [key: string]: number } = {};

    data.forEach((auction: any) => {
      const endDate = new Date(auction.end_date);
      const monthYear = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}-${endDate.getUTCDate()}`;

      if (!this.lineChartLabels.includes(monthYear)) {
        this.lineChartLabels.push(monthYear);
      }

      // Sorting labels by date
      this.lineChartLabels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      if (auction.isActive) {
        activeAuctions[monthYear] = (activeAuctions[monthYear] || 0) + 1;
      } else if (auction.isSold) {
        closedSoldAuctions[monthYear] = (closedSoldAuctions[monthYear] || 0) + 1;
      } else {
        closedNotSoldAuctions[monthYear] = (closedNotSoldAuctions[monthYear] || 0) + 1;
      }
    });

    this.lineChartData[0].data = this.lineChartLabels.map(month => activeAuctions[month] || 0);
    this.lineChartData[1].data = this.lineChartLabels.map(month => closedSoldAuctions[month] || 0);
    this.lineChartData[2].data = this.lineChartLabels.map(month => closedNotSoldAuctions[month] || 0);
    // Force update chart
    setTimeout(() => {
      this.lineChartData = [...this.lineChartData];
    }, 500);

    this.auctions = data.sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
  }

  processParticipatedAuctionsData(data: any): void {
    const participatedAuctions: { [key: string]: number } = {};

    data.forEach((auction: any) => {
      const endDate = new Date(auction.end_date);
      const monthYear = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}-${endDate.getUTCDate()}`;

      if (!this.participatedChartLabels.includes(monthYear)) {
        this.participatedChartLabels.push(monthYear);
      }

      // Sorting labels by date
      this.participatedChartLabels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      participatedAuctions[monthYear] = (participatedAuctions[monthYear] || 0) + 1;
    });

    this.participatedChartData[0].data = this.participatedChartLabels.map(month => participatedAuctions[month] || 0);

    setTimeout(() => {
      this.participatedChartData = [...this.participatedChartData];
    }, 500);
    this.participatedAuctions = data.sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
  }

  viewAuction(auctionId: string) {
    this.router.navigate(['/' + auctionId]); // or wherever you want to navigate after submission
  }

}
