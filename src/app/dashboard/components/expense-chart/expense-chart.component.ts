import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { 
  ApexNonAxisChartSeries, 
  ApexChart, 
  ApexLegend, 
  ApexDataLabels 
} from 'ng-apexcharts';
import { Transaction } from '../../../shared/models/transaction.model';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions?: any;
};

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './expense-chart.component.html'
})
export class ExpenseChartComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @ViewChild('chart') chart!: ChartComponent;

  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'];

  public chartOptions: ChartOptions = {
    series: [],
    chart: {
      type: 'donut',
      height: 320
    },
    labels: [],
    colors: this.colors,
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return val.toFixed(1) + '%';
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
                show: true,
                showAlways: false,
                label: 'Financial Summary',
              
              }          }
        }
      }
    }
  };

  ngOnChanges() {
    this.processExpenseData();
  }

  processExpenseData() {
    if (!this.transactions || this.transactions.length === 0) {
      this.totalIncome = 0;
      this.totalExpenses = 0;
      this.balance = 0;
      this.chartOptions = {
        ...this.chartOptions,
        series: [],
        labels: []
      };
      return;
    }

    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpenses;

    const categoryTotals = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, expense) => {
        const categoryName = this.getCategoryName(expense.categoryId);
        acc.set(categoryName, (acc.get(categoryName) || 0) + expense.amount);
        return acc;
      }, new Map<string, number>());

    this.chartOptions = {
      ...this.chartOptions,
      series: Array.from(categoryTotals.values()),
      labels: Array.from(categoryTotals.keys())
    };
  }

  private getCategoryName(categoryId: string): string {
    const categoryMap: { [key: string]: string } = {
      '1': 'Food & Dining',
      '2': 'Transportation',
      '3': 'Shopping',
      '4': 'Entertainment',
      '5': 'Bills & Utilities',
      '6': 'Healthcare'
    };
    return categoryMap[categoryId] || `Category ${categoryId}`;
  }
}
