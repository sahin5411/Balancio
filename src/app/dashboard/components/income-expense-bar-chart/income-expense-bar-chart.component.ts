import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { 
  ApexAxisChartSeries, 
  ApexChart, 
  ApexXAxis, 
  ApexDataLabels, 
  ApexPlotOptions, 
  ApexYAxis 
} from 'ng-apexcharts';
import { Transaction } from '../../../shared/models/transaction.model';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
};

@Component({
  selector: 'app-income-expense-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div class="w-full h-80">
      <apx-chart
        [series]="chartOptions.series"
        [chart]="chartOptions.chart"
        [xaxis]="chartOptions.xaxis"
        [yaxis]="chartOptions.yaxis"
        [dataLabels]="chartOptions.dataLabels"
        [plotOptions]="chartOptions.plotOptions"
        [colors]="chartOptions.colors">
      </apx-chart>
    </div>
  `
})
export class IncomeExpenseBarChartComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @ViewChild('chart') chart!: ChartComponent;

  public chartOptions: BarChartOptions = {
    series: [
      {
        name: 'Income',
        data: [3500, 4200, 3800, 4500, 3900, 4100]
      },
      {
        name: 'Expenses',
        data: [2100, 2800, 2300, 2900, 2500, 2700]
      }
    ],
    chart: {
      type: 'bar',
      height: 320
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return '$' + val.toLocaleString();
        }
      }
    },
    colors: ['#10B981', '#EF4444']
  };

  ngOnChanges() {
    this.processChartData();
  }

  processChartData() {
    // Mock data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = months.map(() => Math.floor(Math.random() * 2000) + 3000);
    const expenseData = months.map(() => Math.floor(Math.random() * 1500) + 2000);
    
    this.chartOptions.series = [
      { name: 'Income', data: incomeData },
      { name: 'Expenses', data: expenseData }
    ];
  }
}