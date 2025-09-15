import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { MonthlyBudget, BudgetOverview, BudgetAlertSummary } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private apiService: ApiService) {}

  /**
   * Get user's current monthly budget
   */
  getBudget(): Observable<MonthlyBudget | null> {
    return this.apiService.get<{ monthlyBudget: MonthlyBudget }>('users/budget').pipe(
      map(response => {
        if (!response.monthlyBudget || response.monthlyBudget.amount === 0) {
          return null;
        }
        return {
          ...response.monthlyBudget,
          lastAlertSent: {
            warning: response.monthlyBudget.lastAlertSent?.warning ? 
              new Date(response.monthlyBudget.lastAlertSent.warning) : undefined,
            critical: response.monthlyBudget.lastAlertSent?.critical ? 
              new Date(response.monthlyBudget.lastAlertSent.critical) : undefined
          }
        };
      })
    );
  }

  /**
   * Update user's monthly budget
   */
  updateBudget(budgetData: {
    amount: number;
    currency?: string;
    alertThresholds?: {
      warning: number;
      critical: number;
    };
  }): Observable<MonthlyBudget> {
    return this.apiService.put<{ monthlyBudget: MonthlyBudget }>('users/budget', budgetData).pipe(
      map(response => ({
        ...response.monthlyBudget,
        lastAlertSent: {
          warning: response.monthlyBudget.lastAlertSent?.warning ? 
            new Date(response.monthlyBudget.lastAlertSent.warning) : undefined,
          critical: response.monthlyBudget.lastAlertSent?.critical ? 
            new Date(response.monthlyBudget.lastAlertSent.critical) : undefined
        }
      }))
    );
  }

  /**
   * Get comprehensive budget overview with spending analysis
   */
  getBudgetOverview(): Observable<BudgetOverview> {
    return this.apiService.get<BudgetOverview>('users/budget/overview').pipe(
      map(overview => {
        if (overview.monthlyData) {
          overview.monthlyData.period.startDate = new Date(overview.monthlyData.period.startDate);
          overview.monthlyData.period.endDate = new Date(overview.monthlyData.period.endDate);
        }
        return overview;
      })
    );
  }

  /**
   * Get budget alert summary
   */
  getBudgetAlertSummary(): Observable<BudgetAlertSummary> {
    return this.apiService.get<BudgetAlertSummary>('users/budget/alerts').pipe(
      map(summary => ({
        ...summary,
        lastAlerts: {
          warning: summary.lastAlerts?.warning ? new Date(summary.lastAlerts.warning) : undefined,
          critical: summary.lastAlerts?.critical ? new Date(summary.lastAlerts.critical) : undefined
        }
      }))
    );
  }

  /**
   * Helper method to calculate budget progress percentage
   */
  calculateBudgetProgress(spent: number, budget: number): number {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  }

  /**
   * Helper method to determine budget status color
   */
  getBudgetStatusColor(percentage: number, thresholds?: { warning: number; critical: number }): string {
    const warningThreshold = thresholds?.warning || 80;
    const criticalThreshold = thresholds?.critical || 95;
    
    if (percentage >= criticalThreshold) {
      return 'text-red-600';
    } else if (percentage >= warningThreshold) {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  }

  /**
   * Helper method to get budget progress bar color
   */
  getBudgetProgressColor(percentage: number, thresholds?: { warning: number; critical: number }): string {
    const warningThreshold = thresholds?.warning || 80;
    const criticalThreshold = thresholds?.critical || 95;
    
    if (percentage >= criticalThreshold) {
      return 'bg-red-500';
    } else if (percentage >= warningThreshold) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  /**
   * Helper method to format currency
   */
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Helper method to get budget status message
   */
  getBudgetStatusMessage(overview: BudgetOverview): string {
    if (!overview.budgetSet) {
      return 'No monthly budget set. Set a budget to track your spending.';
    }
    
    const percentage = overview.percentageUsed || 0;
    const remaining = overview.remaining || 0;
    
    if (overview.alertLevel === 'critical') {
      return `⚠️ You've exceeded your critical spending threshold! ${remaining < 0 ? 'Over budget by ' + this.formatCurrency(Math.abs(remaining)) : 'Only ' + this.formatCurrency(remaining) + ' remaining.'}`;
    } else if (overview.alertLevel === 'warning') {
      return `⚠️ You're approaching your budget limit. ${this.formatCurrency(remaining)} remaining.`;
    } else {
      return `✅ You're on track! ${this.formatCurrency(remaining)} remaining in your budget.`;
    }
  }
}