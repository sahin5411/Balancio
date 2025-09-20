import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), 
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
}).catch(err => console.error(err));

// Additional service worker debugging
if ('serviceWorker' in navigator && !isDevMode()) {
  navigator.serviceWorker.ready.then(registration => {
    console.log('Service Worker ready with scope:', registration.scope);
    
    // Check for updates
    registration.update();
    
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('Service Worker state changed:', newWorker.state);
        });
      }
    });
  }).catch(error => {
    console.error('Service Worker registration failed:', error);
  });
  
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('Service Worker message:', event.data);
  });
  
  // Listen for controlling service worker changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed');
    // Optionally reload the page to activate the new service worker
    // window.location.reload();
  });
}