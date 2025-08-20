# Sigalit Scheduler Refactoring - Implementation Plan

## Project Overview
**Goal**: Build a smart, transparent, equitable, and flexible guide scheduling system for Beit Mazal, ensuring compliance with scheduling rules, personal and systemic constraints, with emphasis on equal workload and salary distribution, combining manual and automatic work, and supporting efficient workflow for scheduling coordinators.

**Current Status**: ✅ Phase 3 Completed - Auto-Scheduling System Fully Functional
**Start Date**: [Current Date]
**Estimated Duration**: 7 weeks

---

## Phase Tracking System

### 📋 **Phase 1: Core Infrastructure** 
**Status**: ✅ **COMPLETED** | **Week 1** | **Priority**: HIGH

#### Tasks:
- [x] **Database Schema Design** ✅ **COMPLETED**
  - [x] Enhanced existing SQLite database with new tables
  - [x] Added `is_manual`, `is_locked`, `created_by`, `created_at`, `updated_at` to schedule table
  - [x] Created `drafts`, `guide_availability`, `assignment_types`, `shift_types`, `audit_log` tables
  - [x] Added `weekend_types` table for closed/open Saturday management
  - [x] Enhanced `users` table with `is_active`, `created_at`, `updated_at`
  - [x] Added proper indexes and constraints

- [x] **Backend API Foundation** ✅ **COMPLETED**
  - [x] Enhanced `/api/guides/enhanced` endpoint with comprehensive guide data
  - [x] Implemented `/api/guides/availability/:date` with traffic light logic
  - [x] Created `/api/schedule/manual` for manual assignments with validation
  - [x] Added `/api/weekend-type/:date` for closed/open Saturday management
  - [x] Implemented `/api/schedule/clear-month` for clearing assignments
  - [x] Added proper error handling and validation logic

- [x] **Frontend Integration** ✅ **COMPLETED**
  - [x] Connected `organized_scheduler.html` to all backend APIs
  - [x] Implemented month selection and calendar loading
  - [x] Added real-time guide availability fetching
  - [x] Integrated manual assignment saving and loading
  - [x] Added weekend type management (closed/open Saturday checkboxes)

- [x] **Basic Guide Management** ✅ **COMPLETED**
  - [x] Enhanced `guides.html` with comprehensive guide management
  - [x] Added assignment type management (regular/overlap/on-call)
  - [x] Implemented statistics dropdown with workload tracking
  - [x] Added constraint display and management
  - [x] Enhanced mobile responsiveness

#### Dependencies: None
#### Deliverables: Working calendar with backend data integration
#### Success Criteria: Can select month, view guides, basic CRUD operations work

---

### 📋 **Phase 2: Manual Scheduling System**
**Status**: ✅ **COMPLETED** | **Week 2** | **Priority**: HIGH

#### Tasks:
- [x] **Traffic Light System** ✅ **COMPLETED**
  - [x] Availability calculation engine with constraint checking
  - [x] Green/Yellow/Red status indicators with proper labels (מומלץ/לא מומלץ/חסום)
  - [x] Status explanation tooltips with detailed reasons
  - [x] Real-time availability updates based on current month schedule
  - [x] Weekly scheduling rules integration (2-day gap recommendations)

- [x] **Day Editing Side Panel** ✅ **COMPLETED**
  - [x] Enhanced side panel with guide selection and removal
  - [x] Guide availability display with detailed constraint reasons
  - [x] Manual assignment functionality with validation
  - [x] Assignment removal functionality with confirmation
  - [x] Selected guides display with proper synchronization

- [x] **Override System** ✅ **COMPLETED**
  - [x] Override toggle implementation for blocked guides
  - [x] Blocked guide selection with override confirmation
  - [x] Override reason tracking and display
  - [x] Override audit trail in database

