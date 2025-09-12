import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private mockTransactions: any[] = [
    {
      id: '1',
      amount: 5000,
      type: 'income',
      categoryId: '1',
      description: 'Salary',
      date: new Date('2024-01-15'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      amount: 1200,
      type: 'expense',
      categoryId: '1',
      description: 'Groceries',
      date: new Date('2024-01-01'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      amount: 800,
      type: 'expense',
      categoryId: '2',
      description: 'Gas',
      date: new Date('2024-01-02'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      amount: 450,
      type: 'expense',
      categoryId: '3',
      description: 'Clothes',
      date: new Date('2024-01-03'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      amount: 200,
      type: 'expense',
      categoryId: '4',
      description: 'Movie',
      date: new Date('2024-01-04'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      amount: 150,
      type: 'expense',
      categoryId: '5',
      description: 'Electric Bill',
      date: new Date('2024-01-05'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      amount: 300,
      type: 'expense',
      categoryId: '6',
      description: 'Doctor Visit',
      date: new Date('2024-01-06'),
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getTransactions(): Observable<Transaction[]> {
    return of(this.mockTransactions);
  }

  getTransaction(id: string): Observable<Transaction | undefined> {
    return of(this.mockTransactions.find(t => t.id === id));
  }

  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Observable<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockTransactions.push(newTransaction);
    return of(newTransaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    const index = this.mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTransactions[index] = { ...this.mockTransactions[index], ...transaction, updatedAt: new Date() };
      return of(this.mockTransactions[index]);
    }
    throw new Error('Transaction not found');
  }

  deleteTransaction(id: string): Observable<void> {
    const index = this.mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.mockTransactions.splice(index, 1);
    }
    return of();
  }
}