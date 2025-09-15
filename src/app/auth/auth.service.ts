import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from '../shared/services/api.service';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(private apiService: ApiService) {}

  login(email: string, password: string): Observable<{ success: boolean; user?: User; message?: string }> {
    return this.apiService.post<{ token: string; user: any }>('auth/login', { email, password })
      .pipe(
        map(response => {
          localStorage.setItem('token', response.token);
          this.currentUser = {
            id: response.user._id || response.user.id,
            email: response.user.email,
            firstName: response.user.firstName || response.user.name?.split(' ')[0] || '',
            lastName: response.user.lastName || response.user.name?.split(' ').slice(1).join(' ') || '',
            createdAt: new Date(response.user.createdAt) || new Date(),
            updatedAt: new Date(response.user.updatedAt) || new Date()
          };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          return { success: true, user: this.currentUser };
        }),
        catchError(error => of({ success: false, message: error.error?.message || 'Login failed' }))
      );
  }

  signup(userData: any): Observable<{ success: boolean; user?: User; message?: string }> {
    return this.apiService.post<{ token: string; user: any }>('auth/register', {
      email: userData.email,
      password: userData.password,
      name: `${userData.firstName} ${userData.lastName}`
    }).pipe(
      map(response => {
        localStorage.setItem('token', response.token);
        this.currentUser = {
          id: response.user.id,
          email: response.user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      }),
      catchError(error => of({ success: false, message: error.error?.message || 'Signup failed' }))
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
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

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  loginWithGoogle(): Observable<{ success: boolean; user?: User; message?: string }> {
    return new Observable(observer => {
      const popup = window.open(
        'https://balancio-backend.vercel.app/api/auth/google',
        'google-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          const token = localStorage.getItem('token');
          if (token) {
            observer.next({ success: true });
          } else {
            observer.next({ success: false, message: 'Login cancelled' });
          }
          observer.complete();
        }
      }, 1000);
    });
  }

  loginWithGitHub(): Observable<{ success: boolean; user?: User; message?: string }> {
    return new Observable(observer => {
      const popup = window.open(
        'https://balancio-backend.vercel.app/api/auth/github',
        'github-login',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          const token = localStorage.getItem('token');
          if (token) {
            observer.next({ success: true });
          } else {
            observer.next({ success: false, message: 'Login cancelled' });
          }
          observer.complete();
        }
      }, 1000);
    });
  }
}