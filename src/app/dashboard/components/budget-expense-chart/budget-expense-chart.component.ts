import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService } from '../../../shared/services/budget.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { Transaction } from '../../../shared/models/transaction.model';
import { BudgetOverview } from '../../../shared/models/budget.model';

@Component({
  selector: 'app-budget-expense-chart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="budgetOverview && budgetOverview.budgetSet" class="h-full">
      <!-- Budget Progress Overview -->
      <div class="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-gray-700">Current Month Progress</span>
          <span [class]="getBudgetStatusColorClass()" class="text-sm font-semibold">
            {{(budgetOverview.percentageUsed || 0).toFixed(1)}}% Used
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            [class]="getBudgetProgressColorClass()"
            class="h-3 rounded-full transition-all duration-300 ease-in-out"
            [style.width.%]="Math.min(budgetOverview.percentageUsed || 0, 100)">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-lg font-bold text-gray-800">{{formatCurrency(budgetOverview.budget || 0)}}</p>
            <p class="text-xs text-gray-600">Budget</p>
          </div>
          <div>
            <p class="text-lg font-bold text-red-600">{{formatCurrency(budgetOverview.spent || 0)}}</p>
            <p class="text-xs text-gray-600">Spent</p>
          </div>
          <div>
            <p class="text-lg font-bold" [class]="(budgetOverview.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{formatCurrency(Math.abs(budgetOverview.remaining || 0))}}
            </p>
            <p class="text-xs text-gray-600">{{(budgetOverview.remaining || 0) >= 0 ? 'Left' : 'Over'}}</p>
          </div>
        </div>
      </div>

      <!-- 6-Month Trend Chart -->
      <div class="h-48">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Budget vs Expenses (6 Months)</h4>
        <div class="h-40 flex items-end justify-between space-x-2" *ngIf="chartData.length > 0">
          <div *ngFor="let data of chartData" class="flex-1 flex flex-col items-center space-y-1">
            <!-- Bars Container -->
            <div class="flex items-end space-x-1 h-32">
              <!-- Budget Bar -->
              <div class="w-4 bg-blue-500 rounded-t-sm relative"
                   [style.height.%]="getBarHeight(data.budget)"
                   [title]="'Budget: ' + formatCurrency(data.budget)">
              </div>
              <!-- Expense Bar -->
              <div class="w-4 bg-red-500 rounded-t-sm relative"
                   [style.height.%]="getBarHeight(data.expenses)"
                   [title]="'Expenses: ' + formatCurrency(data.expenses)">
              </div>
            </div>
            <!-- Month Label -->
            <span class="text-xs text-gray-600">{{ data.month }}</span>
          </div>
        </div>

        <!-- Chart Legend -->
        <div class="flex justify-center space-x-4 mt-3">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span class="text-xs text-gray-700">Budget</span>
          </div>
          <div class="flex items-center">
            <div class="w-3 h-3 bg-red-500 rounded mr-1"></div>
            <span class="text-xs text-gray-700">Expenses</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Budget Set State -->
    <div *ngIf="!budgetOverview || !budgetOverview.budgetSet" class="h-full flex flex-col items-center justify-center text-center p-6">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="material-icons text-blue-600 text-2xl">account_balance_wallet</span>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Budget Set</h3>
      <p class="text-sm text-gray-600 mb-4">Set up your monthly budget to see budget vs expense tracking here.</p>
      <a routerLink="/profile/edit" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <span class="material-icons mr-2 text-base">add</span>
        Set Budget
      </a>
    </div>
  `
})
export class BudgetExpenseChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() transactions: Transaction[] = [];
  
  budgetOverview: BudgetOverview | null = null;
  chartData: any[] = [];
  currencySymbol: string = '$';
  
  private destroy$ = new Subject<void>();
  
  Math = Math; // Make Math available in template

  constructor(
    private budgetService: BudgetService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.loadBudgetData();
  }

  ngOnChanges() {
    if (this.budgetOverview && this.transactions.length > 0) {
      this.prepareChartData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBudgetData() {
    console.log('BudgetExpenseChart: Loading budget data...');
    this.budgetService.getBudgetOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          console.log('BudgetExpenseChart: Budget overview loaded:', overview);
          this.budgetOverview = overview;
          if (overview && this.transactions.length > 0) {
            this.prepareChartData();
          }
        },
        error: (error) => {
          console.error('BudgetExpenseChart: Error loading budget overview:', error);
        }
      });
  }

  prepareChartData() {
    if (!this.budgetOverview || !this.transactions.length) return;
    
    const months = this.getLastSixMonths();
    this.chartData = months.map(month => {
      const monthTransactions = this.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month.index && 
               transactionDate.getFullYear() === month.year;
      });
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month: month.name,
        budget: this.budgetOverview?.budget || 0,
        expenses: expenses
      };
    });
  }

  getLastSixMonths() {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        index: date.getMonth(),
        year: date.getFullYear()
      });
    }
    
    return months;
  }

  getBarHeight(value: number): number {
    if (!this.chartData.length) return 0;
    const maxValue = Math.max(
      ...this.chartData.map(d => Math.max(d.budget, d.expenses))
    );
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  formatCurrency(amount: number): string {
    return this.budgetService.formatCurrency(amount);
  }

  getBudgetStatusColorClass(): string {
    if (!this.budgetOverview) return 'text-gray-600';
    return this.budgetService.getBudgetStatusColor(
      this.budgetOverview.percentageUsed || 0,
      this.budgetOverview.thresholds
    );
  }

  getBudgetProgressColorClass(): string {
    if (!this.budgetOverview) return 'bg-gray-400';
    return this.budgetService.getBudgetProgressColor(
      this.budgetOverview.percentageUsed || 0,
      this.budgetOverview.thresholds
    );
  }
}