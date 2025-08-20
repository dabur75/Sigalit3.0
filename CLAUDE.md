# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.



## Project Overview

Sigalit is a Smart Guide Scheduling System for Israeli residential homes (בתי אבות). The system manages scheduling for guides (מדריכים) and coordinators (רכזים) across multiple facilities with Hebrew RTL interface support and AI-powered scheduling assistance.

## Architecture

**Single Frontend Policy**: The active frontend lives in `backend/public/` only. Do not serve or edit from `frontend/` or `frontend_archive/` - these are legacy/backup directories.

**Database**: PostgreSQL with two-phase migration:
- Core system: `backend/migration/01_postgresql_schema.sql`
- AI features: `backend/migration/02_ai_agent_schema.sql`

**Key Components**:
- `backend/app.js` - Main Express server with static file serving
- `backend/database/postgresql.js` - Database connection and utilities
- `backend/ai-agent/` - AI recommendation system for emergency swaps
- `backend/ai-scheduler/` - Claude-powered monthly scheduling (in development)
- `backend/routes/ai-scheduling.js` - AI scheduling API endpoints
- `backend/public/` - All frontend HTML/CSS/JS files

## Development Commands

```bash
# Install dependencies
npm install

# Start server (same for dev/prod - serves static files)
npm start
# OR
npm run dev

# No test framework currently configured
npm test  # Will show error message

# Build (no-op for production - static files included)
npm run build
```

## Israeli Localization Settings

- **Weekend**: Friday-Saturday (not Sunday)
- **Date Format**: dd-mm-yyyy (Israeli format)
- **Language**: Hebrew RTL interface with English responses preferred
- **Timezone**: Local midnight handling for Israeli calendar

## Scheduling Rules

The system implements complex scheduling logic with these key constraints:

**Weekend Logic**:
- `SCHEDULING_WEEKEND=Fri-Sat`
- `SCHEDULING_WEEKDAYS=Sun-Thu`
- `SCHEDULING_CLOSED_WEEKEND=Friday:Standby, Saturday:Standby+Motzash`

**Core Rules**:
- No back-to-back days for guides (except closed weekend Fri→Sat pairing)
- Manual constraints override auto-scheduling
- Traffic light system for scheduling conflicts
- Fair workload distribution across guides
- Weekend type enforcement per house

## AI Features

**Current AI Agent** (`backend/ai-agent/`):
- Emergency swap recommendations
- Hebrew chat interface (סיגלית chatbot)
- Learning system for preference tracking
- Context-aware recommendations

**New AI Scheduler** (`backend/ai-scheduler/` - in development):
- Claude 3 Haiku integration for monthly proposal generation
- Interactive chat refinement with Hebrew explanations
- Validator enforces all MUST rules
- Session-based workflow with draft approval
- Token usage tracking and cost caps

## Environment Variables

**Development** (create `backend/.env`):
```
ANTHROPIC_API_KEY=your_key_here
AI_PRICE_INPUT_PER_MTOK=0.15
AI_PRICE_OUTPUT_PER_MTOK=0.60
AI_SOFT_CAP_USD=2
AI_HARD_CAP_USD=4
```

**Production** (Fly.io secrets):
```bash
fly secrets set ANTHROPIC_API_KEY=your_key_here
fly secrets set NODE_ENV=production
fly secrets set AI_AGENT_ENABLED=true
```

## Development Guidelines

**From .cursorrules**:
- Use Israeli weekend logic (Fri/Sat) in all date calculations
- Display dates in dd-mm-yyyy format
- Conduct security reviews for input handling and authentication
- Consider operational concerns (hosting, monitoring, maintenance)
- Provide Hebrew explanations for scheduling decisions
- Use existing patterns and conventions from the codebase

**Code Style**:
- Follow existing Express.js patterns in `app.js`
- Use PostgreSQL connection from `database/postgresql.js`
- Hebrew text should be properly encoded and RTL-compatible
- Maintain separation between frontend (public/) and backend logic

## Database Schema

**Core Tables**: users, houses, schedules, constraints, tasks, weekend_types
**AI Tables**: ai_sessions, ai_chat_messages, ai_usage, plus 6 additional AI agent tables

Access via the `pool` object from `backend/database/postgresql.js`.

## Deployment

**Local Development**: `http://localhost:4000`

**Production** (Fly.io):
- App: deployed to Frankfurt region for optimal Israel access
- Database: Dedicated PostgreSQL cluster
- See `backend/README.md` and `backend/FLY_DEPLOYMENT.md` for deployment instructions

## Testing and Quality

- Run lint/typecheck commands if available in the codebase
- Validate all scheduling constraints before persisting
- Test Hebrew text rendering and RTL layout
- Verify Israeli calendar logic (weekend handling)
- Check AI agent responses for accuracy and Hebrew quality

## Common Tasks

- **Add new scheduling constraint**: Update validator in `backend/ai-scheduler/Validator.js`
- **Modify frontend**: Edit files in `backend/public/` only
- **Add AI features**: Extend `backend/ai-agent/` or `backend/ai-scheduler/`
- **Database changes**: Create new migration files in `backend/migration/`
- **Hebrew text**: Ensure proper encoding and RTL display support