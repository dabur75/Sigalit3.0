# 🏠 Sigalit - Smart Guide Scheduling System

## 🚀 Production Deployment (Fly.io)

### Prerequisites

1. **Install Fly CLI:**
   ```bash
   # macOS
   brew install flyctl
   
   # Or download from https://fly.io/docs/getting-started/installing-flyctl/
   ```

2. **Login to Fly.io:**
   ```bash
   fly auth login
   ```

### Quick Deploy to Fly.io

1. **Initialize Fly App:**
   ```bash
   # In the backend directory
   cd backend
   fly apps create sigalit-scheduling --generate-name
   ```

2. **Create PostgreSQL Database:**
   ```bash
   # Create dedicated PostgreSQL cluster
   fly postgres create --name sigalit-db --region fra
   
   # Attach database to your app
   fly postgres attach --app sigalit-scheduling sigalit-db
   ```

3. **Set Environment Variables:**
   ```bash
   fly secrets set NODE_ENV=production
   fly secrets set AI_AGENT_ENABLED=true
   # DATABASE_URL is automatically set when attaching postgres
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

### Environment Variables

Fly.io will automatically set:
- `DATABASE_URL` (PostgreSQL connection when attached)
- `PORT` (Fly.io provides)

Optional secrets to set:
- `NODE_ENV=production`
- `AI_AGENT_ENABLED=true`
- `CLAUDE_API_KEY=your_key` (for future LLM integration)
- `OPENAI_API_KEY=your_key` (for future LLM integration)

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

# Start server (dev/prod identical for static assets)
npm start
```

### 📁 Project Structure

```
backend/
├── app.js                 # Main application (PostgreSQL)
├── package.json           # Dependencies and scripts
├── public/               # Frontend files (HTML/CSS/JS) - SINGLE SOURCE OF TRUTH
├── ai-agent/            # AI recommendation system
├── database/            # PostgreSQL connection
├── migration/           # Database schemas
├── middleware/          # Express middleware
└── legacy/              # Backup of old SQLite files
```

### 📘 Scheduling Algorithm Rules
- See `../docs/SCHEDULING_RULES.md` for the authoritative specification (manual vs auto, traffic-light, fairness, and weekend rules for Israel).

### 🤖 AI Features

The system includes a sophisticated AI agent with:

- **Emergency Swap Recommendations** - Intelligent guide replacements
- **Hebrew Chat Interface** - סיגלית chatbot for user assistance  
- **Learning System** - Improves recommendations over time
- **Context Awareness** - Understands current scheduler state

For advanced LLM integration (ChatGPT/Claude), see `LLM_ENHANCEMENT_PLAN.md`.

### 🌐 Production URLs

After deployment, Fly.io provides:
- **App URL**: `https://sigalit-scheduling.fly.dev`
- **Database**: Dedicated PostgreSQL cluster
- **Monitoring**: Fly.io dashboard with logs and metrics
- **Regions**: Deployed in Frankfurt (fra) for optimal Israel access

### 📞 Support

- **CLAUDE.md** - Development guidelines and commands
- **LLM_ENHANCEMENT_PLAN.md** - Future AI enhancements
- **Fly.io Dashboard** - Logs, metrics, and app management
- **PostgreSQL Cluster** - Dedicated database monitoring

---

**Ready for production deployment! 🚀**