import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../shared/services/user.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { BudgetService } from '../../shared/services/budget.service';
import { TransactionService } from '../../shared/services/transaction.service';
import { CategoryService } from '../../shared/services/category.service';
import { ApiService } from '../../shared/services/api.service';
import { API_CONFIG } from '../../shared/utils/constants';
import { User } from '../../shared/models/user.model';
import { MonthlyBudget, BudgetOverview } from '../../shared/models/budget.model';
import { Transaction } from '../../shared/models/transaction.model';
import { Category } from '../../shared/models/category.model';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { PwaInstallComponent } from '../../shared/components/pwa-install/pwa-install.component';

interface UserProfile {
  fullName: string;
  email: string;
  initials: string;
  memberType: string;
  memberSince: Date;
  accountStatus: 'Active' | 'Inactive';
  daysActive: number;
  transactions: number;
  categoriesUsed: number;
  totalSaved: number;
  isPremium: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlyReports: boolean;
}
@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,LoaderComponent, PwaInstallComponent],
  templateUrl:'./profile-view.component.html'
})
export class ProfileViewComponent implements OnInit, OnDestroy {
  isLoading:boolean = false;
  
  // Budget related properties
  currentBudget: MonthlyBudget | null = null;
  budgetOverview: BudgetOverview | null = null;
  transactions: Transaction[] = [];
  categories: Category[] = [];
  budgetChartData: any[] = [];
  
  private destroy$ = new Subject<void>();
  userProfile: UserProfile = {
    fullName: '',
    email: '',
    initials: '',
    memberType: 'Free Member',
    memberSince: new Date(),
    accountStatus: 'Active',
    daysActive: 0,
    transactions: 0,
    categoriesUsed: 0,
    totalSaved: 0,
    isPremium: false
  };

