import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private apiService: ApiService) {}

  getCategories(): Observable<Category[]> {
    return this.apiService.get<any[]>('categories').pipe(
      map(categories => categories.map(c => ({
        id: c._id,
        name: c.name,
        color: c.color,
        icon: c.icon || 'category',
        type: c.type,
        userId: c.userId,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      })))
    );
  }

  getCategory(id: string): Observable<Category> {
    return this.apiService.get<any>(`categories/${id}`).pipe(
      map(c => ({
        id: c._id,
        name: c.name,
        color: c.color,
        icon: c.icon || 'category',
        type: c.type,
        userId: c.userId,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }))
    );
  }

  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    const payload = {
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    };
    return this.apiService.post<any>('categories', payload).pipe(
      map(c => ({
        id: c._id,
        name: c.name,
        color: c.color,
        icon: c.icon || 'category',
        type: c.type,
        userId: c.userId,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }))
    );
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    const payload = {
      ...(category.name && { name: category.name }),
      ...(category.type && { type: category.type }),
      ...(category.color && { color: category.color }),
      ...(category.icon && { icon: category.icon })
    };
    return this.apiService.put<any>(`categories/${id}`, payload).pipe(
      map(c => ({
        id: c._id,
        name: c.name,
        color: c.color,
        icon: c.icon || 'category',
        type: c.type,
        userId: c.userId,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }))
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.apiService.delete<void>(`categories/${id}`);
  }
}