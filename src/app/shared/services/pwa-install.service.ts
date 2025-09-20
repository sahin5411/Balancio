import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService implements OnDestroy {
  private promptEvent: BeforeInstallPromptEvent | null = null;
  private canInstallSubject = new BehaviorSubject<boolean>(false);
  private isInstalledSubject = new BehaviorSubject<boolean>(false);
  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new BehaviorSubject<void>(undefined);
  private mediaQuerySubscription: Subscription | null = null;

  canInstall$ = this.canInstallSubject.asObservable();
  isInstalled$ = this.isInstalledSubject.asObservable();
  updateAvailable$ = this.updateAvailableSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initPwaInstall();
  }

  private initPwaInstall(): void {
    // Check if PWA is already installed
    if (this.isStandaloneMode()) {
      this.isInstalledSubject.next(true);
      return;
    }
    
    // Listen for the beforeinstallprompt event
    fromEvent(window, 'beforeinstallprompt')
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: Event) => {
        e.preventDefault();
        this.promptEvent = e as BeforeInstallPromptEvent;
        this.canInstallSubject.next(true);
      });

    // Listen for the appinstalled event
    fromEvent(window, 'appinstalled')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.canInstallSubject.next(false);
        this.isInstalledSubject.next(true);
        this.promptEvent = null;
      });

    // Check if already installed after a short delay to ensure proper detection
    setTimeout(() => {
      this.checkIfInstalled();
    }, 1000);

    // Listen for display mode changes
    if ('matchMedia' in window) {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      this.isInstalledSubject.next(mediaQuery.matches);
      
      // Handle media query changes
      const handleMediaQueryChange = (e: MediaQueryListEvent) => {
        this.ngZone.run(() => {
          this.isInstalledSubject.next(e.matches);
        });
      };
      
      // Add listener (modern approach)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleMediaQueryChange);
      } else {
        // Fallback for older browsers
        (mediaQuery as any).addListener(handleMediaQueryChange);
      }
      
      // Store subscription for cleanup
      this.mediaQuerySubscription = fromEvent(mediaQuery, 'change')
        .pipe(takeUntil(this.destroy$))
        .subscribe((e: any) => {
          this.ngZone.run(() => {
            this.isInstalledSubject.next(e.matches);
          });
        });
    }
    
    // Check for service worker updates
    this.checkForUpdates();
  }

  private isStandaloneMode(): boolean {
    // Check if running in standalone mode (iOS Safari, Chrome PWA, etc.)
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  private checkIfInstalled(): void {
    // Check if running in standalone mode (iOS Safari)
    const isStandalone = this.isStandaloneMode();
    
    // Check if running as PWA on Android
    const isAndroidPwa = window.navigator.userAgent.includes('wv') ||
                        (window.navigator as any).standalone === true;

    // Check if service worker is controlling the page
    const isServiceWorkerControlled = 'serviceWorker' in navigator && 
                                     navigator.serviceWorker.controller !== null;

    const isInstalled = isStandalone || isAndroidPwa || isServiceWorkerControlled;
    
    this.isInstalledSubject.next(isInstalled);
  }

  private checkForUpdates(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(registration => {
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.updateAvailableSubject.next(true);
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('Service Worker error:', error);
        });
    }
  }

  async installPwa(): Promise<boolean> {
    if (!this.promptEvent) {
      // Show manual installation instructions
      this.canInstallSubject.next(true);
      return false;
    }

    try {
      await this.promptEvent.prompt();
      const choiceResult = await this.promptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.canInstallSubject.next(false);
        this.promptEvent = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      // Even if prompt fails, we can still show manual instructions
      this.canInstallSubject.next(true);
      return false;
    }
  }

  async updateApp(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }

  canPromptInstall(): boolean {
    return this.promptEvent !== null;
  }

  getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Tap the menu (⋮) and select "Add to Home screen" or "Install app"';
    } else if (userAgent.includes('firefox')) {
      return 'Tap the menu (⋮) and select "Install" or "Add to Home screen"';
    } else if (userAgent.includes('safari')) {
      return 'Tap the Share button (□↗) and select "Add to Home Screen"';
    } else if (userAgent.includes('edge')) {
      return 'Tap the menu (⋯) and select "Add to phone"';
    } else {
      return 'Look for "Add to Home screen" or "Install" option in your browser menu';
    }
  }

  isPwaSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  getDeviceInfo(): {platform: string, canInstall: boolean, instructions: string} {
    const platform = this.isIOS() ? 'iOS' : this.isAndroid() ? 'Android' : 'Desktop';
    return {
      platform,
      canInstall: this.canPromptInstall() || this.isMobile(),
      instructions: this.getInstallInstructions()
    };
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
    if (this.mediaQuerySubscription) {
      this.mediaQuerySubscription.unsubscribe();
    }
  }
}