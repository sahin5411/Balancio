import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../shared/services/transaction.service';
import { Transaction } from '../../shared/models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Health'];
  
  searchTerm = '';
  selectedCategory = '';
  selectedType = '';
  showActionsMenu: string | null = null;
  showAddModal = false;
  
  newTransaction = {
    title: '',
    amount: 0,
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  };

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions.map(t => ({
        ...t,
        title: t.description,
        category: 'Category ' + t.categoryId
      } as any));
      this.filteredTransactions = [...this.transactions];
    });
  }

  getTotalIncome() {
    return this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpenses() {
    return this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }

  getNetTotal() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  onSearch(event: any) {
    this.applyFilters();
  }

  onCategoryFilter(event: any) {
    this.applyFilters();
  }

  onTypeFilter(event: any) {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredTransactions = this.transactions.filter(t => {
      const matchesSearch = !this.searchTerm || (t as any).title?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || (t as any).category === this.selectedCategory;
      const matchesType = !this.selectedType || t.type === this.selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }

  trackByTransactionId(index: number, transaction: any) {
    return transaction.id;
  }

  getAmountColor(transaction: any) {
    return transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
  }

  getAmountDisplay(transaction: any) {
    const prefix = transaction.type === 'income' ? '+' : '-';
    return `${prefix}$${transaction.amount.toFixed(2)}`;
  }

  getCategoryBadgeColor(category: string) {
    return 'bg-gray-100 text-gray-800';
  }

  getTypeBadgeColor(type: string) {
    return type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  toggleActionsMenu(id: string) {
    this.showActionsMenu = this.showActionsMenu === id ? null : id;
  }

  closeActionsMenu() {
    this.showActionsMenu = null;
  }

  editTransaction(id: string) {
    console.log('Edit transaction:', id);
    this.closeActionsMenu();
  }

  deleteTransaction(id: string) {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe(() => {
        this.loadTransactions();
      });
    }
    this.closeActionsMenu();
  }

  exportTransactions() {
    console.log('Export transactions');
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetNewTransaction();
  }

  addTransaction() {
    const transactionData:any = {
      ...this.newTransaction,
      description: this.newTransaction.title,
      categoryId: '1',
      date: new Date(this.newTransaction.date),
      userId: '1'
    };
    
    this.transactionService.createTransaction(transactionData).subscribe(() => {
      this.loadTransactions();
      this.closeAddModal();
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
  }
}