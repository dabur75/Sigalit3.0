# Sigalit - Scheduling Management System

A comprehensive scheduling and management system for guide coordination and activity planning.

## 🏗️ Project Structure

```
Sigalitpro/
├── 📁 backend/          # Node.js API server
│   ├── app.js          # Main server file (4,767 lines)
│   ├── package.json    # Backend dependencies
│   ├── sigalit.db      # SQLite database
│   └── middleware/     # Custom middleware
├── 📁 frontend/        # Web application
│   ├── *.html          # All application pages
│   ├── package.json    # Frontend dependencies
│   └── sigalitlogo.png # Application logo
└── 📁 db/              # Database backups
    └── *.db            # Historical database backups
```

## ✨ Features

### **Backend (Node.js API)**
- 🚀 **Express.js server** with comprehensive API endpoints
- 🗄️ **SQLite database** with full data persistence
- 📊 **Scheduling algorithms** for optimal guide assignment
- 🔧 **Auto-scheduling** with constraint management
- 📈 **Statistics and reporting** with detailed analytics
- 🔐 **User authentication** and role-based access
- 📋 **Workflow management** for schedule approval process

### **Frontend (Web Application)**
- 🎨 **Modern UI** with responsive design
- 📱 **Mobile-friendly** interface
- 🔐 **Login system** with role-based access
- 📊 **Dashboard** with key metrics and overview
- 📅 **Schedule management** with drag-and-drop interface
- 👥 **Guide management** with detailed profiles
- 📋 **Task management** and assignment
- 🚫 **Constraint management** for availability
- 📈 **Reports and analytics** with visual charts
- 📚 **Guides and documentation**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sigalitpro
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server (Port 4000)**
   ```bash
   cd backend
   node app.js
   ```
   The API will be available at: `http://localhost:4000`

2. **Start the frontend server (Port 8080)**
   ```bash
   cd frontend
   npm run dev
   ```
   The web application will be available at: `http://localhost:8080`

## 📋 Available Pages

- **Login:** `http://localhost:8080/login.html`
- **Dashboard:** `http://localhost:8080/dashboard.html`
- **Schedule:** `http://localhost:8080/schedule.html`
- **Scheduler:** `http://localhost:8080/scheduler.html`
- **Reports:** `http://localhost:8080/reports.html`
- **Guides:** `http://localhost:8080/guides.html`
- **Tasks:** `http://localhost:8080/tasks.html`
- **Constraints:** `http://localhost:8080/constraints.html`
- **Guides Documentation:** `http://localhost:8080/guides.html`

## 🔌 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `GET /api/guides` - Get all guides
- `POST /api/guides` - Create new guide
- `GET /api/constraints` - Get constraints
- `POST /api/constraints` - Create constraint

### Scheduling Endpoints
- `GET /api/schedule/:year/:month` - Get monthly schedule
- `POST /api/schedule/auto-schedule/:year/:month` - Auto-schedule
- `GET /api/schedule/statistics/:year/:month` - Schedule statistics
- `POST /api/schedule/manual` - Manual assignment

### Workflow Endpoints
- `GET /api/workflow/status/:month` - Workflow status
- `POST /api/workflow/create-draft/:month` - Create draft
- `POST /api/workflow/send-to-guides/:month/:version` - Send to guides
- `POST /api/workflow/finalize/:month` - Finalize schedule

### Reports Endpoints
- `GET /api/reports/summary` - Summary report
- `GET /api/reports/hours/:year/:month` - Hours report
- `GET /api/schedule/enhanced-statistics/:year/:month` - Enhanced statistics

## 🗄️ Database Schema

The application uses SQLite with the following main tables:
- `users` - Guide and coordinator information
- `schedule` - Daily schedule assignments
- `constraints` - Guide availability constraints
- `fixed_constraints` - Recurring constraints
- `vacations` - Vacation requests
- `conversations` - Communication system
- `tasks` - Task management
- `referrals` - Doctor referrals

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=4000
DB_PATH=./sigalit.db
```

### Database
The application automatically creates and manages the SQLite database. The database file is located at `backend/sigalit.db`.

## 📊 Default Users

The system comes with pre-configured users:
- **Coordinators:** Sigal, Dvir
- **Guides:** Eldad, Tom, Shaked, Ofri, Amit, Yiftach, Refael, Lior

## 🛠️ Development

### Backend Development
- Main file: `backend/app.js`
- Database: SQLite with better-sqlite3
- API: RESTful endpoints with JSON responses

### Frontend Development
- Static HTML/CSS/JavaScript
- No build process required
- Served via http-server

### Adding New Features
1. Backend: Add endpoints to `app.js`
2. Frontend: Create new HTML pages
3. Database: Add tables as needed

## 📝 License

This project is proprietary software for internal use.

## 🤝 Support

For technical support or questions about the system, contact the development team.

---

**Last Updated:** August 7, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
