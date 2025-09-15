import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { NotificationService } from '../../services/notification.service';

interface BudgetAlertDiagnostics {
  budgetSet: boolean;
  alertsEnabled: boolean;
  currentStatus: 'no_budget' | 'safe' | 'warning' | 'critical';
  percentageUsed?: number;
  shouldSendAlert?: boolean;
  lastAlerts?: {
    warning?: string;
    critical?: string;
  };
  thresholds?: {
    warning: number;
    critical: number;
  };
  debugInfo?: any;
}

@Component({
  selector: 'app-budget-alert-diagnostics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">💡 Budget Alert Diagnostics</h2>
      
      <!-- Debug Information -->
      <div *ngIf="diagnostics" class="space-y-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">Budget Status</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Budget Set:</span>
                <span [class]="diagnostics.budgetSet ? 'text-green-600' : 'text-red-600'">
                  {{ diagnostics.budgetSet ? '✅ Yes' : '❌ No' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Alerts Enabled:</span>
                <span [class]="diagnostics.alertsEnabled ? 'text-green-600' : 'text-red-600'">
                  {{ diagnostics.alertsEnabled ? '✅ Yes' : '❌ No' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Current Status:</span>
                <span [class]="getStatusColor(diagnostics.currentStatus)">
                  {{ getStatusText(diagnostics.currentStatus) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-800 mb-2">Alert Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between" *ngIf="diagnostics.percentageUsed !== undefined">
                <span>Budget Used:</span>
                <span>{{ diagnostics.percentageUsed.toFixed(1) }}%</span>
              </div>
              <div class="flex justify-between" *ngIf="diagnostics.thresholds">
                <span>Warning at:</span>
                <span>{{ diagnostics.thresholds.warning }}%</span>
              </div>
              <div class="flex justify-between" *ngIf="diagnostics.thresholds">
                <span>Critical at:</span>
                <span>{{ diagnostics.thresholds.critical }}%</span>
              </div>
              <div class="flex justify-between">
                <span>Should Send Alert:</span>
                <span [class]="diagnostics.shouldSendAlert ? 'text-orange-600' : 'text-green-600'">
                  {{ diagnostics.shouldSendAlert ? '⚠️ Yes' : '✅ No' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Last Alerts -->
        <div class="bg-blue-50 p-4 rounded-lg" *ngIf="diagnostics.lastAlerts">
          <h3 class="font-semibold text-gray-800 mb-2">📧 Last Alert Emails</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Last Warning Alert:</span>
              <span>{{ diagnostics.lastAlerts.warning ? formatDate(diagnostics.lastAlerts.warning) : 'Never sent' }}</span>
            </div>
            <div class="flex justify-between">
              <span>Last Critical Alert:</span>
              <span>{{ diagnostics.lastAlerts.critical ? formatDate(diagnostics.lastAlerts.critical) : 'Never sent' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Manual Test Button -->
      <div class="space-y-4">
        <button 
          (click)="testBudgetAlert()"
          [disabled]="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
          <svg *ngIf="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Testing...' : '🧪 Test Budget Alert System' }}
        </button>
        
        <div *ngIf="testResult" class="p-4 rounded-lg" [class]="testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <h3 class="font-semibold mb-2" [class]="testResult.success ? 'text-green-800' : 'text-red-800'">
            {{ testResult.success ? '✅ Test Result' : '❌ Test Failed' }}
          </h3>
          <div class="text-sm space-y-1" [class]="testResult.success ? 'text-green-700' : 'text-red-700'">
            <p><strong>Alert Sent:</strong> {{ testResult.result?.alertSent ? 'Yes' : 'No' }}</p>
            <p *ngIf="testResult.result?.reason"><strong>Reason:</strong> {{ testResult.result.reason }}</p>
            <p *ngIf="testResult.result?.alertType"><strong>Alert Type:</strong> {{ testResult.result.alertType }}</p>
            <div *ngIf="testResult.result?.budgetStatus" class="mt-2">
              <p><strong>Budget Status Details:</strong></p>
              <ul class="list-disc list-inside ml-4 space-y-1">
                <li>Budget: \${{ testResult.result.budgetStatus.budget?.toFixed(2) }}</li>
                <li>Spent: \${{ testResult.result.budgetStatus.spent?.toFixed(2) }}</li>
                <li>Percentage Used: {{ testResult.result.budgetStatus.percentageUsed?.toFixed(1) }}%</li>
                <li>Alert Level: {{ testResult.result.budgetStatus.alertLevel }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Troubleshooting Tips -->
      <div class="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 class="font-semibold text-yellow-800 mb-2">💡 Troubleshooting Tips</h3>
        <ul class="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Budget alerts are sent only once per day per threshold</li>
          <li>Make sure "Budget Alerts" is enabled in your profile settings</li>
          <li>Check your spam/junk folder for alert emails</li>
          <li>Alerts are triggered when you add new expense transactions</li>
          <li>The system checks your current month's spending against your budget</li>
        </ul>
      </div>
    </div>
  `
})
export class BudgetAlertDiagnosticsComponent implements OnInit {
  diagnostics: BudgetAlertDiagnostics | null = null;
  testResult: any = null;
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDiagnostics();
  }

  loadDiagnostics() {
    const token = this.authService.getToken();
    this.http.get<BudgetAlertDiagnostics>('http://localhost:3000/api/users/budget/alerts', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.diagnostics = data;
      },
      error: (error) => {
        console.error('Error loading diagnostics:', error);
        this.notificationService.addNotification({
          title: 'Error',
          message: 'Failed to load budget alert diagnostics',
          type: 'error'
        });
      }
    });
  }

  testBudgetAlert() {
    this.isLoading = true;
    this.testResult = null;
    
    const token = this.authService.getToken();
    this.http.post('http://localhost:3000/api/test/budget-alerts', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.testResult = response;
        this.isLoading = false;
        
        if (response.result?.alertSent) {
          this.notificationService.addNotification({
            title: 'Alert Test Complete',
            message: `Budget ${response.result.alertType} alert sent successfully! Check your email.`,
            type: 'success'
          });
        } else {
          this.notificationService.addNotification({
            title: 'Alert Test Complete',
            message: response.result?.reason || 'No alert was sent based on current conditions',
            type: 'info'
          });
        }
        
        // Reload diagnostics after test
        setTimeout(() => this.loadDiagnostics(), 1000);
      },
      error: (error) => {
        console.error('Error testing budget alert:', error);
        this.testResult = {
          success: false,
          error: error.error?.message || error.message || 'Unknown error'
        };
        this.isLoading = false;
        
        this.notificationService.addNotification({
          title: 'Test Failed',
          message: 'Failed to test budget alert system',
          type: 'error'
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'safe':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'safe':
        return '✅ Safe';
      case 'warning':
        return '⚠️ Warning';
      case 'critical':
        return '🚨 Critical';
      case 'no_budget':
        return '❌ No Budget';
      default:
        return '❓ Unknown';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}