- [x] **Manual Assignment Locking** ✅ **COMPLETED**
  - [x] Manual assignment marking with `is_manual` and `is_locked` flags
  - [x] Lock protection from auto-scheduling
  - [x] Manual assignment indicators in calendar display
  - [x] Unlock functionality for future implementation

- [x] **Weekend Type System** ✅ **COMPLETED**
  - [x] Friday checkboxes for "שבת סגורה" (closed Saturday)
  - [x] Weekend type database storage in `weekend_types` table
  - [x] Assignment validation based on weekend type
  - [x] Proper shift type enforcement (כונן, מוצ״ש, רגיל, חפיפה)
  - [x] Visual indicators for closed weekends

- [x] **Enhanced Constraint Display** ✅ **COMPLETED**
  - [x] Multiple constraint types per guide (vacation, constraint, fixed_constraint, consecutive)
  - [x] Color-coded constraint tags with icons and Hebrew labels
  - [x] Individual constraint details display with proper categorization
  - [x] Support for multiple constraints on same guide with stacked display
  - [x] Weekly rule constraint tags (עבד אתמול, עובד מחר, etc.)

- [x] **Clear All Assignments** ✅ **COMPLETED**
  - [x] Confirmation dialog before clearing with proper Hebrew text
  - [x] Backend endpoint for clearing month assignments
  - [x] Frontend integration with proper error handling
  - [x] Calendar refresh after clearing with success notifications

- [x] **Weekly Scheduling Rules Integration** ✅ **COMPLETED**
  - [x] Traffic light considers weekly scheduling rules
  - [x] 2-day gap rule implementation (red for 1 day, yellow for 2 days)
  - [x] Weekly rule tags display (עבד אתמול, עובד מחר, עבד לפני יומיים, עובד בעוד יומיים)
  - [x] Integration with current month schedule data for accurate calculations

- [x] **Closed Saturday Auto-Assignment** ✅ **COMPLETED**
  - [x] Automatic conan assignment to Saturday when assigned to Friday
  - [x] Special visual styling for conan guide in Saturday cell
  - [x] Different background color for Friday-Saturday closed weekend
  - [x] Auto-registration of conan guide to Saturday (until 17:00)
  - [x] Proper handling of כונן (Friday + Saturday until 17:00) and מוצ״ש (Saturday 17:00-19:00) + רגיל (Saturday 19:00-24:00)
  - [x] Updated validation: Friday requires 1 guide (כונן), Saturday requires 1 additional guide (מוצ״ש)
  - [x] **Conan Preservation Logic**: When adding מוצ״ש guide to Saturday, the conan from Friday is preserved
  - [x] **Conan Removal Logic**: Removing conan from either Friday or Saturday removes it from both days
  - [x] **Backend Logic Enhancement**: Server-side logic to preserve conan when adding מוצ״ש guides

- [x] **UI/UX Enhancements** ✅ **COMPLETED**
  - [x] Fixed Friday column width to match other columns
  - [x] Implemented flexible manual assignment (1 or 2 guides per day)
  - [x] Added stacked error messages display
  - [x] Enhanced traffic light display with proper yellow background and positioning
  - [x] Added flexibility notice in side panel
  - [x] Improved mobile responsiveness

#### Dependencies: Phase 1 completion
#### Deliverables: Fully functional manual scheduling with traffic lights
#### Success Criteria: Can manually assign guides, see availability, use overrides, manage closed/open Saturdays

---

### 📋 **Phase 3: Automatic Scheduling Engine**
**Status**: ✅ **COMPLETED** | **Week 3** | **Priority**: HIGH

#### Tasks:
- [x] **Scheduling Algorithm** ✅ **COMPLETED**
  - [x] Core scheduling logic implementation with workload balancing
  - [x] Constraint validation system (vacations, constraints, fixed constraints)
  - [x] Balance calculation (workload, manual vs auto shifts)
  - [x] Conflict detection and resolution (consecutive days rule)

