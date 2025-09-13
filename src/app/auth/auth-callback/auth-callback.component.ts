import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const userStr = params['user'];
      
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.router.navigate(['/dashboard']);
        } catch (error) {
          this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' } });
        }
      } else {
        this.router.navigate(['/login'], { queryParams: { error: 'auth_failed' } });
      }
    });
  }
}