import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiresAuth = route.data['requiresAuth'];

    if (this.authService.isAuthenticated()) {
      if (requiresAuth) {
        return true;
      } else {
        this.router.navigate(['/dashboard']);
        return false;
      }
    } else {
      if (requiresAuth) {
        this.router.navigate(['/login']);
        return false;
      } else {
        return true;
      }
    }
  }
}
