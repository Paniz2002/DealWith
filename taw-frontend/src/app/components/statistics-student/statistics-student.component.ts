import {Component} from '@angular/core';
import {Chart, ChartOptions, ChartType, registerables} from 'chart.js';
import {ChartDataset} from 'chart.js';


import axios from "axios";
import {BaseChartDirective} from "ng2-charts";
import {environments} from "../../../environments/environments";

@Component({
  selector: 'app-statistics-student',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './statistics-student.component.html',
  styleUrl: './statistics-student.component.css'
})
export class StatisticsStudentComponent {
  public lineChartData: ChartDataset[] = [
    {data: [], label: 'Active Auctions',hidden: false},
    {data: [], label: 'Closed and Sold Auctions',hidden: false},
    {data: [], label: 'Closed and Not Sold Auctions',hidden: false}
  ];
  public lineChartLabels: string[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,  // Ensures legend is displayed
      }
    }
  };
  public lineChartType: ChartType = ('line');
  public lineChartLegend = true;
  public lineChartPlugins = [];

  constructor() {// Register the controllers
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    const promise= axios.get( environments.BACKEND_URL + '/api/auctions/me')
      .then(response => {
        const data = response.data;

        const activeAuctions: { [key: string]: number } = {};
        const closedSoldAuctions: { [key: string]: number } = {};
        const closedNotSoldAuctions: { [key: string]: number } = {};

        for (let auction of data)  {
          const endDate = new Date(auction.end_date);
          const monthYear = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}-${endDate.getUTCDate()}`;

          if (!this.lineChartLabels.includes(monthYear)) {
            this.lineChartLabels.push(monthYear);
          }
          //sort by monthYear
          this.lineChartLabels.sort((a, b) => {
            const aDate = new Date(a);
            const bDate = new Date(b);
            return aDate.getTime() - bDate.getTime();
          });


          if (auction.isActive) {
            activeAuctions[monthYear] = (activeAuctions[monthYear] || 0) + 1;
          } else if (auction.isSold) {
            closedSoldAuctions[monthYear] = (closedSoldAuctions[monthYear] || 0) + 1;
          } else {
            closedNotSoldAuctions[monthYear] = (closedNotSoldAuctions[monthYear] || 0) + 1;
          }
        }

        this.lineChartData[0].data = this.lineChartLabels.map(month => activeAuctions[month] || 0);
        this.lineChartData[1].data = this.lineChartLabels.map(month => closedSoldAuctions[month] || 0);
        this.lineChartData[2].data = this.lineChartLabels.map(month => closedNotSoldAuctions[month] || 0);




      })
      .catch(error => {
        console.error('There was an error fetching the auction data!', error);
      });

    //force update chart
    promise.then(() => {
      this.lineChartData = [...this.lineChartData];
    });

  }
}
