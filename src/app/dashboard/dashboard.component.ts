import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeCardComponent } from './components/income-card/income-card.component';
import { ExpenseCardComponent } from './components/expense-card/expense-card.component';
import { BalanceCardComponent } from './components/balance-card/balance-card.component';
import { ExpenseChartComponent } from './components/expense-chart/expense-chart.component';
import { IncomeExpenseBarChartComponent } from './components/income-expense-bar-chart/income-expense-bar-chart.component';
import { TransactionService } from '../shared/services/transaction.service';
import { CurrencyService } from '../shared/services/currency.service';
import { Transaction } from '../shared/models/transaction.model';
import { LoaderComponent } from '../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IncomeCardComponent,
    ExpenseCardComponent,
    BalanceCardComponent,
    ExpenseChartComponent,
    IncomeExpenseBarChartComponent,
    LoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;
  currencySymbol = '$';
  isLoading = false;

  constructor(
    private transactionService: TransactionService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.calculateTotals();
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
    this.totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    this.balance = this.totalIncome - this.totalExpenses;
  }
}
