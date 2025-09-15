import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../shared/services/user.service';
import { CurrencyService } from '../shared/services/currency.service';
import { NotificationService } from '../shared/services/notification.service';
import { LoaderComponent } from '../shared/components/loader/loader.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface MonthlyReport {
  month: string;
  year: number;
  monthNumber: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  topCategories: [string, number][];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <app-loader [isLoading]="isLoading"></app-loader>
    <div class="w-full space-y-6 p-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Monthly Reports</h1>
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select 
              [(ngModel)]="selectedYear"
              (change)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Years</option>
              <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select 
              [(ngModel)]="selectedMonth"
              (change)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
              <option value="">All Months</option>
              <option *ngFor="let month of availableMonths" [value]="month.value">{{ month.name }}</option>
            </select>
          </div>
          
          <div class="flex items-end">
            <button 
              *ngIf="selectedYear || selectedMonth"
              (click)="clearFilters()"
              class="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="filteredReports.length > 0">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Income vs Expenses</h3>
          <canvas #incomeExpenseChart width="400" height="200"></canvas>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Monthly Savings Trend</h3>
          <canvas #savingsChart width="400" height="200"></canvas>
        </div>
      </div>

      <!-- Test Budget Alert Button -->
      <div class="bg-orange-50 rounded-lg shadow p-4 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-medium text-orange-800">🧪 Budget Alert Test</h3>
            <p class="text-sm text-orange-600">Test if budget alert emails are working</p>
          </div>
          <button 
            (click)="testBudgetAlert()"
            [disabled]="isTestingAlert"
            class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
            <svg *ngIf="isTestingAlert" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isTestingAlert ? 'Testing...' : 'Test Budget Alert' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Reports Table Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Available Reports</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let report of filteredReports" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ report.month }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  \${{ report.totalIncome.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  \${{ report.totalExpenses.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm" [class.text-green-600]="report.netSavings >= 0" [class.text-red-600]="report.netSavings < 0">
                  \${{ report.netSavings.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ report.transactionCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    (click)="downloadReport(report)"
                    [disabled]="isDownloading(report)"
                    class="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isDownloading(report) ? 'Downloading...' : 'Download' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="filteredReports.length === 0" class="px-6 py-12 text-center">
          <div class="text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
            <p class="mt-1 text-sm text-gray-500">Add some transactions to generate reports.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('incomeExpenseChart') incomeExpenseChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('savingsChart') savingsChart!: ElementRef<HTMLCanvasElement>;

  isLoading = false;
  reports: MonthlyReport[] = [];
  filteredReports: MonthlyReport[] = [];
  userReportFormat: string = 'excel';
  downloadingReports: Set<string> = new Set();
  currencySymbol: string = '₹';
  isTestingAlert = false;
  
  selectedYear = '';
  selectedMonth = '';
  availableYears: number[] = [];
  availableMonths = [
    { value: '1', name: 'January' },
    { value: '2', name: 'February' },
    { value: '3', name: 'March' },
    { value: '4', name: 'April' },
    { value: '5', name: 'May' },
    { value: '6', name: 'June' },
    { value: '7', name: 'July' },
    { value: '8', name: 'August' },
    { value: '9', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];
  
  private incomeExpenseChartInstance?: Chart;
  private savingsChartInstance?: Chart;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService,
    private currencyService: CurrencyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.currencySymbol = this.currencyService.getCurrentCurrency().symbol;
    this.isLoading = true;
    this.loadUserSettings();
    this.loadReports();
  }
  
  ngAfterViewInit() {
    // Charts will be created after reports are loaded
  }

  loadUserSettings() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.userReportFormat = user.settings?.reportFormat || 'excel';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user settings:', error);
        this.isLoading = false;
      }
    });
  }

  loadReports() {
    const token = this.authService.getToken();
    this.http.get<MonthlyReport[]>('https://balancio-backend.vercel.app/api/reports/monthly', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (reports) => {
        this.reports = reports;
        this.generateAvailableYears();
        this.applyFilters();
        setTimeout(() => this.createCharts(), 100);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.isLoading = false;
      }
    });
  }

  downloadReport(report: MonthlyReport) {
    const reportKey = `${report.year}-${report.monthNumber}`;
    
    if (this.downloadingReports.has(reportKey)) {
      return; // Already downloading
    }
    
    this.downloadingReports.add(reportKey);
    
    const token = this.authService.getToken();
    const url = `https://balancio-backend.vercel.app/api/reports/monthly/${report.year}/${report.monthNumber}/download`;
    
    console.log('Downloading report from:', url); // Debug log
    
    this.http.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
      observe: 'response' // Get full response to check headers
    }).subscribe({
      next: (response) => {
        console.log('Download response:', response); // Debug log
        
        const blob = response.body;
        if (!blob) {
          throw new Error('No file content received');
        }
        
        // Check if blob is valid
        if (blob.size === 0) {
          throw new Error('Empty file received');
        }
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Use user's preferred format for filename
        const extension = this.userReportFormat === 'pdf' ? 'pdf' : 'xlsx';
        link.download = `Monthly-Report-${report.month.replace(' ', '-')}.${extension}`;
        
        // Add to DOM temporarily to ensure click works
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
        this.downloadingReports.delete(reportKey);
        
        // Add success notification
        this.notificationService.addNotification({
          title: 'Download Successful',
          message: `Report for ${report.month} has been downloaded successfully`,
          type: 'success'
        });
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        
        // Add user notification for better error handling
        let errorMessage = 'Please try again';
        if (error.status === 404) {
          errorMessage = 'No data available for this month';
        } else if (error.status === 401) {
          errorMessage = 'Please log in again';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please contact support';
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.notificationService.addNotification({
          title: 'Download Failed',
          message: `Failed to download report: ${errorMessage}`,
          type: 'error'
        });
        this.downloadingReports.delete(reportKey);
      },
      complete: () => {
        // Already handled in next/error callbacks
      }
    });
  }
  
  isDownloading(report: MonthlyReport): boolean {
    const reportKey = `${report.year}-${report.monthNumber}`;
    return this.downloadingReports.has(reportKey);
  }
  
  generateAvailableYears() {
    const years = new Set<number>();
    this.reports.forEach(r => years.add(r.year));
    this.availableYears = Array.from(years).sort((a, b) => b - a);
  }
  
  applyFilters() {
    this.filteredReports = this.reports.filter(report => {
      const matchesYear = !this.selectedYear || report.year.toString() === this.selectedYear;
      const matchesMonth = !this.selectedMonth || report.monthNumber.toString() === this.selectedMonth;
      return matchesYear && matchesMonth;
    });
  }
  
  onFilterChange() {
    this.applyFilters();
    setTimeout(() => this.createCharts(), 100);
  }
  
  clearFilters() {
    this.selectedYear = '';
    this.selectedMonth = '';
    this.applyFilters();
    setTimeout(() => this.createCharts(), 100);
  }

  private createCharts() {
    if (this.filteredReports.length === 0) return;
    
    this.createIncomeExpenseChart();
    this.createSavingsChart();
  }
  
  private createIncomeExpenseChart() {
    if (!this.incomeExpenseChart) return;
    
    if (this.incomeExpenseChartInstance) {
      this.incomeExpenseChartInstance.destroy();
    }
    
    const ctx = this.incomeExpenseChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.filteredReports.map(r => r.month).reverse();
    const incomeData = this.filteredReports.map(r => r.totalIncome).reverse();
    const expenseData = this.filteredReports.map(r => r.totalExpenses).reverse();
    
    this.incomeExpenseChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        datasets: {
          bar: {
            barPercentage: 0.3,
            categoryPercentage: 0.6
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...incomeData, ...expenseData) + 500,
            ticks: {
              stepSize: 500,
              callback: (value) => {
                return this.currencySymbol + value;
              }
            }
          }
        }
      }
    });
  }
  
  private createSavingsChart() {
    if (!this.savingsChart) return;
    
    if (this.savingsChartInstance) {
      this.savingsChartInstance.destroy();
    }
    
    const ctx = this.savingsChart.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.filteredReports.map(r => r.month).reverse();
    const savingsData = this.filteredReports.map(r => r.netSavings).reverse();
    
    this.savingsChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Net Savings',
            data: savingsData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              callback: (value) => {
                return this.currencySymbol + value;
              }
            }
          }
        }
      }
    });
  }

  testBudgetAlert() {
    if (this.isTestingAlert) return;
    
    this.isTestingAlert = true;
    const token = this.authService.getToken();
    
    this.http.post('https://balancio-backend.vercel.app/api/users/test-budget-alert', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.notificationService.addNotification({
          title: 'Test Successful',
          message: response.message || 'Budget alert test email sent successfully',
          type: 'success'
        });
        this.isTestingAlert = false;
      },
      error: (error) => {
        console.error('Error testing budget alert:', error);
        this.notificationService.addNotification({
          title: 'Test Failed',
          message: error.error?.message || 'Failed to send test budget alert email',
          type: 'error'
        });
        this.isTestingAlert = false;
      }
    });
  }
}