-- Phase 1: Safe Database Migration for Sigalit Scheduler
-- This script safely enhances the existing database without conflicts

-- =====================================================
-- 1. SAFE COLUMN ADDITIONS (check if exists first)
-- =====================================================

-- Add missing columns to users table (only if they don't exist)
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN email TEXT;'
    ELSE 
        'SELECT "email column already exists";'
END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'email';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN phone TEXT;'
    ELSE 
        'SELECT "phone column already exists";'
    END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'phone';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN percent INTEGER DEFAULT 100;'
    ELSE 
        'SELECT "percent column already exists";'
    END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'percent';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;'
    ELSE 
        'SELECT "is_active column already exists";'
    END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'is_active';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "created_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'created_at';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "updated_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'updated_at';

-- Add missing columns to schedule table
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule ADD COLUMN is_manual BOOLEAN DEFAULT 0;'
    ELSE 
        'SELECT "is_manual column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'is_manual';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule ADD COLUMN is_locked BOOLEAN DEFAULT 0;'
    ELSE 
        'SELECT "is_locked column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'is_locked';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule ADD COLUMN created_by INTEGER;'
    ELSE 
        'SELECT "created_by column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'created_by';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "created_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'created_at';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "updated_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'updated_at';

-- Add missing columns to schedule_draft table
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule_draft ADD COLUMN is_manual BOOLEAN DEFAULT 0;'
    ELSE 
        'SELECT "is_manual column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule_draft') 
WHERE name = 'is_manual';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule_draft ADD COLUMN is_locked BOOLEAN DEFAULT 0;'
    ELSE 
        'SELECT "is_locked column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule_draft') 
WHERE name = 'is_locked';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule_draft ADD COLUMN created_by INTEGER;'
    ELSE 
        'SELECT "created_by column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule_draft') 
WHERE name = 'created_by';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule_draft ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "created_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule_draft') 
WHERE name = 'created_at';

SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE schedule_draft ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;'
    ELSE 
        'SELECT "updated_at column already exists";'
    END AS sql_statement
FROM pragma_table_info('schedule_draft') 
WHERE name = 'updated_at';

-- =====================================================
-- 2. NEW TABLES (only create if they don't exist)
-- =====================================================

-- Drafts management table
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
-- 3. INDEXES (only create if they don't exist)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule(date);
CREATE INDEX IF NOT EXISTS idx_schedule_guide1 ON schedule(guide1_id);
CREATE INDEX IF NOT EXISTS idx_schedule_guide2 ON schedule(guide2_id);

-- Only create these indexes if the columns exist
SELECT CASE 
    WHEN COUNT(*) > 0 THEN 
        'CREATE INDEX IF NOT EXISTS idx_schedule_manual ON schedule(is_manual);'
    ELSE 
        'SELECT "is_manual column does not exist yet";'
END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'is_manual';

SELECT CASE 
    WHEN COUNT(*) > 0 THEN 
        'CREATE INDEX IF NOT EXISTS idx_schedule_locked ON schedule(is_locked);'
    ELSE 
        'SELECT "is_locked column does not exist yet";'
END AS sql_statement
FROM pragma_table_info('schedule') 
WHERE name = 'is_locked';

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
    COALESCE(s.is_manual, 0) as is_manual,
    COALESCE(s.is_locked, 0) as is_locked,
    CASE 
        WHEN COALESCE(s.is_manual, 0) = 1 THEN 'manual'
        ELSE 'auto'
    END as assignment_type
FROM schedule s
LEFT JOIN users u1 ON s.guide1_id = u1.id
LEFT JOIN users u2 ON s.guide2_id = u2.id;

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to get guide statistics for a month
CREATE VIEW IF NOT EXISTS v_guide_monthly_stats AS
SELECT 
    u.id as guide_id,
    u.name as guide_name,
    u.role as guide_role,
    COUNT(s.id) as total_shifts,
    COUNT(CASE WHEN COALESCE(s.is_manual, 0) = 1 THEN 1 END) as manual_shifts,
    COUNT(CASE WHEN COALESCE(s.is_manual, 0) = 0 THEN 1 END) as auto_shifts,
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
-- 7. MIGRATION STATUS
-- =====================================================

-- Show current schema status
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_tables FROM sqlite_master WHERE type='table';
SELECT COUNT(*) as total_views FROM sqlite_master WHERE type='view';
SELECT COUNT(*) as total_indexes FROM sqlite_master WHERE type='index'; 