import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncomeCardComponent } from './components/income-card/income-card.component';
import { ExpenseCardComponent } from './components/expense-card/expense-card.component';
import { BalanceCardComponent } from './components/balance-card/balance-card.component';
import { ExpenseChartComponent } from './components/expense-chart/expense-chart.component';
import { IncomeExpenseBarChartComponent } from './components/income-expense-bar-chart/income-expense-bar-chart.component';
import { TransactionService } from '../shared/services/transaction.service';
import { Transaction } from '../shared/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IncomeCardComponent,
    ExpenseCardComponent,
    BalanceCardComponent,
    ExpenseChartComponent,
    IncomeExpenseBarChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  totalIncome = 0;
  totalExpenses = 0;
  balance = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
      this.calculateTotals();
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