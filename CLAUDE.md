# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands

**Backend:**
```bash
cd backend
npm install     # Install dependencies
node app.js     # Start backend server (port 4000)
npm run dev     # Same as above
```

**Frontend:**
```bash
cd frontend
npm install     # Install dependencies
npm run dev     # Start frontend dev server (port 8080)
```

**Database:**
```bash
# Main database file: backend/sigalit.db (SQLite)
# Schema file: schema.sql
# PostgreSQL migration: backend/migration/01_postgresql_schema.sql
```

**Testing:**
```bash
# No formal test suite - test files available:
# backend/test_phase2_api.js
# backend/test_postgresql_api.js
# backend/test_aug5.js
```

**Deployment:**
```bash
docker build -t sigalit .
docker run -p 4000:4000 sigalit
```

## Architecture Overview

### Stack
- **Backend:** Node.js + Express.js (single file: app.js ~4,767 lines)
- **Database:** SQLite (primary) with PostgreSQL migration support
- **Frontend:** Static HTML/CSS/JavaScript (no build process)
- **Deployment:** Docker with multi-stage build

### Database Architecture
The system uses **SQLite** with a comprehensive schema including:
- **Core entities:** users, schedule, constraints, tasks
- **Multi-house support:** houses table with house_id references
- **Workflow management:** drafts, workflow_status, official_schedules
- **Audit trail:** audit_log, schedule_history
- **Advanced features:** coordinator_rules, guide_availability

Key relationships:
- Users belong to houses and have accessible_houses (JSON array)
- Schedule entries reference guides (guide1_id, guide2_id) and houses
- Constraints and tasks are house-specific
- Workflow system tracks draft versions and finalization

### Application Architecture
**Monolithic Express server** serving both API and static files:
- Single main file: `backend/app.js` handles all API endpoints
- Frontend served as static files from `backend/public/`
- Database connection: `better-sqlite3` with single database file
- CORS enabled for frontend-backend communication

### Key Features
- **Auto-scheduling algorithm:** Constraint-based guide assignment
- **Multi-house management:** Support for multiple residential facilities
- **Workflow system:** Draft creation, guide notification, finalization
- **Hebrew language support:** UI and data in Hebrew
- **Role-based access:** מדריך (Guide) vs רכז (Coordinator)
- **Complex constraints:** Fixed schedules, vacations, manual assignments

## File Structure

### Backend (backend/)
- `app.js` - Main server file with all API endpoints
- `sigalit.db` - SQLite database file
- `public/` - Frontend files served as static content
- `migration/` - PostgreSQL migration scripts
- `scripts/backup.js` - Database backup utility

### Frontend (frontend/ and backend/public/)
- HTML pages: login, dashboard, schedule, scheduler, reports, guides, tasks, constraints
- `header-functions.js` - Shared JavaScript utilities
- No build process - served directly as static files

### Database Migration
- Currently migrating from SQLite to PostgreSQL
- Migration files in `backend/migration/01_postgresql_schema.sql`
- Both `app.js` and `app_postgresql.js` versions exist

## Development Workflow

### Adding New Features
1. **API endpoints:** Add to `backend/app.js`
2. **Database changes:** Update `schema.sql` and create migration
3. **Frontend:** Create/modify HTML files in `backend/public/`
4. **Testing:** Use existing test files as templates

### Database Operations
- Direct SQLite file access: `backend/sigalit.db`
- Schema reference: `schema.sql` (definitive structure)
- Backup scripts: `backend/scripts/backup.js`

### Deployment Notes
- Production uses Docker with Node.js 20
- Multi-stage build optimizes for production
- Frontend copied to `backend/public/` in container
- Database persisted in `/app/data/` volume

## Important Constraints

### Hebrew Language
- All UI text in Hebrew (RTL)
- Database contains Hebrew data
- User roles: מדריך, רכז

### Business Logic
- **Guides (מדריכים):** Can be assigned to shifts
- **Coordinators (רכזים):** Manage schedules and approve workflows
- **Multi-house:** System supports multiple residential facilities
- **Scheduling:** Complex constraint-based auto-assignment algorithm

### Database Considerations
- SQLite primary with PostgreSQL migration in progress
- Extensive use of foreign keys and constraints
- JSON columns for flexible data (accessible_houses, roles_required)
- Audit logging for all major changes