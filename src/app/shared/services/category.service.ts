import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private mockCategories: Category[] = [
    {
      id: '1',
      name: 'Salary',
      color: '#10B981',
      icon: 'work',
      type: 'income',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Housing',
      color: '#EF4444',
      icon: 'home',
      type: 'expense',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Food',
      color: '#F59E0B',
      icon: 'restaurant',
      type: 'expense',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getCategories(): Observable<Category[]> {
    return of(this.mockCategories);
  }

  getCategory(id: string): Observable<Category | undefined> {
    return of(this.mockCategories.find(c => c.id === id));
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockCategories.push(newCategory);
    return of(newCategory);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCategories[index] = { ...this.mockCategories[index], ...category, updatedAt: new Date() };
      return of(this.mockCategories[index]);
    }
    throw new Error('Category not found');
  }

  deleteCategory(id: string): Observable<void> {
    const index = this.mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCategories.splice(index, 1);
    }
    return of();
  }
}