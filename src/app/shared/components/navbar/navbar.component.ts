import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  searchTerm: string = '';
  showUserMenu: boolean = false;
  showNotifications: boolean = false;
  showMobileSearch: boolean = false;
  unreadNotifications: number = 3;

  // Mock user data

currentUser = {
  name: 'Shree',
  initials: 'SH', 
  email: 'shree@gmail.com',
  avatar: "https://ui-avatars.com/api/?name=Shree&background=random&size=128",
};  

  // Mock notifications
  notifications = [
    {
      id: 1,
      title: 'Budget Alert',
      message: 'You have exceeded your monthly food budget',
      time: '2 minutes ago',
      read: false,
      type: 'warning'
    },
    {
      id: 2,
      title: 'Income Received',
      message: 'Salary deposit of $3,500 has been added',
      time: '1 hour ago',
      read: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Bill Reminder',
      message: 'Electric bill is due in 3 days',
      time: '5 hours ago',
      read: false,
      type: 'info'
    }
  ];

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        this.showUserMenu = false;
      }
      if (!target.closest('.notifications-container')) {
        this.showNotifications = false;
      }
    });
  }

  // Search functionality
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    // Emit search event or call search service
    console.log('Searching for:', this.searchTerm);
  }

  // Toggle user menu
  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false; // Close notifications if open
  }

  // Toggle notifications
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false; // Close user menu if open
    
    // Mark notifications as read when opened
    if (this.showNotifications) {
      this.markAllNotificationsAsRead();
    }
  }

  // Mark all notifications as read
  markAllNotificationsAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.unreadNotifications = 0;
  }

  // Mark single notification as read
  markNotificationAsRead(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadNotifications = Math.max(0, this.unreadNotifications - 1);
    }
  }

  // User menu actions
  viewProfile() {
    console.log('View Profile clicked');
    this.showUserMenu = false;
    // Navigate to profile page
  }

  viewSettings() {
    console.log('Settings clicked');
    this.showUserMenu = false;
    // Navigate to settings page
  }

  logout() {
    this.showUserMenu = false;
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'warning': 'warning',
      'success': 'check_circle',
      'info': 'info',
      'error': 'error'
    };
    return iconMap[type] || 'notifications';
  }

  // Get notification color based on type
  getNotificationColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'warning': 'text-orange-500',
      'success': 'text-green-500',
      'info': 'text-blue-500',
      'error': 'text-red-500'
    };
    return colorMap[type] || 'text-gray-500';
  }

  // Get current page title based on route
  getCurrentPageTitle(): string {
    const url = this.router.url;
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/transactions': 'Transactions',
      '/budgets': 'Budgets',
      '/categories': 'Categories',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/profile': 'Profile'
    };
    return titleMap[url] || 'Balancio Dashboard';
  }

  // Get welcome message
  getWelcomeMessage(): string {
    return `Welcome back, ${this.currentUser.name}`;
  }

  // Mobile responsive methods
  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }

  @Output() mobileMenuToggle = new EventEmitter<void>();

  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit();
  }
}