- [x] **Rule Engine** ✅ **COMPLETED**
  - [x] No consecutive days rule implementation
  - [x] Maximum shifts per month consideration
  - [x] Weekend balance rules (closed/open Saturday)
  - [x] Dynamic coordinator rules integration

- [x] **Dynamic Coordinator Rules** ✅ **COMPLETED**
  - [x] Database schema for coordinator rules (`coordinator_rules` table)
  - [x] Rule types: `no_auto_scheduling`, `no_conan`, `no_together`
  - [x] API endpoints for CRUD operations on coordinator rules
  - [x] Integration with availability checking (manual and auto scheduling)
  - [x] Frontend modal for viewing and managing coordinator rules
  - [x] Visual indicators for coordinator rule constraints

- [x] **Auto-Scheduling Integration** ✅ **COMPLETED**
  - [x] Fill empty days only (respects manual assignments)
  - [x] Respect manual assignments with `is_manual` flag
  - [x] Balance calculation including all assignments
  - [x] Conflict flagging system with detailed logging

- [x] **Optimization Features** ✅ **COMPLETED**
  - [x] Workload balancing algorithm (fewer shifts first)
  - [x] Manual shift priority consideration
  - [x] Weekend distribution optimization
  - [x] Holiday scheduling logic (closed Saturday handling)

- [x] **API Endpoints** ✅ **COMPLETED**
  - [x] `POST /api/schedule/auto-schedule-enhanced/:year/:month` - Run enhanced auto-scheduler
  - [x] `DELETE /api/schedule/remove-auto-scheduled/:year/:month` - Remove auto-scheduled assignments
  - [x] `GET /api/schedule/statistics/:year/:month` - Get scheduling statistics
  - [x] `GET /api/schedule/issues/:year/:month` - Get scheduling conflicts and issues
  - [x] `GET /api/coordinator-rules` - Get all coordinator rules
  - [x] `POST /api/coordinator-rules` - Create new coordinator rule
  - [x] `PUT /api/coordinator-rules/:id` - Update coordinator rule
  - [x] `DELETE /api/coordinator-rules/:id` - Delete coordinator rule

- [x] **Frontend Integration** ✅ **COMPLETED**
  - [x] Auto-scheduling button in toolbar with configuration dialog
  - [x] Remove auto-scheduled assignments button
  - [x] Statistics display with modal
  - [x] Real-time feedback and notifications
  - [x] Calendar refresh after auto-scheduling
  - [x] Coordinator rules management modal
  - [x] Visual constraint tags for coordinator rules

#### Dependencies: Phase 2 completion
#### Deliverables: Complete auto-scheduling system with manual assignment protection
#### Success Criteria: Auto-scheduling works with all rules and constraints, respects manual assignments

---

### 📋 **Phase 4: Draft Management**
**Status**: ✅ **COMPLETED** | **Week 4** | **Priority**: MEDIUM

#### Tasks:
- [x] **Draft System** ✅ **COMPLETED**
  - [x] Draft saving with timestamps
  - [x] Draft loading functionality
  - [x] Draft comparison tools
  - [x] Draft version management

- [x] **Email Distribution** ✅ **COMPLETED**
  - [x] Email template system
  - [x] Personal schedule highlighting
  - [x] Full monthly schedule attachment
  - [x] Email tracking system

- [x] **Approval Workflow** ✅ **COMPLETED**
  - [x] Draft submission process
  - [x] Guide feedback collection
  - [x] Revision management
  - [x] Final approval process

- [x] **Version Control** ✅ **COMPLETED**
  - [x] Draft history tracking
  - [x] Change comparison
  - [x] Rollback functionality
  - [x] Audit trail for all changes

#### Dependencies: Phase 3 completion
#### Deliverables: Complete draft management with email distribution
#### Success Criteria: Can save/load drafts, send emails, track feedback

---

### 📋 **Phase 5: Reporting & Statistics**
**Status**: 🔄 **PARTIALLY COMPLETED** | **Week 5** | **Priority**: MEDIUM

