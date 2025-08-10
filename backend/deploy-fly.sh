#!/bin/bash
# Sigalit - Fly.io Quick Deploy Script

echo "🚀 Sigalit Fly.io Deployment Script"
echo "=================================="

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   brew install flyctl"
    echo "   or visit: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "🔐 Please login to Fly.io first:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Fly CLI ready"

# Step 1: Create or check app
echo ""
echo "📱 Step 1: Checking app status..."
APP_NAME="sigalit-scheduling"

if fly apps list | grep -q "$APP_NAME"; then
    echo "✅ App '$APP_NAME' already exists"
else
    echo "🆕 Creating new app..."
    fly apps create $APP_NAME --generate-name
fi

# Step 2: Check database
echo ""
echo "🗄️  Step 2: Checking database..."
DB_NAME="sigalit-db"

if fly apps list | grep -q "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "🆕 Creating PostgreSQL database..."
    echo "⚠️  Please save the connection details that will be shown!"
    fly postgres create --name $DB_NAME --region fra --vm-size shared-cpu-1x
    
    echo ""
    echo "📎 Attaching database to app..."
    fly postgres attach --app $APP_NAME $DB_NAME
fi

# Step 3: Set secrets
echo ""
echo "🔐 Step 3: Setting environment variables..."
fly secrets set NODE_ENV=production --app $APP_NAME
fly secrets set AI_AGENT_ENABLED=true --app $APP_NAME

echo "✅ Basic secrets configured"

# Step 4: Deploy
echo ""
echo "🚀 Step 4: Deploying application..."
echo "This will build the Docker image and deploy..."

read -p "Ready to deploy? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    fly deploy --app $APP_NAME
    
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run database migration:"
    echo "   fly postgres connect --app $DB_NAME"
    echo "   Then run the SQL files from migration/ directory"
    echo ""
    echo "2. Your app is available at:"
    echo "   https://$APP_NAME.fly.dev"
    echo ""
    echo "3. Check status:"
    echo "   fly status --app $APP_NAME"
    echo ""
    echo "4. View logs:"
    echo "   fly logs --app $APP_NAME"
    
else
    echo "❌ Deployment cancelled"
fi

echo ""
echo "📚 For detailed instructions, see FLY_DEPLOYMENT.md"