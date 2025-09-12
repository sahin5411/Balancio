# GitHub Pages Deployment Guide

## Method 1: GitHub Web Interface
1. Build the project: `npm run build:gh-pages`
2. Go to your GitHub repository
3. Create a new branch called `gh-pages`
4. Upload all files from `dist/angular-tailwind-app/` to the `gh-pages` branch
5. Go to Settings → Pages → Set source to `gh-pages` branch

## Method 2: Fix Authentication
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` and `workflow` scopes
3. Use: `git remote set-url origin https://YOUR_TOKEN@github.com/sahin5411/Balancio.git`
4. Run: `npm run deploy:manual`

## Method 3: Use GitHub Actions (Recommended)
1. Push code to main branch
2. Go to repository Settings → Pages
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy