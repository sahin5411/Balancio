import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface UserProfile {
  fullName: string;
  email: string;
  initials: string;
  memberType: string;
  memberSince: Date;
  accountStatus: 'Active' | 'Inactive';
  daysActive: number;
  transactions: number;
  categoriesUsed: number;
  totalSaved: number;
  isPremium: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  monthlyReports: boolean;
}
@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl:'./profile-view.component.html'
})
export class ProfileViewComponent implements OnInit {
  
  // User profile data
  userProfile: UserProfile = {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    initials: 'AJ',
    memberType: 'Premium Member',
    memberSince: new Date('2024-03-01'),
    accountStatus: 'Active',
    daysActive: 156,
    transactions: 247,
    categoriesUsed: 12,
    totalSaved: 3421,
    isPremium: true
  };

  // Notification settings
  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    budgetAlerts: true,
    monthlyReports: false
  };

  // Edit mode states
  editingPersonalInfo: boolean = false;
  showChangePasswordModal: boolean = false;
  showTwoFactorModal: boolean = false;

  // Form data for editing
  editForm = {
    fullName: '',
    email: ''
  };

  // Password change form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Security settings
  passwordLastChanged: Date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 2 months ago
  twoFactorEnabled: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.initializeEditForm();
  }

  // Initialize edit form with current values
  initializeEditForm(): void {
    this.editForm = {
      fullName: this.userProfile.fullName,
      email: this.userProfile.email
    };
  }

  // Personal Information Section
  startEditingPersonalInfo(): void {
    this.editingPersonalInfo = true;
    this.initializeEditForm();
  }

  cancelEditingPersonalInfo(): void {
    this.editingPersonalInfo = false;
    this.initializeEditForm();
  }

  savePersonalInfo(): void {
    if (this.editForm.fullName.trim() && this.editForm.email.trim()) {
      this.userProfile.fullName = this.editForm.fullName;
      this.userProfile.email = this.editForm.email;
      
      // Update initials
      const names = this.editForm.fullName.split(' ');
      this.userProfile.initials = names.map(name => name.charAt(0)).join('').toUpperCase();
      
      this.editingPersonalInfo = false;
      console.log('Personal info updated:', this.userProfile);
    }
  }

  // Security Settings
  openChangePasswordModal(): void {
    this.showChangePasswordModal = true;
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // Simulate password change
    this.passwordLastChanged = new Date();
    this.showChangePasswordModal = false;
    alert('Password changed successfully');
    console.log('Password changed');
  }

  // Two-Factor Authentication
  openTwoFactorModal(): void {
    this.showTwoFactorModal = true;
  }

  closeTwoFactorModal(): void {
    this.showTwoFactorModal = false;
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    this.showTwoFactorModal = false;
    const status = this.twoFactorEnabled ? 'enabled' : 'disabled';
    alert(`Two-factor authentication ${status}`);
    console.log('2FA toggled:', this.twoFactorEnabled);
  }

  // Notification Settings
  updateNotificationSetting(setting: keyof NotificationSettings): void {
    this.notificationSettings[setting] = !this.notificationSettings[setting];
    console.log('Notification settings updated:', this.notificationSettings);
  }

  configureEmailNotifications(): void {
    console.log('Configure email notifications');
    // Open configuration modal or navigate to detailed settings
  }

  configureBudgetAlerts(): void {
    console.log('Configure budget alerts');
    // Open configuration modal or navigate to detailed settings
  }

  configureMonthlyReports(): void {
    console.log('Configure monthly reports');
    // Open configuration modal or navigate to detailed settings
  }

  // Quick Actions
  exportData(): void {
    console.log('Exporting user data...');
    // Simulate data export
    const data = {
      profile: this.userProfile,
      settings: this.notificationSettings,
      exportDate: new Date().toISOString()
    };
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'profile-data.json';
    link.click();
    
    window.URL.revokeObjectURL(url);
  }

  openPrivacySettings(): void {
    console.log('Opening privacy settings');
    // Navigate to privacy settings page
  }

  openAccountHelp(): void {
    console.log('Opening account help');
    // Navigate to help page or open support modal
  }

  signOut(): void {
    if (confirm('Are you sure you want to sign out?')) {
      console.log('Signing out...');
      // Implement sign out logic
    }
  }

  // Utility methods
  getPasswordLastChangedText(): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.passwordLastChanged.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
  }

  getMemberSinceText(): string {
    return this.userProfile.memberSince.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getStatusColor(status: string): string {
    return status === 'Active' ? 'text-green-600' : 'text-red-600';
  }

  getStatusBgColor(status: string): string {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}