import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getCurrentUser(): Observable<User> {
    return this.apiService.get<any>('users/profile').pipe(
      map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        avatar: user.avatar || 'https://via.placeholder.com/150',
        settings: user.settings || {
          emailNotifications: true,
          budgetAlerts: true,
          monthlyReports: true,
          reportFormat: 'excel',
          twoFactorEnabled: false
        },
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }))
    );
  }

  updateUser(user: Partial<User>): Observable<User> {
    const payload: any = {};
    
    if (user.firstName || user.lastName) {
      payload.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    if (user.email) {
      payload.email = user.email;
    }
    if (user.settings) {
      payload.settings = user.settings;
    }
    
    return this.apiService.put<any>('users/profile', payload).pipe(
      map(updatedUser => ({
        id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.name?.split(' ')[0] || '',
        lastName: updatedUser.name?.split(' ').slice(1).join(' ') || '',
        avatar: updatedUser.avatar || 'https://via.placeholder.com/150',
        settings: updatedUser.settings || {
          emailNotifications: true,
          budgetAlerts: true,
          monthlyReports: true,
          reportFormat: 'excel',
          twoFactorEnabled: false
        },
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
      }))
    );
  }
}