#!/bin/bash

# Script to sync frontend files to backend/public directory
# This ensures backend/public always has the latest frontend code

echo "🔄 Syncing frontend files to backend/public..."

# Copy all frontend files to backend/public
cp -r frontend/* backend/public/

# Remove unnecessary files from backend/public
cd backend/public
rm -f package.json package-lock.json Procfile *.code-workspace *.md .DS_Store

echo "✅ Frontend files synced to backend/public"
echo "🌐 Your app is now running on http://localhost:4000"
echo "📁 All frontend code is now in backend/public/"
echo ""
echo "💡 To make changes:"
echo "   1. Edit files in frontend/ directory"
echo "   2. Run this script: ./scripts/sync-to-backend.sh"
echo "   3. Restart backend server if needed: cd backend && npm start"
