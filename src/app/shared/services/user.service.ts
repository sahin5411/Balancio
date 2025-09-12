import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private mockUser: User = {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://via.placeholder.com/150',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  getCurrentUser(): Observable<User> {
    return of(this.mockUser);
  }

  updateUser(user: Partial<User>): Observable<User> {
    this.mockUser = { ...this.mockUser, ...user, updatedAt: new Date() };
    return of(this.mockUser);
  }
}