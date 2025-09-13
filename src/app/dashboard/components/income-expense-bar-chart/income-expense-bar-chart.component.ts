import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../shared/models/transaction.model';

declare var ApexCharts: any;

@Component({
  selector: 'app-income-expense-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-80" #chartContainer></div>
  `
})
export class IncomeExpenseBarChartComponent implements OnChanges, AfterViewInit {
  @Input() transactions: Transaction[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: ApexCharts;

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  private async initChart() {
    const ApexCharts = (await import('apexcharts')).default;
    
    const options = {
      series: [
        { name: 'Income', data: [3500, 4200, 3800, 4500, 3900, 4100] },
        { name: 'Expenses', data: [2100, 2800, 2300, 2900, 2500, 2700] }
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

    this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
    await this.chart.render();
  }

  private updateChart() {
    if (!this.chart) return;
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const incomeData = months.map(() => Math.floor(Math.random() * 2000) + 3000);
    const expenseData = months.map(() => Math.floor(Math.random() * 1500) + 2000);
    
    this.chart.updateSeries([
      { name: 'Income', data: incomeData },
      { name: 'Expenses', data: expenseData }
    ]);
  }
}