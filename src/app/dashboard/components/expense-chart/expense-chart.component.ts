import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../shared/models/transaction.model';

declare var ApexCharts: any;

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-chart.component.html'
})
export class ExpenseChartComponent implements OnChanges, AfterViewInit {
  @Input() transactions: Transaction[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: ApexCharts;

  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6366F1'];

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges() {
    this.processExpenseData();
    if (this.chart) {
      this.updateChart();
    }
  }

  private async initChart() {
    const ApexCharts = (await import('apexcharts')).default;
    
    const options = {
      series: [],
      chart: {
        type: 'donut',
        height: 280
      },
      labels: [],
      colors: this.colors,
      legend: {
        position: 'right',
        offsetY: 0,
        height: 230,
        fontSize: '12px'
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
                label: 'Financial Summary'
              }
            }
          }
        }
      }
    };

    this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
    this.chart.render();
  }

  processExpenseData() {
    if (!this.transactions || this.transactions.length === 0) {
      this.totalIncome = 0;
      this.totalExpenses = 0;
      this.balance = 0;
      return;
    }

    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    this.balance = this.totalIncome - this.totalExpenses;
  }

  private updateChart() {
    if (!this.transactions || this.transactions.length === 0) {
      this.chart.updateSeries([]);
      return;
    }

    const categoryTotals = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, expense) => {
        const categoryName = this.getCategoryName(expense.categoryId);
        acc.set(categoryName, (acc.get(categoryName) || 0) + expense.amount);
        return acc;
      }, new Map<string, number>());

    this.chart.updateOptions({
      series: Array.from(categoryTotals.values()),
      labels: Array.from(categoryTotals.keys())
    });
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
