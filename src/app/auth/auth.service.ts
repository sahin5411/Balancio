import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  private currentUser: User | null = null;

  login(email: string, password: string): Observable<{ success: boolean; user?: User; message?: string }> {
    // Mock login logic
    if (email === 'admin@example.com' && password === 'password') {
      this.isLoggedIn = true;
      this.currentUser = {
        id: '1',
        email: email,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return of({ success: true, user: this.currentUser });
    }
    return of({ success: false, message: 'Invalid credentials' });
  }

  signup(userData: any): Observable<{ success: boolean; user?: User; message?: string }> {
    // Mock signup logic
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.isLoggedIn = true;
    this.currentUser = newUser;
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return of({ success: true, user: newUser });
  }

  logout(): void {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    if (this.isLoggedIn) return true;
    
    const stored = localStorage.getItem('isLoggedIn');
    if (stored === 'true') {
      this.isLoggedIn = true;
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
      return true;
    }
    return false;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}