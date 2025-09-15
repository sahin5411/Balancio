import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { GlobalTransactionModalService } from '../../services/global-transaction-modal.service';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { CurrencyService } from '../../services/currency.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-global-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './global-transaction-modal.component.html',
  styleUrls: ['./global-transaction-modal.component.scss']
})
export class GlobalTransactionModalComponent implements OnInit, OnDestroy {
  isModalOpen = false;
  isLoading = false;
  categories: Category[] = [];
  currencySymbol = '$';
  
  newTransaction = {
    title: '',
    amount: 0,
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    description: ''
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
    'Tax Refund', 'Insurance Claim', 'Rental Income', 'Business Income'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private globalModalService: GlobalTransactionModalService,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.loadCategories();

    // Subscribe to modal state changes
    combineLatest([
      this.globalModalService.isModalOpen$,
      this.globalModalService.transactionType$
    ]).pipe(takeUntil(this.destroy$))
    .subscribe(([isOpen, type]) => {
      this.isModalOpen = isOpen;
      this.newTransaction.type = type;
      if (isOpen) {
        this.resetForm();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.categories = [];
        }
      });
  }

  get filteredCategories(): Category[] {
    return this.categories.filter(cat => cat.type === this.newTransaction.type);
  }

  closeModal(): void {
    this.globalModalService.closeModal();
    this.showSuggestions = false;
  }

  onTitleInput(event: any): void {
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

  selectSuggestion(suggestion: string): void {
    this.newTransaction.title = suggestion;
    this.newTransaction.description = suggestion;
    this.showSuggestions = false;
  }

  onTypeChange(): void {
    this.newTransaction.category = '';
    this.showSuggestions = false;
    if (this.newTransaction.title) {
      this.onTitleInput({ target: { value: this.newTransaction.title } });
    }
  }

  addTransaction(): void {
    if (!this.newTransaction.title.trim() || !this.newTransaction.amount || !this.newTransaction.category) {
      this.showError('Please fill in all required fields');
      return;
    }

    if (this.newTransaction.amount <= 0) {
      this.showError('Amount must be greater than 0');
      return;
    }

    this.isLoading = true;

    const transactionData: any = {
      title: this.newTransaction.title.trim(),
      description: this.newTransaction.description.trim() || this.newTransaction.title.trim(),
      amount: Number(this.newTransaction.amount),
      type: this.newTransaction.type,
      categoryId: this.newTransaction.category,
      date: new Date(this.newTransaction.date)
    };
    
    this.transactionService.createTransaction(transactionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showSuccess('Transaction added successfully!');
          this.closeModal();
          this.isLoading = false;
          // Emit event to refresh other components if needed
          window.dispatchEvent(new CustomEvent('transactionAdded'));
        },
        error: (error) => {
          console.error('Error creating transaction:', error);
          this.showError('Failed to add transaction. Please try again.');
          this.isLoading = false;
        }
      });
  }

  resetForm(): void {
    this.newTransaction = {
      title: '',
      amount: 0,
      category: '',
      type: this.newTransaction.type,
      date: new Date().toISOString().split('T')[0],
      description: ''
    };
    this.showSuggestions = false;
  }

  private showError(message: string): void {
    // You can replace this with a proper notification service
    alert(message);
  }

  private showSuccess(message: string): void {
    // You can replace this with a proper notification service
    console.log(message);
  }

  // Click outside to close modal
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}