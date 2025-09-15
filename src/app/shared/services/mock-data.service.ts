import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockCategories: Category[] = [
    {
      id: '1',
      name: 'Food & Dining',
      type: 'expense',
      color: '#FF6B6B',
      icon: 'restaurant',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Transportation',
      type: 'expense',
      color: '#4ECDC4',
      icon: 'directions_car',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Shopping',
      type: 'expense',
      color: '#45B7D1',
      icon: 'shopping_bag',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Utilities',
      type: 'expense',
      color: '#F7DC6F',
      icon: 'flash_on',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      name: 'Entertainment',
      type: 'expense',
      color: '#BB8FCE',
      icon: 'movie',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '6',
      name: 'Healthcare',
      type: 'expense',
      color: '#F1948A',
      icon: 'local_hospital',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '7',
      name: 'Salary',
      type: 'income',
      color: '#58D68D',
      icon: 'attach_money',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '8',
      name: 'Freelance',
      type: 'income',
      color: '#52C4A0',
      icon: 'work',
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockTransactions: Transaction[] = [
    // Food & Dining transactions (id: '1')
    {
      id: 't1',
      title: 'Lunch at Restaurant',
      description: 'Lunch at Restaurant',
      amount: 25.50,
      type: 'expense',
      categoryId: '1',
      date: new Date('2024-01-15'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't2',
      title: 'Grocery Shopping',
      description: 'Weekly grocery shopping',
      amount: 89.75,
      type: 'expense',
      categoryId: '1',
      date: new Date('2024-01-14'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't3',
      title: 'Coffee',
      description: 'Morning coffee',
      amount: 4.50,
      type: 'expense',
      categoryId: '1',
      date: new Date('2024-01-13'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Transportation transactions (id: '2')
    {
      id: 't4',
      title: 'Gas Station',
      description: 'Fill up gas tank',
      amount: 45.00,
      type: 'expense',
      categoryId: '2',
      date: new Date('2024-01-12'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't5',
      title: 'Uber Ride',
      description: 'Uber to airport',
      amount: 32.25,
      type: 'expense',
      categoryId: '2',
      date: new Date('2024-01-11'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Shopping transactions (id: '3')
    {
      id: 't6',
      title: 'Online Purchase',
      description: 'Electronics shopping',
      amount: 150.00,
      type: 'expense',
      categoryId: '3',
      date: new Date('2024-01-10'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't7',
      title: 'Clothing Store',
      description: 'New winter jacket',
      amount: 89.99,
      type: 'expense',
      categoryId: '3',
      date: new Date('2024-01-09'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Utilities transactions (id: '4')
    {
      id: 't8',
      title: 'Electricity Bill',
      description: 'Monthly electricity bill',
      amount: 120.00,
      type: 'expense',
      categoryId: '4',
      date: new Date('2024-01-08'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't9',
      title: 'Internet Bill',
      description: 'Monthly internet service',
      amount: 79.99,
      type: 'expense',
      categoryId: '4',
      date: new Date('2024-01-07'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Entertainment transactions (id: '5')
    {
      id: 't10',
      title: 'Movie Tickets',
      description: 'Weekend movie night',
      amount: 24.00,
      type: 'expense',
      categoryId: '5',
      date: new Date('2024-01-06'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't11',
      title: 'Streaming Service',
      description: 'Monthly Netflix subscription',
      amount: 15.99,
      type: 'expense',
      categoryId: '5',
      date: new Date('2024-01-05'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Healthcare transactions (id: '6')
    {
      id: 't12',
      title: 'Doctor Visit',
      description: 'Annual checkup',
      amount: 200.00,
      type: 'expense',
      categoryId: '6',
      date: new Date('2024-01-04'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Income transactions
    {
      id: 't13',
      title: 'Monthly Salary',
      description: 'January salary payment',
      amount: 5000.00,
      type: 'income',
      categoryId: '7',
      date: new Date('2024-01-01'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't14',
      title: 'Freelance Project',
      description: 'Web development project',
      amount: 1500.00,
      type: 'income',
      categoryId: '8',
      date: new Date('2024-01-15'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 't15',
      title: 'Consulting Work',
      description: 'Technical consulting',
      amount: 750.00,
      type: 'income',
      categoryId: '8',
      date: new Date('2024-01-10'),
      userId: 'demo-user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getMockCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  getMockTransactions(): Observable<Transaction[]> {
    return of(this.mockTransactions);
  }

  getMockCategory(id: string): Observable<Category | undefined> {
    const category = this.mockCategories.find(c => c.id === id);
    return of(category);
  }

  getMockTransaction(id: string): Observable<Transaction | undefined> {
    const transaction = this.mockTransactions.find(t => t.id === id);
    return of(transaction);
  }
}