# 🏠 Sigalit - Smart Guide Scheduling System

## 🚀 Production Deployment (Railway)

### Quick Deploy to Railway

1. **Connect Repository:**
   ```bash
   # Push to GitHub (if not already)
   git add .
   git commit -m "Production ready v1.0"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select this repository
   - Railway will auto-detect the Node.js project

3. **Add PostgreSQL Database:**
   - In Railway dashboard, click "Add Service"
   - Select "PostgreSQL"
   - Railway will auto-provision and connect the database

4. **Environment Variables:**
   Railway will automatically set:
   - `DATABASE_URL` (PostgreSQL connection)
   - `PORT` (Railway provides)
   
   Optional variables to set:
   - `NODE_ENV=production`
   - `AI_AGENT_ENABLED=true`

### 📊 Features Included

- ✅ **PostgreSQL Database** - Production-ready with AI agent schema
- ✅ **Hebrew RTL Interface** - Full right-to-left language support  
- ✅ **WhatsApp-Style AI Chat** - סיגלית chatbot with Hebrew conversation
- ✅ **Smart Scheduling** - Constraint-based auto-scheduling algorithm
- ✅ **Multi-House Support** - Manage multiple residential facilities
- ✅ **Emergency Swaps** - AI-powered replacement recommendations
- ✅ **Role-Based Access** - Coordinators (רכזים) and Guides (מדריכים)

### 🗃️ Database Setup

The application includes automatic database migration:

1. **Core Tables**: Users, schedules, constraints, tasks
2. **AI Agent Schema**: 9 additional tables for intelligent features
3. **Hebrew Data**: Full support for Hebrew names and content

Migration files:
- `migration/01_postgresql_schema.sql` - Core system
- `migration/02_ai_agent_schema.sql` - AI features

### 🔧 Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Start production server
npm start
```

### 📁 Project Structure

```
backend/
├── app.js                 # Main application (PostgreSQL)
├── package.json           # Dependencies and scripts
├── public/               # Frontend files (HTML/CSS/JS)
├── ai-agent/            # AI recommendation system
├── database/            # PostgreSQL connection
├── migration/           # Database schemas
├── middleware/          # Express middleware
└── legacy/              # Backup of old SQLite files
```

### 🤖 AI Features

The system includes a sophisticated AI agent with:

- **Emergency Swap Recommendations** - Intelligent guide replacements
- **Hebrew Chat Interface** - סיגלית chatbot for user assistance  
- **Learning System** - Improves recommendations over time
- **Context Awareness** - Understands current scheduler state

For advanced LLM integration (ChatGPT/Claude), see `LLM_ENHANCEMENT_PLAN.md`.

### 🌐 Production URLs

After deployment, Railway provides:
- **App URL**: `https://your-app-name.railway.app`
- **Database**: Internal PostgreSQL connection
- **Monitoring**: Railway dashboard with logs and metrics

### 📞 Support

- **CLAUDE.md** - Development guidelines and commands
- **LLM_ENHANCEMENT_PLAN.md** - Future AI enhancements
- **Railway Dashboard** - Logs, metrics, and environment management

---

**Ready for production deployment! 🚀**