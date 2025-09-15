import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IncomeCardComponent } from './components/income-card/income-card.component';
import { ExpenseCardComponent } from './components/expense-card/expense-card.component';
import { BalanceCardComponent } from './components/balance-card/balance-card.component';
import { TransactionCountCardComponent } from './components/transaction-count-card/transaction-count-card.component';
import { ExpenseChartComponent } from './components/expense-chart/expense-chart.component';
import { IncomeExpenseBarChartComponent } from './components/income-expense-bar-chart/income-expense-bar-chart.component';
import { TransactionService } from '../shared/services/transaction.service';
import { CategoryService } from '../shared/services/category.service';
import { CurrencyService } from '../shared/services/currency.service';
import { BudgetService } from '../shared/services/budget.service';
import { Transaction } from '../shared/models/transaction.model';
import { Category } from '../shared/models/category.model';
import { BudgetOverview } from '../shared/models/budget.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IncomeCardComponent,
    ExpenseCardComponent,
    BalanceCardComponent,
    TransactionCountCardComponent,
    ExpenseChartComponent,
    IncomeExpenseBarChartComponent,
    LoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;
  totalTransactionCount = 0;
  incomeTransactionCount = 0;
  expenseTransactionCount = 0;
  currencySymbol = '$';
  isLoading = false;
  budgetOverview: BudgetOverview | null = null;
  
  // Add Transaction Modal properties
  showAddModal = false;
  newTransaction = {
    title: '',
    amount: 0,
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  };
  
  titleSuggestions: string[] = [];
  showSuggestions = false;

  expenseSuggestions = [
    'Groceries', 'Gas', 'Coffee', 'Lunch', 'Dinner', 'Uber', 'Parking',
    'Electric Bill', 'Water Bill', 'Internet', 'Phone Bill', 'Rent',
    'Shopping', 'Movies', 'Gym', 'Medicine', 'Doctor Visit'
  ];

  incomeSuggestions = [
    'Salary', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Refund',
    'Side Job', 'Commission', 'Dividend', 'Interest', 'Overtime Pay',
    'Tax Refund', 'Insurance Claim', 'Rental Income', 'Business Income',
    'Consulting Fee', 'Part-time Job', 'Cash Gift', 'Prize Money',
    'Scholarship', 'Grant', 'Pension', 'Social Security', 'Allowance'
  ];
  
  private destroy$ = new Subject<void>();
  
  Math = Math; // Make Math available in template

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private currencyService: CurrencyService,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.loadCategories();
    this.loadTransactions();
    this.loadBudgetData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  loadBudgetData() {
    this.budgetService.getBudgetOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          this.budgetOverview = overview;
          // Update spent amount based on actual transactions
          this.updateBudgetWithTransactionData();
        },
        error: (error) => {
          console.error('Error loading budget overview:', error);
        }
      });
  }

  private updateBudgetWithTransactionData() {
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
      
      console.log('Updated budget overview with transaction data:', this.budgetOverview);
    }
  }

  loadTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTotals();
        // Update budget data after transactions are loaded
        this.updateBudgetWithTransactionData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.transactions = [];
        this.calculateTotals();
        this.isLoading = false;
      }
    });
  }

  calculateTotals() {
    const incomeTransactions = this.transactions.filter(t => t.type === 'income');
    const expenseTransactions = this.transactions.filter(t => t.type === 'expense');
    
    this.totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    this.totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    this.balance = this.totalIncome - this.totalExpenses;
    
    // Calculate transaction counts
    this.totalTransactionCount = this.transactions.length;
    this.incomeTransactionCount = incomeTransactions.length;
    this.expenseTransactionCount = expenseTransactions.length;
  }

  // Budget helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getBudgetStatusClass(): string {
    if (!this.budgetOverview) return 'bg-gray-100 text-gray-800';
    const percentage = this.budgetOverview.percentageUsed || 0;
    
    if (percentage >= 95) {
      return 'bg-red-100 text-red-800';
    } else if (percentage >= 80) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  }

  getBudgetProgressClass(): string {
    if (!this.budgetOverview) return 'bg-gray-400';
    const percentage = this.budgetOverview.percentageUsed || 0;
    
    if (percentage >= 95) {
      return 'bg-red-500';
    } else if (percentage >= 80) {
      return 'bg-yellow-500';
    } else {
      return 'bg-green-500';
    }
  }

  // Add Transaction Modal Methods
  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetNewTransaction();
  }

  addTransaction() {
    if (!this.newTransaction.title || !this.newTransaction.amount || !this.newTransaction.category) {
      alert('Please fill in all required fields');
      return;
    }

    const transactionData: any = {
      title: this.newTransaction.title,
      description: this.newTransaction.title,
      amount: this.newTransaction.amount,
      type: this.newTransaction.type,
      categoryId: this.newTransaction.category,
      date: new Date(this.newTransaction.date)
    };
    
    this.transactionService.createTransaction(transactionData).subscribe({
      next: () => {
        this.loadTransactions();
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error creating transaction:', error);
        alert('Failed to create transaction');
      }
    });
  }

  resetNewTransaction() {
    this.newTransaction = {
      title: '',
      amount: 0,
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    };
    this.showSuggestions = false;
  }

  onTitleInput(event: any) {
    const value = event.target.value;
    const suggestions = this.newTransaction.type === 'expense' ? this.expenseSuggestions : this.incomeSuggestions;
    
    if (value.length > 0) {
      this.titleSuggestions = suggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
    } else {
      this.titleSuggestions = suggestions.slice(0, 5);
    }
    
    this.showSuggestions = this.titleSuggestions.length > 0;
  }

  selectSuggestion(suggestion: string) {
    this.newTransaction.title = suggestion;
    this.showSuggestions = false;
  }

  onTypeChange() {
    this.showSuggestions = false;
    if (this.newTransaction.title) {
      this.onTitleInput({ target: { value: this.newTransaction.title } });
    }
  }
}
