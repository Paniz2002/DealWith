import {Component, OnInit} from '@angular/core';
import {Chart, ChartOptions, ChartType, registerables} from 'chart.js';
import {ChartDataset} from 'chart.js';
import axios from 'axios';
import {BaseChartDirective} from 'ng2-charts';
import {environments} from '../../../environments/environments';
import {Router} from "@angular/router";

@Component({
  selector: 'app-statistics-moderator',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './statistics-moderator.component.html',
  styleUrls: ['../statistics-student/statistics-student.component.css']
})
export class StatisticsModeratorComponent implements OnInit {
  // Auction Statistics Chart Data
  public lineChartData: ChartDataset[] = [
    {data: [], label: 'Closed and Sold Auctions', hidden: false},
    {data: [], label: 'Closed and Not Sold Auctions', hidden: false}
  ];
  public lineChartLabels: string[] = [];

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

  constructor(private router: Router) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Fetch Auctions Data
    axios.get(environments.BACKEND_URL + '/api/auctions/statistics')
      .then(response => {
        const data = response.data;
        console.log(data)
        this.processAuctionsData(data);
      })
      .catch(error => {
        console.error('There was an error fetching the auction data!', error);
      });

    // Force update charts
    setTimeout(() => {
      this.lineChartData = [...this.lineChartData];
    }, 500);
  }

  processAuctionsData(data: any): void {
    const closedSoldAuctions: { [key: string]: number } = {};
    const closedNotSoldAuctions: { [key: string]: number } = {};

    data.forEach((auction: any) => {
      const endDate = new Date(auction.end_date);
      const monthYear = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}`;

      if (!this.lineChartLabels.includes(monthYear)) {
        this.lineChartLabels.push(monthYear);
      }

      // Sorting labels by date
      this.lineChartLabels.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      if (auction.isSold) {
        closedSoldAuctions[monthYear] = (closedSoldAuctions[monthYear] || 0) + 1;
      } else if (!auction.isSold && !auction.isActive) {
        closedNotSoldAuctions[monthYear] = (closedNotSoldAuctions[monthYear] || 0) + 1;
      }
    });

    this.lineChartData[0].data = this.lineChartLabels.map(month => closedSoldAuctions[month] || 0);
    this.lineChartData[1].data = this.lineChartLabels.map(month => closedNotSoldAuctions[month] || 0);

    // Force update chart
    setTimeout(() => {
      this.lineChartData = [...this.lineChartData];
    }, 500);

    this.auctions = data.sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
  }

  viewAuction(auctionId: string) {
    this.router.navigate(['/' + auctionId]); // or wherever you want to navigate after submission
  }
}
