#!/bin/bash

# Build the project
npm run build:gh-pages

# Navigate to the build output directory
cd dist/angular-tailwind-app

# Initialize git and push to gh-pages branch
git init
git add -A
git commit -m 'Deploy to GitHub Pages'
git branch -M gh-pages
git remote add origin git@github.com:sahin5411/Balancio.git
git push -f origin gh-pages