import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { BudgetService } from '../../services/budget.service';
import { NotificationService } from '../../services/notification.service';
import { MonthlyBudget, BudgetOverview } from '../../models/budget.model';

@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class=\"bg-white rounded-lg shadow-md p-6\">
      <!-- Header -->
      <div class=\"mb-6\">
        <h2 class=\"text-2xl font-bold text-gray-800 mb-2\">Monthly Budget Management</h2>
        <p class=\"text-gray-600\">Set and manage your monthly spending budget with smart alerts.</p>
      </div>

      <!-- Budget Status Overview -->
      <div *ngIf=\"budgetOverview && budgetOverview.budgetSet\" class=\"mb-8\">
        <div class=\"bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200\">
          <h3 class=\"text-lg font-semibold text-gray-800 mb-4\">Current Budget Status</h3>
          
          <!-- Progress Bar -->
          <div class=\"mb-4\">
            <div class=\"flex justify-between items-center mb-2\">
              <span class=\"text-sm font-medium text-gray-700\">Budget Progress</span>
              <span [class]=\"getStatusColorClass()\" class=\"text-sm font-semibold\">
                {{budgetOverview.percentageUsed?.toFixed(1) || 0}}% Used
              </span>
            </div>
            <div class=\"w-full bg-gray-200 rounded-full h-3\">
              <div 
                [class]=\"getProgressBarColorClass()\"
                class=\"h-3 rounded-full transition-all duration-300 ease-in-out\"
                [style.width.%]=\"Math.min(budgetOverview.percentageUsed || 0, 100)\">
              </div>
            </div>
          </div>

          <!-- Budget Stats -->
          <div class=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div class=\"text-center\">
              <p class=\"text-2xl font-bold text-gray-800\">{{formatCurrency(budgetOverview.budget || 0)}}</p>
              <p class=\"text-sm text-gray-600\">Monthly Budget</p>
            </div>
            <div class=\"text-center\">
              <p class=\"text-2xl font-bold text-red-600\">{{formatCurrency(budgetOverview.spent || 0)}}</p>
              <p class=\"text-sm text-gray-600\">Spent This Month</p>
            </div>
            <div class=\"text-center\">
              <p class=\"text-2xl font-bold\" [class]=\"(budgetOverview.remaining || 0) >= 0 ? 'text-green-600' : 'text-red-600'\">
                {{formatCurrency(budgetOverview.remaining || 0)}}
              </p>
              <p class=\"text-sm text-gray-600\">Remaining</p>
            </div>
          </div>

          <!-- Status Message -->
          <div class=\"mt-4 p-3 rounded-lg\" [class]=\"getStatusMessageClass()\">
            <p class=\"text-sm font-medium\">{{getStatusMessage()}}</p>
          </div>
        </div>
      </div>

      <!-- Budget Form -->
      <form [formGroup]=\"budgetForm\" (ngSubmit)=\"onSubmit()\" class=\"space-y-6\">
        <!-- Monthly Budget Amount -->
        <div>
          <label for=\"amount\" class=\"block text-sm font-medium text-gray-700 mb-2\">
            Monthly Budget Amount *
          </label>
          <div class=\"relative\">
            <div class=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
              <span class=\"text-gray-500 text-lg\">$</span>
            </div>
            <input
              type=\"number\"
              id=\"amount\"
              formControlName=\"amount\"
              class=\"block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg\"
              placeholder=\"0.00\"
              min=\"0\"
              step=\"0.01\"
            />
          </div>
          <div *ngIf=\"budgetForm.get('amount')?.touched && budgetForm.get('amount')?.errors\" class=\"mt-1\">
            <p *ngIf=\"budgetForm.get('amount')?.errors?.['required']\" class=\"text-sm text-red-600\">
              Budget amount is required
            </p>
            <p *ngIf=\"budgetForm.get('amount')?.errors?.['min']\" class=\"text-sm text-red-600\">
              Budget amount must be greater than 0
            </p>
          </div>
        </div>

        <!-- Currency Selection -->
        <div>
          <label for=\"currency\" class=\"block text-sm font-medium text-gray-700 mb-2\">
            Currency
          </label>
          <select
            id=\"currency\"
            formControlName=\"currency\"
            class=\"block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
          >
            <option value=\"USD\">USD - US Dollar</option>
            <option value=\"EUR\">EUR - Euro</option>
            <option value=\"GBP\">GBP - British Pound</option>
            <option value=\"CAD\">CAD - Canadian Dollar</option>
            <option value=\"AUD\">AUD - Australian Dollar</option>
          </select>
        </div>

        <!-- Alert Thresholds -->
        <div class=\"border border-gray-200 rounded-lg p-4\">
          <h3 class=\"text-lg font-semibold text-gray-800 mb-4\">Alert Thresholds</h3>
          <p class=\"text-sm text-gray-600 mb-4\">
            Set when you want to receive email alerts as you approach your budget limit.
          </p>
          
          <div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
            <!-- Warning Threshold -->
            <div>
              <label for=\"warningThreshold\" class=\"block text-sm font-medium text-gray-700 mb-2\">
                Warning Alert (%)
              </label>
              <input
                type=\"number\"
                id=\"warningThreshold\"
                formControlName=\"warningThreshold\"
                class=\"block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500\"
                placeholder=\"80\"
                min=\"0\"
                max=\"100\"
              />
              <p class=\"text-xs text-gray-500 mt-1\">Recommended: 80%</p>
            </div>

            <!-- Critical Threshold -->
            <div>
              <label for=\"criticalThreshold\" class=\"block text-sm font-medium text-gray-700 mb-2\">
                Critical Alert (%)
              </label>
              <input
                type=\"number\"
                id=\"criticalThreshold\"
                formControlName=\"criticalThreshold\"
                class=\"block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500\"
                placeholder=\"95\"
                min=\"0\"
                max=\"100\"
              />
              <p class=\"text-xs text-gray-500 mt-1\">Recommended: 95%</p>
            </div>
          </div>

          <div *ngIf=\"thresholdError\" class=\"mt-2\">
            <p class=\"text-sm text-red-600\">{{thresholdError}}</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class=\"flex flex-col sm:flex-row gap-3 pt-4\">
          <button
            type=\"submit\"
            [disabled]=\"budgetForm.invalid || isLoading\"
            class=\"flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center\"
          >
            <svg *ngIf=\"isLoading\" class=\"animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">
              <circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle>
              <path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
            </svg>
            {{currentBudget ? 'Update Budget' : 'Set Budget'}}
          </button>
          
          <button
            *ngIf=\"currentBudget\"
            type=\"button\"
            (click)=\"clearBudget()\"
            class=\"flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200\"
          >
            Clear Budget
          </button>
        </div>
      </form>

      <!-- Tips Section -->
      <div class=\"mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200\">
        <h3 class=\"text-lg font-semibold text-blue-800 mb-3\">💡 Budget Tips</h3>
        <ul class=\"space-y-2 text-sm text-blue-700\">
          <li class=\"flex items-start\">
            <span class=\"inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0\"></span>
            Set a realistic budget based on your monthly income and essential expenses
          </li>
          <li class=\"flex items-start\">
            <span class=\"inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0\"></span>
            Enable email alerts to stay informed about your spending progress
          </li>
          <li class=\"flex items-start\">
            <span class=\"inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0\"></span>
            Review and adjust your budget monthly based on your spending patterns
          </li>
          <li class=\"flex items-start\">
            <span class=\"inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0\"></span>
            Use the warning alert (80%) to make spending adjustments before reaching the limit
          </li>
        </ul>
      </div>
    </div>
  `
})
export class BudgetManagementComponent implements OnInit, OnDestroy {
  budgetForm: FormGroup;
  currentBudget: MonthlyBudget | null = null;
  budgetOverview: BudgetOverview | null = null;
  isLoading = false;
  thresholdError = '';
  
  private destroy$ = new Subject<void>();
  
  Math = Math; // Make Math available in template

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private notificationService: NotificationService
  ) {
    this.budgetForm = this.createForm();
  }

  ngOnInit() {
    this.loadBudgetData();
    this.setupFormValidation();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['USD'],
      warningThreshold: [80, [Validators.min(0), Validators.max(100)]],
      criticalThreshold: [95, [Validators.min(0), Validators.max(100)]]
    });
  }

  private setupFormValidation() {
    // Watch for threshold changes to validate
    this.budgetForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateThresholds();
      });
  }

  private validateThresholds() {
    const warning = this.budgetForm.get('warningThreshold')?.value;
    const critical = this.budgetForm.get('criticalThreshold')?.value;
    
    this.thresholdError = '';
    
    if (warning && critical && warning >= critical) {
      this.thresholdError = 'Warning threshold must be less than critical threshold';
    }
  }

  private loadBudgetData() {
    this.isLoading = true;
    
    forkJoin({
      budget: this.budgetService.getBudget(),
      overview: this.budgetService.getBudgetOverview()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ budget, overview }) => {
        this.currentBudget = budget;
        this.budgetOverview = overview;
        
        if (budget) {
          this.budgetForm.patchValue({
            amount: budget.amount,
            currency: budget.currency,
            warningThreshold: budget.alertThresholds.warning,
            criticalThreshold: budget.alertThresholds.critical
          });
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading budget data:', error);
        this.notificationService.addNotification({
          title: 'Error',
          message: 'Failed to load budget data',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.budgetForm.invalid || this.thresholdError) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValue = this.budgetForm.value;
    
    const budgetData = {
      amount: formValue.amount,
      currency: formValue.currency,
      alertThresholds: {
        warning: formValue.warningThreshold,
        critical: formValue.criticalThreshold
      }
    };

    this.budgetService.updateBudget(budgetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedBudget) => {
          this.currentBudget = updatedBudget;
          this.notificationService.addNotification({
            title: 'Success',
            message: this.currentBudget ? 'Budget updated successfully!' : 'Budget set successfully!',
            type: 'success'
          });
          this.loadBudgetData(); // Reload to get updated overview
        },
        error: (error) => {
          console.error('Error updating budget:', error);
          this.notificationService.addNotification({
            title: 'Error',
            message: 'Failed to update budget',
            type: 'error'
          });
          this.isLoading = false;
        }
      });
  }

  clearBudget() {
    if (confirm('Are you sure you want to clear your budget? This will remove all budget tracking.')) {
      this.isLoading = true;
      
      const clearData = {
        amount: 0,
        currency: 'USD',
        alertThresholds: {
          warning: 80,
          critical: 95
        }
      };

      this.budgetService.updateBudget(clearData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.currentBudget = null;
            this.budgetOverview = null;
            this.budgetForm.reset({
              amount: 0,
              currency: 'USD',
              warningThreshold: 80,
              criticalThreshold: 95
            });
            this.notificationService.addNotification({
              title: 'Success',
              message: 'Budget cleared successfully!',
              type: 'success'
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error clearing budget:', error);
            this.notificationService.addNotification({
              title: 'Error',
              message: 'Failed to clear budget',
              type: 'error'
            });
            this.isLoading = false;
          }
        });
    }
  }

  // Template helper methods
  formatCurrency(amount: number): string {
    return this.budgetService.formatCurrency(amount, this.currentBudget?.currency || 'USD');
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

  getStatusMessage(): string {
    if (!this.budgetOverview) return 'No budget data available';
    return this.budgetService.getBudgetStatusMessage(this.budgetOverview);
  }

  getStatusMessageClass(): string {
    if (!this.budgetOverview) return 'bg-gray-100 text-gray-700';
    
    switch (this.budgetOverview.alertLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  }
}