-- Phase 1: Database Schema Enhancements for Sigalit Scheduler
-- Building on existing schema with enhancements for new requirements

-- =====================================================
-- 1. ENHANCE EXISTING TABLES
-- =====================================================

-- Add missing columns to users table for guide management
ALTER TABLE users ADD COLUMN email TEXT;
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN percent INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to schedule table for manual assignments
ALTER TABLE schedule ADD COLUMN is_manual BOOLEAN DEFAULT 0;
ALTER TABLE schedule ADD COLUMN is_locked BOOLEAN DEFAULT 0;
ALTER TABLE schedule ADD COLUMN created_by INTEGER;
ALTER TABLE schedule ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE schedule ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to schedule_draft table
ALTER TABLE schedule_draft ADD COLUMN is_manual BOOLEAN DEFAULT 0;
ALTER TABLE schedule_draft ADD COLUMN is_locked BOOLEAN DEFAULT 0;
ALTER TABLE schedule_draft ADD COLUMN created_by INTEGER;
ALTER TABLE schedule_draft ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE schedule_draft ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;

-- =====================================================
-- 2. NEW TABLES FOR ENHANCED FEATURES
-- =====================================================

-- Drafts management table (for version control)
CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL, -- YYYY-MM format
    version INTEGER NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON of schedule data
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_final BOOLEAN DEFAULT 0,
    approved_at TEXT,
    approved_by INTEGER
);

-- Guide availability tracking
CREATE TABLE IF NOT EXISTS guide_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guide_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL, -- 'available', 'blocked', 'warning'
    reason TEXT,
    override_enabled BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide_id) REFERENCES users(id)
);

-- Assignment types and roles
CREATE TABLE IF NOT EXISTS assignment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- 'רגיל', 'חפיפה', 'כונן'
    description TEXT,
    hours_per_shift INTEGER DEFAULT 24,
    salary_factor REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT 1
);

-- Shift types for different days
CREATE TABLE IF NOT EXISTS shift_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- 'weekday', 'weekend_open', 'weekend_closed', 'holiday'
    description TEXT,
    guides_required INTEGER DEFAULT 2,
    roles_required TEXT, -- JSON array of required roles
    is_active BOOLEAN DEFAULT 1
);

-- Audit trail for all changes
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER,
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    old_values TEXT, -- JSON of old values
    new_values TEXT, -- JSON of new values
    user_id INTEGER,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

-- =====================================================
-- 3. ENHANCE EXISTING TABLES WITH INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(date);
CREATE INDEX IF NOT EXISTS idx_schedule_guide1 ON schedule(guide1_id);
CREATE INDEX IF NOT EXISTS idx_schedule_guide2 ON schedule(guide2_id);
CREATE INDEX IF NOT EXISTS idx_schedule_manual ON schedule(is_manual);
CREATE INDEX IF NOT EXISTS idx_schedule_locked ON schedule(is_locked);

CREATE INDEX IF NOT EXISTS idx_constraints_user_date ON constraints(user_id, date);
CREATE INDEX IF NOT EXISTS idx_fixed_constraints_user_weekday ON fixed_constraints(user_id, weekday);
CREATE INDEX IF NOT EXISTS idx_vacations_user_dates ON vacations(user_id, date_start, date_end);

CREATE INDEX IF NOT EXISTS idx_drafts_month_version ON drafts(month, version);
CREATE INDEX IF NOT EXISTS idx_guide_availability_guide_date ON guide_availability(guide_id, date);

-- =====================================================
-- 4. INSERT DEFAULT DATA
-- =====================================================

-- Insert default assignment types
INSERT OR IGNORE INTO assignment_types (name, description, hours_per_shift, salary_factor) VALUES
('רגיל', 'משמרת רגילה 09:00-09:00', 24, 1.0),
('חפיפה', 'משמרת חפיפה 09:00-10:00 למחרת', 25, 1.04),
('כונן', 'כונן שבת סגורה', 32, 1.33);

-- Insert default shift types
INSERT OR IGNORE INTO shift_types (name, description, guides_required, roles_required) VALUES
('weekday', 'יום חול רגיל', 2, '["רגיל", "חפיפה"]'),
('weekend_open', 'סוף שבוע פתוח', 2, '["רגיל", "חפיפה"]'),
('weekend_closed', 'סוף שבוע סגור', 1, '["כונן"]'),
('holiday', 'חג', 2, '["רגיל", "חפיפה"]');

