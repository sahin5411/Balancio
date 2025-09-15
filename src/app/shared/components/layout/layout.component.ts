import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { GlobalTransactionModalComponent } from '../global-transaction-modal/global-transaction-modal.component';
import { FloatingActionButtonComponent } from '../floating-action-button/floating-action-button.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent, GlobalTransactionModalComponent, FloatingActionButtonComponent],
  template: `
    <div class="flex flex-col lg:flex-row h-screen bg-gray-50">
      <!-- Mobile Header -->
      <div class="lg:hidden bg-white shadow-sm border-b">
        <app-navbar (mobileMenuToggle)="toggleMobileSidebar()"></app-navbar>
      </div>
      
      <!-- Mobile Sidebar Overlay -->
      <div 
        *ngIf="isMobileSidebarOpen" 
        class="lg:hidden fixed inset-0 z-50 flex"
        (click)="closeMobileSidebar()">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"></div>
        
        <!-- Sidebar -->
        <div 
          class="relative w-64 sm:w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out"
          (click)="$event.stopPropagation()">
          <app-sidebar [isOpen]="isMobileSidebarOpen" (close)="closeMobileSidebar()"></app-sidebar>
        </div>
      </div>
      
      <!-- Desktop Sidebar -->
      <app-sidebar class="hidden lg:block w-64 xl:w-72 bg-white shadow-lg" [isOpen]="false"></app-sidebar>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Desktop Navbar -->
        <div class="hidden lg:block bg-white shadow-sm border-b">
          <app-navbar (mobileMenuToggle)="toggleMobileSidebar()"></app-navbar>
        </div>
        
        <!-- Page Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6 xl:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
      
      <!-- Global Transaction Modal -->
      <app-global-transaction-modal></app-global-transaction-modal>
      
      <!-- Floating Action Button -->
      <app-floating-action-button></app-floating-action-button>
    </div>
  `
})
export class LayoutComponent {
  isMobileSidebarOpen = false;

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}