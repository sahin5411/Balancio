import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BudgetService } from '../../../shared/services/budget.service';
import { BudgetOverview } from '../../../shared/models/budget.model';

@Component({
  selector: 'app-budget-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class=\"bg-white rounded-lg shadow-md p-6 border-l-4\" [class]=\"getBorderColorClass()\">
      <!-- Header -->
      <div class=\"flex items-center justify-between mb-4\">
        <div class=\"flex items-center space-x-2\">
          <div class=\"p-2 rounded-lg\" [class]=\"getIconBackgroundClass()\">
            <svg class=\"w-6 h-6\" [class]=\"getIconColorClass()\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1\"></path>
            </svg>
          </div>
          <h3 class=\"text-lg font-semibold text-gray-800\">Monthly Budget</h3>
        </div>
        <a 
          routerLink=\"/budget\" 
          class=\"text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200\"
        >
          Manage
        </a>
      </div>

      <!-- Budget Not Set State -->
      <div *ngIf=\"!budgetOverview?.budgetSet\" class=\"text-center py-6\">
        <div class=\"text-gray-400 mb-3\">
          <svg class=\"w-12 h-12 mx-auto\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1\"></path>
          </svg>
        </div>
        <p class=\"text-gray-600 mb-4\">No monthly budget set</p>
        <a 
          routerLink=\"/budget\" 
          class=\"inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200\"
        >
          <svg class=\"w-4 h-4 mr-2\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
            <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 6v6m0 0v6m0-6h6m-6 0H6\"></path>
          </svg>
          Set Budget
        </a>
      </div>

      <!-- Budget Set State -->
      <div *ngIf=\"budgetOverview?.budgetSet\" class=\"space-y-4\">
        <!-- Progress Bar -->
        <div>
          <div class=\"flex justify-between items-center mb-2\">
            <span class=\"text-sm font-medium text-gray-700\">Progress</span>
            <span [class]=\"getStatusColorClass()\" class=\"text-sm font-semibold\">
            {{(budgetOverview?.percentageUsed || 0).toFixed(1)}}%
            </span>
          </div>
          <div class=\"w-full bg-gray-200 rounded-full h-3\">
            <div 
              [class]="getProgressBarColorClass()"
              class="h-3 rounded-full transition-all duration-300 ease-in-out"
              [style.width.%]="Math.min(budgetOverview?.percentageUsed || 0, 100)">
            </div>
          </div>
        </div>

        <!-- Budget Stats -->
        <div class=\"grid grid-cols-2 gap-4\">
          <div class=\"text-center\">
            <p class=\"text-lg font-bold text-gray-800\">{{formatCurrency(budgetOverview?.budget || 0)}}</p>
            <p class=\"text-xs text-gray-600\">Budget</p>
          </div>
          <div class=\"text-center\">
            <p class=\"text-lg font-bold text-red-600\">{{formatCurrency(budgetOverview?.spent || 0)}}</p>
            <p class=\"text-xs text-gray-600\">Spent</p>
          </div>
        </div>

        <!-- Remaining Amount -->
        <div class=\"text-center py-2 px-3 rounded-lg\" [class]=\"getRemainingBackgroundClass()\">
          <p class=\"text-sm font-medium\" [class]=\"getRemainingTextColorClass()\">
            {{(budgetOverview?.remaining || 0) >= 0 ? 'Remaining' : 'Over Budget'}}
          </p>
          <p class=\"text-lg font-bold\" [class]=\"getRemainingTextColorClass()\">
            {{formatCurrency(Math.abs(budgetOverview?.remaining || 0))}}
          </p>
        </div>

        <!-- Status Message -->
        <div class=\"text-center\">
          <p class=\"text-xs\" [class]=\"getStatusColorClass()\">
            {{getStatusMessage()}}
          </p>
        </div>

        <!-- Alert Indicator -->
        <div *ngIf="budgetOverview?.alertLevel !== 'safe'" class="flex items-center justify-center space-x-2 p-2 rounded-lg" [class]="getAlertBackgroundClass()">
          <div class="w-2 h-2 rounded-full animate-pulse" [class]="getAlertDotColorClass()"></div>
          <span class="text-xs font-medium" [class]="getAlertTextColorClass()">
            {{budgetOverview?.alertLevel === 'critical' ? 'Critical Alert' : 'Warning Alert'}}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf=\"isLoading\" class=\"text-center py-6\">
        <div class=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto\"></div>
        <p class=\"text-sm text-gray-600 mt-2\">Loading budget...</p>
      </div>
    </div>
  `
})
export class BudgetCardComponent implements OnInit, OnDestroy {
  budgetOverview: BudgetOverview | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  
  Math = Math; // Make Math available in template

  constructor(private budgetService: BudgetService) {}

  ngOnInit() {
    this.loadBudgetOverview();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBudgetOverview() {
    this.isLoading = true;
    
    this.budgetService.getBudgetOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          this.budgetOverview = overview;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading budget overview:', error);
          this.isLoading = false;
        }
      });
  }

  // Template helper methods
  formatCurrency(amount: number): string {
    return this.budgetService.formatCurrency(amount);
  }

  getStatusColorClass(): string {
    if (!this.budgetOverview) return 'text-gray-600';
    return this.budgetService.getBudgetStatusColor(
      this.budgetOverview.percentageUsed || 0,
      this.budgetOverview.thresholds
    );
  }

  getProgressBarColorClass(): string {
    if (!this.budgetOverview) return 'bg-gray-400';
    return this.budgetService.getBudgetProgressColor(
      this.budgetOverview.percentageUsed || 0,
      this.budgetOverview.thresholds
    );
  }

  getBorderColorClass(): string {
    if (!this.budgetOverview?.budgetSet) return 'border-gray-300';
    
    switch (this.budgetOverview.alertLevel) {
      case 'critical':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-green-500';
    }
  }

  getIconBackgroundClass(): string {
    if (!this.budgetOverview?.budgetSet) return 'bg-gray-100';
    
    switch (this.budgetOverview.alertLevel) {
      case 'critical':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      default:
        return 'bg-green-100';
    }
  }

  getIconColorClass(): string {
    if (!this.budgetOverview?.budgetSet) return 'text-gray-600';
    
    switch (this.budgetOverview.alertLevel) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  }

  getRemainingBackgroundClass(): string {
    const remaining = this.budgetOverview?.remaining || 0;
    return remaining >= 0 ? 'bg-green-50' : 'bg-red-50';
  }

  getRemainingTextColorClass(): string {
    const remaining = this.budgetOverview?.remaining || 0;
    return remaining >= 0 ? 'text-green-700' : 'text-red-700';
  }

  getAlertBackgroundClass(): string {
    switch (this.budgetOverview?.alertLevel) {
      case 'critical':
        return 'bg-red-50 border border-red-200';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  }

  getAlertDotColorClass(): string {
    switch (this.budgetOverview?.alertLevel) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  getAlertTextColorClass(): string {
    switch (this.budgetOverview?.alertLevel) {
      case 'critical':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  }

  getStatusMessage(): string {
    if (!this.budgetOverview) return '';
    
    const percentage = this.budgetOverview.percentageUsed || 0;
    const remaining = this.budgetOverview.remaining || 0;
    
    if (this.budgetOverview.alertLevel === 'critical') {
      return remaining < 0 ? 'Over budget!' : 'Critical spending level';
    } else if (this.budgetOverview.alertLevel === 'warning') {
      return 'Approaching budget limit';
    } else {
      return 'On track';
    }
  }
}