#### Tasks:
- [x] **Individual Guide Statistics** ✅ **COMPLETED**
  - [x] Personal dashboard for each guide
  - [x] Shift count, hours, salary factor tracking
  - [x] Weekend assignments tracking
  - [x] Workload balance indicators

- [x] **Monthly Reports** ✅ **COMPLETED**
  - [x] Comprehensive monthly summary
  - [x] Balance indicators and alerts
  - [x] Conflict and gap reporting
  - [x] Statistical analysis

- [x] **Export Functionality** ✅ **COMPLETED**
  - [x] Excel export with formatting (CSV format)
  - [x] PDF generation for printing (print functionality)
  - [x] Personal schedule exports
  - [x] Custom report generation

- [x] **Alert System** ✅ **COMPLETED**
  - [x] Imbalance notifications
  - [x] Conflict alerts
  - [x] Missing assignments flags
  - [x] Rule violation warnings

#### Dependencies: Phase 4 completion
#### Deliverables: Comprehensive reporting and export system
#### Success Criteria: Can generate reports, export data, track statistics

---

### 📋 **Phase 6: Constraint Management**
**Status**: 🔄 **PARTIALLY COMPLETED** | **Week 6** | **Priority**: MEDIUM

#### Tasks:
- [x] **Constraint Interface** ✅ **COMPLETED**
  - [x] Constraint creation form
  - [x] Constraint editing interface
  - [x] Constraint type management
  - [x] Constraint validation

- [x] **Dynamic Rule Engine** ✅ **COMPLETED**
  - [x] Coordinator rule creation
  - [x] Rule activation/deactivation
  - [x] Rule priority management
  - [x] Rule conflict resolution

- [x] **Override Management** ✅ **COMPLETED**
  - [x] Override approval system
  - [x] Override reason tracking
  - [x] Override audit trail
  - [x] Override notification system

- [ ] **Audit System**
  - [ ] Change tracking for all modifications
  - [ ] User action logging
  - [ ] System event logging
  - [ ] Historical data preservation

#### Dependencies: Phase 5 completion
#### Deliverables: Complete constraint and rule management system
#### Success Criteria: Can manage all constraints, rules, and overrides

---

### 📋 **Phase 7: Final Approval & Production**
**Status**: ⏳ **PENDING** | **Week 7** | **Priority**: HIGH

#### Tasks:
- [ ] **Final Approval Workflow**
  - [ ] Final approval process
  - [ ] Production schedule creation
  - [ ] Schedule locking mechanism
  - [ ] Approval audit trail

- [ ] **Production Management**
  - [ ] Production schedule module
  - [ ] Change management for approved schedules
  - [ ] Emergency change procedures
  - [ ] Production schedule monitoring

- [ ] **Historical Data**
  - [ ] Approved schedule archiving
  - [ ] Historical data preservation
  - [ ] Long-term statistics
  - [ ] Performance tracking

- [ ] **System Integration**
  - [ ] Integration with existing systems
  - [ ] Data migration procedures
  - [ ] User training materials
  - [ ] System documentation

#### Dependencies: Phase 6 completion
#### Deliverables: Production-ready scheduling system
#### Success Criteria: Complete system ready for production use

---

## 📊 **Progress Tracking**

### Overall Progress: 85.7% Complete (6/7 phases)
- **Phase 1**: 100% (4/4 tasks complete) ✅
- **Phase 2**: 100% (9/9 tasks complete) ✅
- **Phase 3**: 100% (7/7 tasks complete) ✅
- **Phase 4**: 100% (4/4 tasks complete) ✅
- **Phase 5**: 100% (4/4 tasks complete) ✅
- **Phase 6**: 75% (3/4 tasks complete) 🔄
- **Phase 7**: 0% (0/4 tasks complete) ⏳

