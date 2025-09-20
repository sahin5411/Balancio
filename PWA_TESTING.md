# PWA Testing Guide

This document provides instructions for testing the Progressive Web App (PWA) functionality of the Balancio application.

## Prerequisites

1. Ensure the application is built in production mode:
   ```bash
   npm run build
   ```

2. Serve the application using a static server:
   ```bash
   npx serve dist/angular-tailwind-app
   ```

## Testing PWA Installation

### Chrome/Edge Desktop
1. Open the application in Chrome or Edge
2. Look for the install icon in the address bar (usually a "+" icon)
3. Click the icon and select "Install Balancio"
4. The app should install and appear in your applications list

### Chrome/Edge Mobile (Android)
1. Open the application in Chrome Mobile
2. Tap the menu button (three dots)
3. Select "Add to Home screen" or "Install app"
4. Follow the prompts to complete installation

### Safari Mobile (iOS)
1. Open the application in Safari
2. Tap the Share button (box with arrow)
3. Select "Add to Home Screen"
4. Follow the prompts to complete installation

### Firefox
1. Open the application in Firefox
2. Tap the menu button (three dots)
3. Select "Install" or "Add to Home screen"
4. Follow the prompts to complete installation

## Testing PWA Features

### Offline Functionality
1. Install the PWA
2. Open the app and navigate to a few pages
3. Go offline (turn off Wi-Fi/mobile data)
4. Navigate within the app - previously loaded pages should still work
5. Try to access new pages - should show offline message

### Background Updates
1. Make changes to the application code
2. Build and deploy a new version
3. Open the installed PWA
4. You should see an update notification
5. Click "Update" to refresh to the latest version

## Debugging PWA Issues

### Check Service Worker Status
1. Open Developer Tools (F12)
2. Go to the "Application" tab
3. Check the "Service Workers" section
4. Ensure a service worker is registered and active

### Check Manifest File
1. Open Developer Tools (F12)
2. Go to the "Application" tab
3. Check the "Manifest" section
4. Ensure all fields are properly filled

### Check Installation Criteria
1. Open Developer Tools (F12)
2. Go to the "Application" tab
3. Check the "Manifest" section
4. Ensure the "Installability" section shows no errors

## Common Issues and Solutions

### Install Prompt Not Showing
1. Ensure the app meets all PWA criteria:
   - Valid manifest file
   - Registered service worker
   - HTTPS connection
   - Proper icons
2. Try triggering the install prompt manually through the browser menu

### Service Worker Not Registering
1. Check console for errors
2. Ensure the service worker file exists at the correct path
3. Verify the service worker registration code in main.ts

### Offline Functionality Not Working
1. Check that assets are properly cached in ngsw-config.json
2. Verify the service worker is activated
3. Check the Cache Storage in Developer Tools