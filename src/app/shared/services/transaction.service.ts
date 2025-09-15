 import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  getTransactions(): Observable<Transaction[]> {
    return this.apiService.get<any[]>('transactions').pipe(
      map(transactions => transactions.map(t => ({
        id: t._id,
        amount: t.amount,
        title: t.title || '',
        type: t.type,
        categoryId: t.categoryId,
        description: t.description || '',
        date: new Date(t.date),
        userId: t.userId,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      })))
    );
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.apiService.get<any>(`transactions/${id}`).pipe(
      map(t => ({
        id: t._id,
        amount: t.amount,
        title: t.title || '',
        type: t.type,
        categoryId: t.categoryId,
        description: t.description || '',
        date: new Date(t.date),
        userId: t.userId,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    );
  }

  createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Observable<Transaction> {
    const payload = {
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date
    };
    return this.apiService.post<any>('transactions', payload).pipe(
      map(t => ({
        id: t._id,
        amount: t.amount,
        title: t.title || '',
        type: t.type,
        categoryId: t.categoryId,
        description: t.description || '',
        date: new Date(t.date),
        userId: t.userId,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      })),
      tap(t => {
        this.notificationService.addNotification({
          title: `${t.type === 'income' ? 'Income' : 'Expense'} Added`,
          message: `${t.title} - $${t.amount}`,
          type: t.type === 'income' ? 'success' : 'info'
        });
      })
    );
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    const payload = {
      ...(transaction.title && { title: transaction.title }),
      ...(transaction.amount && { amount: transaction.amount }),
      ...(transaction.type && { type: transaction.type }),
      ...(transaction.categoryId && { categoryId: transaction.categoryId }),
      ...(transaction.description && { description: transaction.description }),
      ...(transaction.date && { date: transaction.date })
    };
    return this.apiService.put<any>(`transactions/${id}`, payload).pipe(
      map(t => ({
        id: t._id,
        amount: t.amount,
        title: t.title || '',
        type: t.type,
        categoryId: t.categoryId,
        description: t.description || '',
        date: new Date(t.date),
        userId: t.userId,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    );
  }

  deleteTransaction(id: string): Observable<void> {
    return this.apiService.delete<void>(`transactions/${id}`).pipe(
      tap(() => {
        this.notificationService.addNotification({
          title: 'Transaction Deleted',
          message: 'Transaction has been successfully removed',
          type: 'info'
        });
      })
    );
  }

  exportTransactions(fileType: string): Observable<Blob> {
    return this.apiService.getBlob(`transactions/export?fileType=${fileType}`);
  }
}
