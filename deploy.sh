#!/bin/bash

# Sigalit 3.0 Full-Stack Deployment Script for Fly.io

echo "🚀 Deploying Sigalit 3.0 to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please log in to Fly.io:"
    flyctl auth login
fi

# Create volume for database if it doesn't exist
echo "📦 Creating database volume..."
flyctl volumes create sigalit_data --size 1 --region lhr || echo "Volume already exists"

# Deploy the application
echo "🚀 Deploying application..."
flyctl deploy

echo "✅ Full-stack deployment complete!"
echo "🌐 Your complete application is available at: https://sigalit3.fly.dev"
echo "📱 Frontend pages:"
echo "   - Login: https://sigalit3.fly.dev/login"
echo "   - Dashboard: https://sigalit3.fly.dev/dashboard"
echo "   - Schedule: https://sigalit3.fly.dev/schedule"
echo "   - Reports: https://sigalit3.fly.dev/reports"
