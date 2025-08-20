# Enhanced Manual Scheduler - Phase 1 Research Findings

## 📋 Executive Summary

Phase 1 research has been completed successfully. All existing systems, APIs, and database schemas have been analyzed to understand the foundation for building the enhanced drag-and-drop manual scheduler. The findings show that the current codebase provides excellent groundwork with comprehensive constraint systems, salary calculations, and calendar rendering patterns already in place.

---

## 🔍 1.1 Manual Scheduling API Analysis

### Current API Endpoint
**`POST /api/schedule/manual`** - Located in `/backend/app.js`

### Request Parameters
```json
{
  "date": "2025-09-03",
  "guide1_id": 5,
  "guide2_id": null,
  "type": "רגיל",
  "created_by": "user_id"
}
```

### Role Derivation Logic
The API automatically derives guide roles from the assignment type:
- **`כונן`** → `guide1_role = 'כונן'`
- **`רגיל`** → `guide1_role = 'רגיל'` 
- **`חפיפה`** → `guide1_role = 'רגיל'`, `guide2_role = 'חפיפה'`
- **`מוצ״ש`** → `guide1_role = 'מוצ״ש'`

### Advanced Features
- **Smart Upsert**: Preserves existing assignments when adding new ones
- **Saturday Logic**: Special handling for closed weekend כונן continuity  
- **Weekend Mirroring**: Friday כונן automatically extends to Saturday
- **Israeli Calendar**: Hebrew weekdays, proper date normalization

### Database Integration
- Uses PostgreSQL `schedule` table with `is_manual = true`
- Includes `house_id`, timestamps, and user tracking
- Handles concurrent assignments gracefully

---

## 🚫 1.2 Constraint System Study

### Three-Layer Constraint Architecture

#### 1. Regular Constraints (`constraints` table)
```sql
CREATE TABLE constraints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    details TEXT,
    house_id VARCHAR(50) NOT NULL DEFAULT 'dror',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **Purpose**: Specific date constraints (e.g., "עמית can't work on 2025-09-03")
- **Scope**: Single-day constraints
- **Integration**: Used by advanced scheduler constraint checking

#### 2. Fixed Constraints (`fixed_constraints` table)
```sql
CREATE TABLE fixed_constraints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
    hour_start TIME,
    hour_end TIME,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- **Purpose**: Weekly recurring constraints (e.g., "יפתח can't work Fridays")
- **Scope**: Day-of-week constraints (0=Sunday, 6=Saturday)
- **Flexibility**: Optional time ranges for partial day constraints

#### 3. Vacation Constraints (`vacations` table)
```sql
CREATE TABLE vacations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    note TEXT,
    status VARCHAR(50),
    response_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (date_end >= date_start)
);
```
- **Purpose**: Date range constraints with approval workflow
- **Scope**: Multi-day constraints with status tracking
- **Business Logic**: Only `status = 'approved'` vacations block scheduling

### Constraint Integration Patterns
- **Context Builder**: `/backend/services/context-builder.js` loads all constraint types
- **Scheduler Integration**: Advanced scheduler respects all constraint layers
- **Fallback Logic**: House-based filtering with automatic fallbacks

---

## 💰 1.3 Salary Factor Calculations

### Correct Multipliers (from reports.html)
```javascript
// Salary factor calculation with official multipliers:
const salaryFactor = 
  (regularHours * 1.0) +     // Regular: ×1.0
  (nightHours * 1.5) +       // Night: ×1.5  
  (shabbatHours * 2.0) +     // Shabbat: ×2.0
  (conanHours * 0.3) +       // On-call: ×0.3
  (conanShabbatHours * 0.6) + // On-call Shabbat: ×0.6
  (motzashHours * 1.0);      // Motzash: ×1.0
```

### Hour Calculation Logic
Complex logic in `calculateHoursForShiftPG()` handles:
- **Friday כונן for closed Saturday**: 10 regular + 22 כונן שבת hours
- **Saturday מוצ״ש for closed weekend**: 2 שבת + 5 regular + 8 night hours  
- **Regular weekday shifts**: 16 regular + 8 night hours
- **Weekend shifts**: Full שבת hour calculations

### Display Format
- **Guide cards**: Show total salary factor hours (not raw hours)
- **Reports**: Detailed breakdown by hour type
- **Real-time updates**: Recalculated after each assignment

---

## 📊 1.4 Guide Statistics Queries

### Main Statistics Endpoint
**`GET /api/schedule/enhanced-statistics/:year/:month`** - Comprehensive stats

### Core Function: `calculateGuideStatisticsPG()`
```javascript
function calculateGuideStatisticsPG(schedule, guideId, year, month, weekendTypes) {
  return {
    total_shifts: number,
    manual_shifts: number,
    auto_shifts: number,
    regular_shifts: number,
    overlap_shifts: number,
    conan_shifts: number,
    motzash_shifts: number,
    weekend_shifts: number,
    regular_hours: number,
    night_hours: number,
    shabbat_hours: number,
    conan_hours: number,
    conan_shabbat_hours: number,
    motzash_hours: number,
    total_hours: number,
    salary_factor: number
  }
}
```

