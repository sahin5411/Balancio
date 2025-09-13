import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../auth/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { User } from '../../models/user.model';

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
  unreadNotifications: number = 0;
  currentPageTitle: string = 'Dashboard';
  currentUser: any = null;
  notifications: Notification[] = [];
  showLogoutModal: boolean = false;
  searchResults: any[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadNotifications();
    
    // Update title on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
    
    // Set initial title
    this.updatePageTitle();
    
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

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.unreadNotifications = notifications.filter(n => !n.read).length;
    });
  }

  loadUserData(): void {
    const authUser = this.authService.getCurrentUser();
    console.log('Auth user from service:', authUser);
    if (authUser) {
      const firstName = authUser.firstName || '';
      const lastName = authUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'User';
      
      this.currentUser = {
        name: fullName,
        initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U',
        email: authUser.email,
        avatar: authUser.avatar
      };
      console.log('Current user set to:', this.currentUser);
    } else {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          console.log('User from API:', user);
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'User';
          
          this.currentUser = {
            name: fullName,
            initials: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'U',
            email: user.email,
            avatar: user.avatar
          };
          console.log('Current user set from API:', this.currentUser);
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.currentUser = {
            name: 'User',
            initials: 'U',
            email: 'user@example.com',
            avatar: null
          };
        }
      });
    }
  }

  // Search functionality
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    const term = this.searchTerm.trim();
    
    if (term.length < 2) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }
    
    this.isSearching = true;
    this.performGlobalSearch(term);
  }
  
  performGlobalSearch(term: string): void {
    const token = this.authService.getToken();
    
    // Search transactions
    this.http.get<any[]>('https://balancio-backend.vercel.app/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (transactions) => {
        const filteredTransactions = transactions.filter(t => 
          t.description?.toLowerCase().includes(term.toLowerCase()) ||
          t.title?.toLowerCase().includes(term.toLowerCase())
        ).slice(0, 5);
        
        this.searchResults = filteredTransactions.map(t => ({
          type: 'transaction',
          title: t.description || t.title,
          subtitle: `${t.type} - ₹${t.amount}`,
          data: t
        }));
        
        this.showSearchResults = true;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchResults = [];
        this.showSearchResults = false;
        this.isSearching = false;
      }
    });
  }
  
  selectSearchResult(result: any): void {
    this.searchTerm = '';
    this.showSearchResults = false;
    
    if (result.type === 'transaction') {
      this.router.navigate(['/transactions']);
    }
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
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
    this.notificationService.markAllAsRead();
  }

  // Mark single notification as read
  markNotificationAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId);
  }

  // User menu actions
  viewProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  viewSettings() {
    console.log('Settings clicked');
    this.showUserMenu = false;
    // Navigate to settings page
  }

  logout() {
    this.showUserMenu = false;
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutModal = false;
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

  // Update page title based on current route
  private updatePageTitle(): void {
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
    this.currentPageTitle = titleMap[url] || 'Balancio Dashboard';
  }

  // Get current page title
  getCurrentPageTitle(): string {
    return this.currentPageTitle;
  }

  // Get welcome message
  getWelcomeMessage(): string {
    return this.currentUser ? `Welcome back, ${this.currentUser.name}` : 'Welcome back';
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