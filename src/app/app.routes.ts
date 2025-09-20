import { Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  // Auth routes with auth layout
  {
    path: '',
    loadComponent: () => import('./auth/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    canActivate: [AuthGuard],
    data: { requiresAuth: false },
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      },
      {
        path: 'auth/callback',
        loadComponent: () => import('./auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
      }
    ]
  },
  // Protected routes with main layout
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    data: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'transactions/new',
        loadComponent: () => import('./transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'transactions/edit/:id',
        loadComponent: () => import('./transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./categories/category-list/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'categories/new',
        loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];