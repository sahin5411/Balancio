import { Routes } from '@angular/router';
import { AuthGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions/new',
    loadComponent: () => import('./transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transactions/edit/:id',
    loadComponent: () => import('./transactions/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/category-list/category-list.component').then(m => m.CategoryListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/new',
    loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/edit/:id',
    loadComponent: () => import('./categories/category-form/category-form.component').then(m => m.CategoryFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./profile/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];