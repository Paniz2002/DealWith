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
  public lineChartData: ChartDataset[] = [
    {data: [], label: 'Active Auctions', hidden: false},
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
    axios.get(environments.BACKEND_URL + '/api/auctions/me')
      .then(response => {
        const data = response.data;

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

        this.auctions = data.sort((a: any, b: any) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());
        console.log(this.auctions);
        // Sort auctions by ending date descending
      })
      .catch(error => {
        console.error('There was an error fetching the auction data!', error);
      });

    // Force update chart
    setTimeout(() => {
      this.lineChartData = [...this.lineChartData];
    }, 500);
  }

  viewAuction(auctionId: string) {
    this.router.navigate(['/' + auctionId]); // or wherever you want to navigate after submission
  }
}