  // Notification settings
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    budgetAlerts: true,
    monthlyReports: false
  };
  
  reportFormat: string = 'excel';
  currencySymbol: string = '₹';

  // Edit mode states
  editingPersonalInfo: boolean = false;
  showChangePasswordModal: boolean = false;
  showTwoFactorModal: boolean = false;

  // Form data for editing
  editForm = {
    fullName: '',
    email: ''
  };

  // Password change form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Security settings
  passwordLastChanged: Date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 2 months ago
  twoFactorEnabled: boolean = false;
  showLogoutModal: boolean = false;
  
  Math = Math; // Make Math available in template

  constructor(
    private authService: AuthService, 
    private router: Router,
    private userService: UserService,
    private http: HttpClient,
    private currencyService: CurrencyService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.isLoading = true;
    this.loadUserProfile();
    this.loadBudgetData();
    this.loadTransactions();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userProfile = {
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          initials: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase(),
          memberType: 'Free Member',
          memberSince: user.createdAt,
          accountStatus: 'Active',
          daysActive: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          transactions: 0,
          categoriesUsed: 0,
          totalSaved: 0,
          isPremium: false
        };
        
        this.loadUserStatistics();
        
        if (user.settings) {
          this.notificationSettings = {
            emailNotifications: user.settings.emailNotifications,
            budgetAlerts: user.settings.budgetAlerts,
            monthlyReports: user.settings.monthlyReports
          };
          this.reportFormat = user.settings.reportFormat || 'excel';
          this.twoFactorEnabled = user.settings.twoFactorEnabled;
        }
        this.isLoading = false;
        this.initializeEditForm();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.initializeEditForm();
        this.isLoading = false;
      }
    });
  }

  // Initialize edit form with current values
  initializeEditForm(): void {
    this.editForm = {
      fullName: this.userProfile.fullName,
      email: this.userProfile.email
    };
  }

  // Personal Information Section
  startEditingPersonalInfo(): void {
    this.editingPersonalInfo = true;
    this.initializeEditForm();
  }

  cancelEditingPersonalInfo(): void {
    this.editingPersonalInfo = false;
    this.initializeEditForm();
  }

  savePersonalInfo(): void {
    if (this.editForm.fullName.trim() && this.editForm.email.trim()) {
      const names = this.editForm.fullName.split(' ');
      const updateData = {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: this.editForm.email
      };
      
      this.userService.updateUser(updateData).subscribe({
        next: (user) => {
          this.userProfile.fullName = this.editForm.fullName;
          this.userProfile.email = this.editForm.email;
          this.userProfile.initials = names.map(name => name.charAt(0)).join('').toUpperCase();
          this.editingPersonalInfo = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile');
        }
      });
    }
  }

  // Security Settings
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    const token = this.authService.getToken();
    this.apiService.putWithAuth(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.passwordLastChanged = new Date();
        this.showChangePasswordModal = false;
        alert('Password changed successfully. Please log in again with your new password.');
        
        // Force logout to ensure new password is required
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Password change error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        
        if (error.status === 400) {
          alert('Current password is incorrect');
        } else if (error.status === 404) {
          alert('Password change endpoint not found. Please contact support.');
        } else {
          alert(`Failed to change password: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      }
    });
  }

  // Two-Factor Authentication
  openTwoFactorModal(): void {
    this.showTwoFactorModal = true;
  }

  closeTwoFactorModal(): void {
    this.showTwoFactorModal = false;
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    
    const updateData = {
      settings: {
        ...this.notificationSettings,
        twoFactorEnabled: this.twoFactorEnabled
      }
    };
    
    this.userService.updateUser(updateData).subscribe({
      next: () => {
        this.showTwoFactorModal = false;
        const status = this.twoFactorEnabled ? 'enabled' : 'disabled';
        alert(`Two-factor authentication ${status}`);
      },
      error: (error) => {
        console.error('Error updating 2FA:', error);
        this.twoFactorEnabled = !this.twoFactorEnabled;
        alert('Failed to update two-factor authentication');
      }
    });
  }

  // Notification Settings
  updateNotificationSetting(setting: keyof NotificationSettings): void {
    this.notificationSettings[setting] = !this.notificationSettings[setting];
    
    const updateData = {
      settings: {
        ...this.notificationSettings,
        twoFactorEnabled: this.twoFactorEnabled
      }
    };
    
    this.userService.updateUser(updateData).subscribe({
      next: () => {
        console.log('Notification settings updated');
      },
      error: (error) => {
        console.error('Error updating settings:', error);
        this.notificationSettings[setting] = !this.notificationSettings[setting];
      }
    });
  }

  configureEmailNotifications(): void {
    console.log('Configure email notifications');
    // Open configuration modal or navigate to detailed settings
  }

  configureBudgetAlerts(): void {
    console.log('Configure budget alerts');
    // Open configuration modal or navigate to detailed settings
  }

  configureMonthlyReports(): void {
    console.log('Configure monthly reports');
    // Open configuration modal or navigate to detailed settings
  }
  
  updateReportFormat(): void {
    console.log('Report format updated:', this.reportFormat);
    const updateData = {
      settings: {
        ...this.notificationSettings,
        reportFormat: this.reportFormat,
        twoFactorEnabled: this.twoFactorEnabled
      }
    };
    
    this.userService.updateUser(updateData).subscribe({
      next: () => {
        console.log('Report format updated successfully');
      },
      error: (error) => {
        console.error('Error updating report format:', error);
      }
    });
  }

  // Quick Actions
  exportData(): void {
    console.log('Exporting user data...');
    // Simulate data export
    const data = {
      profile: this.userProfile,
      settings: this.notificationSettings,
      exportDate: new Date().toISOString()
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile-data.json';
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  openPrivacySettings(): void {
    console.log('Opening privacy settings');
    // Navigate to privacy settings page
  }

  openAccountHelp(): void {
    console.log('Opening account help');
    // Navigate to help page or open support modal
  }

  signOut(): void {
    this.showLogoutModal = true;
  }
  
  confirmLogout(): void {
    // Clear all local data
    localStorage.clear();
    sessionStorage.clear();
    
    // Call auth service logout
    this.authService.logout();
    
    // Navigate to login
    this.router.navigate(['/login']).then(() => {
      // Force page reload to clear any cached data
      window.location.reload();
    });
  }
  
  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  // Utility methods
  getPasswordLastChangedText(): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.passwordLastChanged.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
  }

  loadUserStatistics(): void {
    // Load transaction statistics
    this.apiService.getWithAuth<any[]>(API_CONFIG.ENDPOINTS.TRANSACTIONS.BASE).subscribe({
      next: (transactions) => {
        this.userProfile.transactions = transactions.length;
        
        // Calculate total savings (income - expenses)
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        this.userProfile.totalSaved = income - expenses;
        
        // Count unique categories
        const uniqueCategories = new Set(transactions.map(t => t.categoryId));
        this.userProfile.categoriesUsed = uniqueCategories.size;
      },
      error: (error) => {
        console.error('Error loading transaction statistics:', error);
      }
    });
  }

  getMemberSinceText(): string {
    return this.userProfile.memberSince.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    return status === 'Active' ? 'text-green-600' : 'text-red-600';
  }

  getStatusBgColor(status: string): string {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Budget related methods
  loadBudgetData(): void {
    this.budgetService.getBudget()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (budget) => {
          this.currentBudget = budget;
        },
        error: (error) => {
          console.error('Error loading budget:', error);
        }
      });

    this.budgetService.getBudgetOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          this.budgetOverview = overview;
          // Update with real transaction data after both budget and transactions are loaded
          this.updateBudgetWithTransactionData();
        },
        error: (error) => {
          console.error('Error loading budget overview:', error);
        }
      });
  }

  formatCurrencyAmount(amount: number): string {
    return this.budgetService.formatCurrency(amount, this.currentBudget?.currency || 'USD');
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

  getBudgetStatusMessage(): string {
    if (!this.budgetOverview) return 'No budget data available';
    return this.budgetService.getBudgetStatusMessage(this.budgetOverview);
  }

  loadTransactions(): void {
    this.transactionService.getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (transactions: Transaction[]) => {
          this.transactions = transactions;
          // Update budget data with actual transaction amounts
          this.updateBudgetWithTransactionData();
          this.prepareBudgetChartData();
        },
        error: (error: any) => {
          console.error('Error loading transactions:', error);
        }
      });
  }

  private updateBudgetWithTransactionData(): void {
    if (this.budgetOverview && this.transactions.length > 0) {
      // Calculate current month expenses from actual transactions
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthExpenses = this.transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Update budget overview with actual expense data
      this.budgetOverview = {
        ...this.budgetOverview,
        spent: currentMonthExpenses,
        remaining: (this.budgetOverview.budget || 0) - currentMonthExpenses,
        percentageUsed: this.budgetOverview.budget ? (currentMonthExpenses / this.budgetOverview.budget) * 100 : 0
      };
      
      console.log('Profile View - Updated budget overview with transaction data:', this.budgetOverview);
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories;
        },
        error: (error: any) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  prepareBudgetChartData(): void {
    if (!this.budgetOverview || !this.transactions.length) return;
    
    // Get last 6 months data
    const months = this.getLastSixMonths();
    this.budgetChartData = months.map(month => {
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
        expenses: expenses,
        remaining: (this.budgetOverview?.budget || 0) - expenses
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

  getChartBarHeight(value: number): number {
    if (!this.budgetChartData.length) return 0;
    const maxValue = Math.max(
      ...this.budgetChartData.map(d => Math.max(d.budget, d.expenses))
    );
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  getTopExpenseCategories() {
    if (!this.transactions.length || !this.categories.length) return [];
    
    // Get current month expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthExpenses = this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    // Group by category and calculate totals
    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      // Find the category name by ID
      const category = this.categories.find(cat => cat.id === expense.categoryId);
      const categoryName = category ? category.name : 'Uncategorized';
      
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array and sort by amount (descending)
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3); // Top 3 categories
  }
}