import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PwaInstallService } from '../../services/pwa-install.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Install Banner (Mobile) -->
    <div *ngIf="showInstallBanner && isMobileDevice && !isInstalled && !bannerDismissed" 
         class="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 shadow-lg">
      <div class="flex items-center justify-between max-w-sm mx-auto">
        <div class="flex items-center space-x-2">
          <span class="material-icons text-lg">download</span>
          <div>
            <p class="text-sm font-medium">Install Balancio</p>
            <p class="text-xs opacity-90">Add to your home screen for quick access</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            (click)="installApp()"
            class="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors">
            Install
          </button>
          <button 
            (click)="dismissBanner()"
            class="text-white hover:text-gray-200 transition-colors">
            <span class="material-icons text-lg">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Update Available Banner -->
    <div *ngIf="updateAvailable && !updateBannerDismissed" 
         class="fixed top-0 left-0 right-0 bg-green-600 text-white p-3 z-50 shadow-lg">
      <div class="flex items-center justify-between max-w-sm mx-auto">
        <div class="flex items-center space-x-2">
          <span class="material-icons text-lg">system_update</span>
          <div>
            <p class="text-sm font-medium">Update Available</p>
            <p class="text-xs opacity-90">A new version of Balancio is ready</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            (click)="updateApp()"
            class="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors">
            Update
          </button>
          <button 
            (click)="dismissUpdateBanner()"
            class="text-white hover:text-gray-200 transition-colors">
            <span class="material-icons text-lg">close</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Install Button (In-line) -->
    <button *ngIf="showInlineButton && (canInstall || isMobileDevice) && !isInstalled"
            (click)="installApp()"
            [class]="buttonClass"
            [attr.aria-label]="'Install Balancio app'">
      <span class="material-icons mr-2">download</span>
      Install App
      <span *ngIf="!canPromptInstall" class="ml-2 text-xs opacity-75">(Manual)</span>
    </button>

    <!-- Install Instructions Modal -->
    <div *ngIf="showInstructionsModal" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Install Balancio</h3>
          <button (click)="closeInstructionsModal()" 
                  class="text-gray-400 hover:text-gray-600">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="material-icons text-blue-600">smartphone</span>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ deviceInfo.platform }} Installation</h4>
              <p class="text-sm text-gray-600">Follow the steps below to install</p>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-700 leading-relaxed mb-3">
              {{ deviceInfo.instructions }}
            </p>
            <div class="text-xs text-gray-600 space-y-1">
              <p><strong>Alternative methods:</strong></p>
              <p *ngIf="deviceInfo.platform === 'Desktop'">• Look for an install icon in the address bar</p>
              <p *ngIf="deviceInfo.platform === 'Desktop'">• Check browser menu for "Install Balancio" option</p>
              <p *ngIf="deviceInfo.platform !== 'Desktop'">• Use browser's "Add to Home Screen" option</p>
              <p>• Bookmark this page for quick access</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-2">
            <span class="material-icons text-blue-500 text-sm mt-0.5">info</span>
            <p class="text-xs text-gray-600">
              Once installed, you'll be able to access Balancio directly from your home screen without opening a browser.
            </p>
          </div>
        </div>
        
        <div class="flex space-x-3 mt-6">
          <button (click)="closeInstructionsModal()" 
                  class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
            Got it
          </button>
          <button *ngIf="canPromptInstall" 
                  (click)="installApp()" 
                  class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Install Now
          </button>
        </div>
      </div>
    </div>
  `
})
export class PwaInstallComponent implements OnInit, OnDestroy {
  @Input() showInstallBanner = true;
  @Input() showInlineButton = false;
  @Input() buttonClass = 'flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';

  canInstall = false;
  isInstalled = false;
  isMobileDevice = false;
  canPromptInstall = false;
  updateAvailable = false;
  bannerDismissed = false;
  updateBannerDismissed = false;
  showInstructionsModal = false;
  deviceInfo: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private pwaInstallService: PwaInstallService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if banners were previously dismissed
    this.bannerDismissed = localStorage.getItem('pwa-banner-dismissed') === 'true';
    this.updateBannerDismissed = localStorage.getItem('pwa-update-banner-dismissed') === 'true';
    
    // Get device info
    this.deviceInfo = this.pwaInstallService.getDeviceInfo();
    this.isMobileDevice = this.pwaInstallService.isMobile();
    this.canPromptInstall = this.pwaInstallService.canPromptInstall();

    // Subscribe to install availability
    this.pwaInstallService.canInstall$
      .pipe(takeUntil(this.destroy$))
      .subscribe(canInstall => {
        this.canInstall = canInstall || this.isMobileDevice;
        this.canPromptInstall = this.pwaInstallService.canPromptInstall();
      });

    // Subscribe to installation status
    this.pwaInstallService.isInstalled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isInstalled => {
        this.isInstalled = isInstalled;
        if (isInstalled) {
          this.showInstructionsModal = false;
        }
      });
      
    // Subscribe to update availability
    this.pwaInstallService.updateAvailable$
      .pipe(takeUntil(this.destroy$))
      .subscribe(updateAvailable => {
        this.updateAvailable = updateAvailable;
      });
      
    // Always show install option for mobile devices even if prompt is not available
    if (this.isMobileDevice && !this.isInstalled) {
      setTimeout(() => {
        this.canInstall = true;
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async installApp(): Promise<void> {
    if (this.canPromptInstall) {
      const success = await this.pwaInstallService.installPwa();
      if (success) {
        this.notificationService.addNotification({
          title: 'Installation Started',
          message: 'Balancio is being installed to your device',
          type: 'success'
        });
        this.dismissBanner();
        this.closeInstructionsModal();
      } else {
        this.showInstallInstructions();
      }
    } else {
      this.showInstallInstructions();
    }
  }

  async updateApp(): Promise<void> {
    await this.pwaInstallService.updateApp();
    this.dismissUpdateBanner();
  }

  showInstallInstructions(): void {
    this.showInstructionsModal = true;
  }

  closeInstructionsModal(): void {
    this.showInstructionsModal = false;
  }

  dismissBanner(): void {
    this.bannerDismissed = true;
    localStorage.setItem('pwa-banner-dismissed', 'true');
  }

  dismissUpdateBanner(): void {
    this.updateBannerDismissed = true;
    localStorage.setItem('pwa-update-banner-dismissed', 'true');
  }

  resetBannerDismissal(): void {
    this.bannerDismissed = false;
    this.updateBannerDismissed = false;
    localStorage.removeItem('pwa-banner-dismissed');
    localStorage.removeItem('pwa-update-banner-dismissed');
  }
}