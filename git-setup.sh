#!/bin/bash

# Trader Nidhi Admin Panel - Git Setup Script
# This script initializes the git repository and pushes to GitHub

echo "🚀 Setting up Git repository for Trader Nidhi Admin Panel..."
echo ""

# Initialize git repository
echo "📦 Initializing Git repository..."
git init

# Add all files
echo "📝 Adding all files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Trader Nidhi Admin Panel

- Mobile-first admin panel for license management
- Dark minimal UI theme
- Firebase integration for real-time data
- PWA support with offline functionality
- TypeScript + Next.js 13 App Router
- Bottom navigation for mobile UX
- Secure authentication system"

# Rename branch to main
echo "🌿 Renaming branch to main..."
git branch -M main

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin https://github.com/Rishabhpkashyap/TraderNidhi.git

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Repository setup complete!"
echo "🌐 Your code is now available at: https://github.com/Rishabhpkashyap/TraderNidhi"
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/Rishabhpkashyap/TraderNidhi"
echo "2. Add a description and topics to your repository"
echo "3. Set up GitHub Pages if needed"
echo "4. Configure branch protection rules"
echo ""
