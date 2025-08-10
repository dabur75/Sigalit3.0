# 🚀 Sigalit - Fly.io Deployment Guide

## Step-by-Step Deployment Process

### Prerequisites

1. **Install Fly CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux/WSL
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   # Download from https://fly.io/docs/getting-started/installing-flyctl/
   ```

2. **Create Fly.io Account:**
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

---

## 📦 Database Setup

### 1. Create PostgreSQL Cluster

```bash
# Create dedicated PostgreSQL instance
fly postgres create --name sigalit-db --region fra --vm-size shared-cpu-1x

# Note the connection details shown after creation
```

**Important:** Save the connection details that appear - you'll need them for manual connections.

### 2. Database Migration

After the database is created, you'll need to run the migration scripts:

```bash
# Connect to your new PostgreSQL database
fly postgres connect --app sigalit-db

# In the PostgreSQL prompt, run:
\c sigalit_pg

# Copy and paste the contents of:
# - migration/01_postgresql_schema.sql (core tables)
# - migration/02_ai_agent_schema.sql (AI features)
```

---

## 🎯 App Deployment

### 1. Initialize Fly App

```bash
# In the backend directory
cd backend

# Create the app (or use existing name)
fly apps create sigalit-scheduling

# You can also let Fly generate a unique name:
fly apps create --generate-name
```

### 2. Attach PostgreSQL Database

```bash
# Attach the database to your app
fly postgres attach --app sigalit-scheduling sigalit-db

# This automatically sets the DATABASE_URL secret
```

### 3. Configure App Settings

```bash
# Set environment variables
fly secrets set NODE_ENV=production
fly secrets set AI_AGENT_ENABLED=true

# Optional: Set LLM API keys for enhanced chatbot
# fly secrets set CLAUDE_API_KEY=your_claude_key
# fly secrets set OPENAI_API_KEY=your_openai_key
```

### 4. Deploy the Application

```bash
# Deploy (builds Docker image and starts the app)
fly deploy

# Monitor the deployment
fly logs
```

### 5. Scale and Configure

```bash
# Check app status
fly status

# Scale if needed (default is 1 instance)
fly scale count 1

# Set memory (default 512MB should be sufficient)
fly scale memory 512

# Check resource usage
fly status
```

---

## 🔧 Configuration Details

### App Configuration (fly.toml)

The `fly.toml` file is already configured with:
- **Region**: `fra` (Frankfurt - closest to Israel)
- **Memory**: 512MB (sufficient for the app + PostgreSQL client)
- **Port**: 4000 (internal), 80/443 (external)
- **Health checks**: HTTP GET to `/` endpoint
- **Auto-scaling**: 1-1 instances (can scale up if needed)

### Docker Configuration

The `Dockerfile` provides:
- **Multi-stage build** for optimized image size
- **Non-root user** for security
- **Health checks** for monitoring
- **Signal handling** with dumb-init
- **Alpine Linux** for minimal footprint

### Environment Variables

Automatically set by Fly.io:
```env
DATABASE_URL=postgres://...        # Set when attaching database
PORT=4000                          # Internal port
FLY_APP_NAME=sigalit-scheduling   # Your app name
FLY_REGION=fra                    # Deployment region
```

Set manually via secrets:
```env
NODE_ENV=production
AI_AGENT_ENABLED=true
CLAUDE_API_KEY=sk-...             # Optional
OPENAI_API_KEY=sk-...             # Optional
```

---

## 🌐 Post-Deployment

### 1. Verify Deployment

```bash
# Check if app is running
fly status

# Test the URL
curl https://sigalit-scheduling.fly.dev

# Check logs for any issues
fly logs
```

### 2. Database Verification

```bash
# Connect to database to verify tables
fly postgres connect --app sigalit-db

# In PostgreSQL prompt:
\dt  # List all tables
SELECT COUNT(*) FROM users;  # Should work without errors
```

### 3. AI Features Test

```bash
# Test the AI chat endpoint
curl -X GET "https://sigalit-scheduling.fly.dev/api/ai/scheduler-context?house_id=1"

# Should return JSON with suggestions
```

---

## 🔍 Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
fly logs

# Specific time range
fly logs --since 1h

# App metrics
fly status
```

### Database Management

```bash
# Connect to database
fly postgres connect --app sigalit-db

# Check database size and connections
fly postgres status --app sigalit-db

# Create database backup
fly postgres backup create --app sigalit-db
```

### Scaling

```bash
# Scale up during high traffic
fly scale count 2

# Scale memory if needed
fly scale memory 1024

# Scale down
fly scale count 1
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   ```bash
   # Verify DATABASE_URL is set
   fly secrets list
   
   # Re-attach database if needed
   fly postgres attach --app sigalit-scheduling sigalit-db
   ```

2. **App Won't Start:**
   ```bash
   # Check deployment logs
   fly logs
   
   # Verify package.json start script
   cat package.json | grep '"start"'
   ```

3. **Health Check Failures:**
   ```bash
   # Test health endpoint locally first
   curl http://localhost:4000/
   
   # Adjust fly.toml if needed
   ```

### Recovery Commands

```bash
# Restart the app
fly apps restart sigalit-scheduling

# Redeploy from scratch
fly deploy --no-cache

# Reset secrets (if corrupted)
fly secrets unset NODE_ENV
fly secrets set NODE_ENV=production
```

---

## 💰 Cost Estimation

### Fly.io Pricing (as of 2024):

**Application Instance:**
- shared-cpu-1x + 512MB RAM = ~$5-10/month

**PostgreSQL Database:**
- shared-cpu-1x PostgreSQL = ~$15-25/month  

**Total Estimated Cost:** ~$20-35/month

### Cost Optimization:

- Use `fly scale count 0` during development
- Enable auto-scaling for production traffic
- Monitor usage via Fly.io dashboard

---

## 🔐 Security Notes

- Database connection is encrypted (SSL)
- App runs as non-root user in container
- HTTPS is enforced by default
- Secrets are encrypted at rest
- PostgreSQL is isolated in private network

---

## 📞 Support Resources

- **Fly.io Docs**: https://fly.io/docs/
- **PostgreSQL Guide**: https://fly.io/docs/postgres/
- **Troubleshooting**: https://fly.io/docs/getting-started/troubleshooting/
- **Community**: https://community.fly.io/

---

**Ready to deploy! Run `fly deploy` when you're ready to go live! 🚀**