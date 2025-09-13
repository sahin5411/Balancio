import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/transactions', icon: 'receipt', label: 'Transactions' },
    { path: '/categories', icon: 'category', label: 'Categories' },
    { path: '/profile', icon: 'person', label: 'Profile' }
  ];

  closeSidebar() {
    this.close.emit();
  }

  onMenuItemClick() {
    if (this.isOpen) {
      this.closeSidebar();
    }
  }
}