-- =====================================================
-- 5. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for guide availability with reasons
CREATE VIEW IF NOT EXISTS v_guide_availability AS
SELECT 
    u.id as guide_id,
    u.name as guide_name,
    u.role as guide_role,
    ga.date,
    ga.status,
    ga.reason,
    ga.override_enabled,
    CASE 
        WHEN c.id IS NOT NULL THEN 'constraint'
        WHEN fc.id IS NOT NULL THEN 'fixed_constraint'
        WHEN v.id IS NOT NULL THEN 'vacation'
        ELSE ga.reason
    END as constraint_type
FROM users u
LEFT JOIN guide_availability ga ON u.id = ga.guide_id
LEFT JOIN constraints c ON u.id = c.user_id AND ga.date = c.date
LEFT JOIN fixed_constraints fc ON u.id = fc.user_id AND CAST(strftime('%w', ga.date) AS INTEGER) = fc.weekday
LEFT JOIN vacations v ON u.id = v.user_id AND ga.date BETWEEN v.date_start AND v.date_end AND v.status = 'approved';

-- View for monthly schedule summary
CREATE VIEW IF NOT EXISTS v_monthly_schedule AS
SELECT 
    s.date,
    s.weekday,
    s.type,
    u1.name as guide1_name,
    u1.role as guide1_role,
    u2.name as guide2_name,
    u2.role as guide2_role,
    s.is_manual,
    s.is_locked,
    CASE 
        WHEN s.is_manual = 1 THEN 'manual'
        ELSE 'auto'
    END as assignment_type
FROM schedule s
LEFT JOIN users u1 ON s.guide1_id = u1.id
LEFT JOIN users u2 ON s.guide2_id = u2.id;

-- =====================================================
-- 6. TRIGGERS FOR AUDIT TRAIL
-- =====================================================

-- Trigger for schedule changes
CREATE TRIGGER IF NOT EXISTS audit_schedule_changes
AFTER UPDATE ON schedule
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, user_id)
    VALUES ('schedule', NEW.id, 'update', 
        json_object('date', OLD.date, 'guide1_id', OLD.guide1_id, 'guide2_id', OLD.guide2_id, 'is_manual', OLD.is_manual, 'is_locked', OLD.is_locked),
        json_object('date', NEW.date, 'guide1_id', NEW.guide1_id, 'guide2_id', NEW.guide2_id, 'is_manual', NEW.is_manual, 'is_locked', NEW.is_locked),
        NEW.created_by);
END;

-- Trigger for manual assignment creation
CREATE TRIGGER IF NOT EXISTS audit_manual_assignments
AFTER INSERT ON schedule
FOR EACH ROW
WHEN NEW.is_manual = 1
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
    VALUES ('schedule', NEW.id, 'create_manual', 
        json_object('date', NEW.date, 'guide1_id', NEW.guide1_id, 'guide2_id', NEW.guide2_id, 'is_locked', NEW.is_locked),
        NEW.created_by);
END;

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to get guide statistics for a month
CREATE VIEW IF NOT EXISTS v_guide_monthly_stats AS
SELECT 
    u.id as guide_id,
    u.name as guide_name,
    u.role as guide_role,
    COUNT(s.id) as total_shifts,
    COUNT(CASE WHEN s.is_manual = 1 THEN 1 END) as manual_shifts,
    COUNT(CASE WHEN s.is_manual = 0 THEN 1 END) as auto_shifts,
    COUNT(CASE WHEN CAST(strftime('%w', s.date) AS INTEGER) IN (5,6) THEN 1 END) as weekend_shifts,
    SUM(CASE 
        WHEN s.type = 'כונן' THEN 32
        WHEN s.type = 'חפיפה' THEN 25
        ELSE 24
    END) as total_hours
FROM users u
LEFT JOIN schedule s ON (u.id = s.guide1_id OR u.id = s.guide2_id)
WHERE u.role = 'מדריך'
GROUP BY u.id, u.name, u.role;

-- =====================================================
-- 8. MIGRATION NOTES
-- =====================================================

/*
Migration Steps:
1. Run this script to enhance existing database
2. Update existing data to populate new columns
3. Test all existing functionality
4. Update application code to use new schema
5. Add new API endpoints for enhanced features

Notes:
- All existing data is preserved
- New columns have sensible defaults
- Indexes will improve performance
- Views provide easy access to common queries
- Triggers maintain audit trail automatically
*/ 