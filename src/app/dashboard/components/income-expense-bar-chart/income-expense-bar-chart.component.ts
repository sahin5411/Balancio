import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../../shared/services/currency.service';
import { Transaction } from '../../../shared/models/transaction.model';

declare var ApexCharts: any;

@Component({
  selector: 'app-income-expense-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] relative overflow-hidden" #chartContainer></div>
  `
})
export class IncomeExpenseBarChartComponent implements OnChanges, AfterViewInit {
  @Input() transactions: Transaction[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chart!: ApexCharts;
  currencySymbol: string = '₹';

  constructor(private currencyService: CurrencyService) {}

  ngAfterViewInit() {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.initChart();
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }

  private async initChart() {
    const ApexCharts = (await import('apexcharts')).default;
    
    // Get container dimensions for responsive sizing
    const containerHeight = 300;
    
    const options = {
      series: [
        { name: 'Income', data: [0, 0, 0, 0, 0, 0] },
        { name: 'Expenses', data: [0, 0, 0, 0, 0, 0] }
      ],
      chart: {
        type: 'bar',
        height: containerHeight,
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 0
      },
      xaxis: {
        categories: this.getLastSixMonths(),
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (val: number) => {
            return this.currencySymbol + val.toLocaleString();
          },
          style: {
            fontSize: '11px'
          }
        }
      },
      colors: ['#10B981', '#EF4444'],
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '12px',
        markers: {
          width: 8,
          height: 8
        }
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 3
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 200
            },
            legend: {
              position: 'bottom',
              fontSize: '10px'
            },
            xaxis: {
              labels: {
                style: {
                  fontSize: '10px'
                }
              }
            },
            yaxis: {
              labels: {
                style: {
                  fontSize: '9px'
                }
              }
            }
          }
        },
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250
            }
          }
        }
      ]
    };

    this.chart = new ApexCharts(this.chartContainer.nativeElement, options);
    await this.chart.render();
    this.updateChart();
  }

  private updateChart() {
    if (!this.chart) return;
    
    const months = this.getLastSixMonths();
    const monthlyData = this.getMonthlyData();
    
    this.chart.updateSeries([
      { name: 'Income', data: monthlyData.income },
      { name: 'Expenses', data: monthlyData.expenses }
    ]);
  }

  private getLastSixMonths(): string[] {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short' }));
    }
    return months;
  }

  private getMonthlyData(): { income: number[], expenses: number[] } {
    const months = this.getLastSixMonths();
    const income = new Array(6).fill(0);
    const expenses = new Array(6).fill(0);
    
    if (!this.transactions || this.transactions.length === 0) {
      return { income, expenses };
    }

    this.transactions.forEach(transaction => {
      const transactionMonth = transaction.date.toLocaleDateString('en-US', { month: 'short' });
      const monthIndex = months.indexOf(transactionMonth);
      
      if (monthIndex !== -1) {
        if (transaction.type === 'income') {
          income[monthIndex] += transaction.amount;
        } else {
          expenses[monthIndex] += transaction.amount;
        }
      }
    });
    
    return { income, expenses };
  }
}