### Performance Optimizations
- **Single query**: Efficient PostgreSQL joins
- **Indexed lookups**: Proper indexing on date ranges and user relations
- **Cached calculations**: Weekend types loaded once per request
- **Batch processing**: All guides calculated in single database round-trip

### Data Structure for Enhanced Manual Scheduler
- **Guide cards**: Use `total_shifts` for counter, `salary_factor` for hours display
- **Real-time updates**: Leverage existing calculation functions
- **Fairness indicators**: Use averages and recommendations from existing logic

---

## 📅 1.5 Calendar Rendering Patterns

### Existing Grid Structure
From `constraints.html` and `schedule.html`:
```css
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}
```

### Day Cell Architecture
```html
<div class="calendar-day">
    <div class="day-number">15</div>
    <div class="day-content">
        <!-- Assignment content -->
    </div>
</div>
```

### Established CSS Classes
- **`.calendar-grid`** - Main 7-column container
- **`.calendar-day`** - Individual day cells
- **`.calendar-weekday`** - Header row for day names
- **`.day-header`** - Purple headers with Hebrew day names
- **`.guide-item`** - Individual guide assignments
- **`.overlap`** - Overlap/חפיפה assignments

### Hebrew/RTL Support
- **Day names**: א, ב, ג, ד, ה, ו, ש (Sunday to Saturday)
- **RTL layout**: `direction: rtl` in CSS
- **Date format**: dd-mm-yyyy (Israeli standard)
- **Weekend highlighting**: Friday/Saturday visual indicators

### Constraint Visualization Patterns (from constraints.html)
```css
.calendar-day.has-constraint { background: #fff3cd; border-color: #ffc107; }
.calendar-day.has-fixed { background: #d1ecf1; border-color: #17a2b8; }
.calendar-day.has-vacation { background: #d4edda; border-color: #28a745; }
.calendar-day.has-multiple { background: linear-gradient(45deg, ...); }
```

---

## 🗄️ 1.6 Database Schema Requirements

### ✅ No New Tables Required

All necessary functionality can be built using existing schema:

#### Primary Tables
1. **`schedule`** - Main scheduling data with `is_manual` flag
2. **`users`** - Guide information and house assignments  
3. **`constraints`** - Specific date constraints
4. **`fixed_constraints`** - Weekly recurring constraints
5. **`vacations`** - Date range constraints with approval
6. **`weekend_types`** - Weekend classification (open/closed)

#### Supporting Tables
7. **`houses`** - Multi-facility support
8. **`assignment_types`** - Assignment type definitions
9. **`shift_types`** - Shift configuration data

### Existing Indexes Support Performance
```sql
-- Efficient constraint lookups
CREATE INDEX idx_constraints_user_date ON constraints(user_id, date);
CREATE INDEX idx_fixed_constraints_user_weekday ON fixed_constraints(user_id, weekday);
CREATE INDEX idx_vacations_user_dates ON vacations(user_id, date_start, date_end);

-- Schedule performance
CREATE INDEX idx_schedule_date ON schedule(date);
CREATE INDEX idx_schedule_guides ON schedule(guide1_id, guide2_id);
CREATE INDEX idx_schedule_manual ON schedule(is_manual, is_locked);
```

### Data Integrity Features
- **CASCADE deletes**: Automatic cleanup when guides are removed
- **Check constraints**: Data validation at database level
- **Foreign keys**: Referential integrity enforcement
- **Default values**: Proper fallbacks for optional fields

---

## 🚀 Implementation Strategy

### Leverage Existing Systems
1. **API Patterns**: Build on `POST /api/schedule/manual` foundation
2. **Constraint Logic**: Reuse constraint checking from context builder
3. **Statistics**: Extend existing `calculateGuideStatisticsPG()` functions
4. **Calendar CSS**: Build on proven grid layout patterns

### New Components Needed
1. **Enhanced API endpoints** for drag-and-drop operations
2. **Real-time constraint visualization** system
3. **Guide card interface** with live statistics
4. **Drag-and-drop handlers** for assignment management

### Israeli Localization Considerations
- **Weekend logic**: Friday-Saturday (not Sunday-based)
- **Hebrew text**: RTL layout with proper font support
- **Date formats**: dd-mm-yyyy Israeli standard
- **Time zones**: Proper Israeli timezone handling

---

## ✨ Next Steps

Phase 1 research provides a solid foundation for Phase 2 development. Key advantages discovered:

✅ **Robust constraint system** already handles all requirement types  
✅ **Accurate salary calculations** with proper multipliers implemented  
✅ **Efficient database schema** with no modifications needed  
✅ **Proven calendar patterns** ready for drag-and-drop enhancement  
✅ **Complete Israeli localization** already in place  

The enhanced manual scheduler can now be built using these existing systems as a foundation, ensuring consistency with the rest of the application while adding the requested drag-and-drop functionality and real-time statistics.