### Current Focus: Phase 6 - Constraint Management (Audit System)
**Next Task**: Complete Audit System Implementation

---

## 🚨 **Risk Management**

### High Risk Items:
- [ ] Email distribution system
- [ ] Performance with large datasets
- [ ] User adoption and training

### Mitigation Strategies:
- [ ] Incremental development and testing
- [ ] Early user feedback integration
- [ ] Performance testing at each phase
- [ ] Comprehensive documentation

---

## 📝 **Notes & Decisions**

### Technical Decisions:
- **Database**: SQLite for development, PostgreSQL for production
- **Frontend**: Maintain existing organized_scheduler.html framework
- **Backend**: Node.js/Express with RESTful APIs
- **Email**: Template-based system with personal highlighting

### Architecture Decisions:
- **Manual assignments are "locked"** from auto-scheduling
- **Traffic light system** for guide availability with Hebrew labels
- **Draft system** with version control
- **Override system** for rule exceptions
- **Closed Saturday system** with manual conan assignment
- **Flexible manual assignment** allowing 1 or 2 guides per day
- **Coordinator rules system** for both manual and auto scheduling constraints
- **Auto-scheduling algorithm** with workload balancing within current month only

### Recent Fixes & Improvements:
- **Auto-Scheduling Algorithm**: Implemented complete auto-scheduling with workload balancing
- **Consecutive Days Rule**: Fixed logic to properly calculate last shift dates and avoid false blocks
- **Workload Tracking**: Simplified to focus on current month balancing only
- **Constraint Integration**: Full integration of personal, fixed, vacation, and coordinator rules
- **Manual Assignment Protection**: Auto-scheduling respects manual assignments with `is_manual` flag
- **Remove Auto-Scheduled**: Added functionality to remove only auto-scheduled assignments
- **Configuration Dialog**: Enhanced auto-scheduling with user-configurable parameters
- **Database Schema**: Complete schema updates for auto-scheduling support

---

## 🎯 **Success Metrics**

### Phase 1 Success: ✅ ACHIEVED
- [x] Can select month and view calendar
- [x] Basic CRUD operations work
- [x] Guide data loads correctly
- [x] No critical bugs

### Phase 2 Success: ✅ ACHIEVED
- [x] Manual scheduling with traffic lights works
- [x] Override system functional
- [x] Weekend type management working
- [x] Constraint display and management complete
- [x] Closed Saturday auto-assignment working
- [x] All UI/UX enhancements implemented

### Phase 3 Success: ✅ ACHIEVED
- [x] Auto-scheduling algorithm working with workload balancing
- [x] All scheduling rules implemented and respected
- [x] Manual assignments protected from auto-scheduling
- [x] Statistics and reporting system functional
- [x] Conflict detection and logging working
- [x] Frontend integration complete
- [x] Dynamic coordinator rules system implemented
- [x] Coordinator rules management interface functional

### Phase 4 Success: ✅ ACHIEVED
- [x] Draft system with version control working
- [x] Email distribution system functional
- [x] Approval workflow with feedback collection
- [x] Version control and audit trail complete

### Phase 5 Success: ✅ ACHIEVED
- [x] Individual guide statistics dashboard functional
- [x] Monthly reports with comprehensive analysis
- [x] Export functionality (Excel/CSV and print) working
- [x] Alert system for imbalances and conflicts operational

### Phase 6 Success: 🔄 PARTIALLY ACHIEVED
- [x] Constraint interface with creation and editing forms
- [x] Dynamic rule engine with coordinator rules
- [x] Override management system functional
- [ ] Audit system for change tracking (pending)

### Overall Success:
- [x] Manual scheduling system complete
- [x] All scheduling rules implemented
- [x] Automatic scheduling working
- [x] Draft management functional
- [x] Email distribution works
- [x] Reporting system complete
- [ ] Production approval workflow ready

---

**Last Updated**: January 2025
**Next Review**: Weekly
**Project Manager**: Development Team 