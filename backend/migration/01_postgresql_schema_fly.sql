-- PostgreSQL Schema Migration for Sigalit System
-- Converting from SQLite to PostgreSQL with enhancements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For Hebrew text search

-- Create houses table first (referenced by users)
CREATE TABLE houses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default houses
INSERT INTO houses (id, name, display_name) VALUES 
('dror', 'דרור', 'דרור'),
('havatzelet', 'חבצלת', 'חבצלת')
ON CONFLICT (id) DO NOTHING;

-- Users table with PostgreSQL enhancements
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('מדריך', 'רכז')),
    password VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    percent INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    house_id VARCHAR(50) DEFAULT 'dror' REFERENCES houses(id),
    accessible_houses JSONB DEFAULT '["dror", "havatzelet"]'::jsonb
);

-- Constraints table
CREATE TABLE constraints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    details TEXT,
    house_id VARCHAR(50) NOT NULL DEFAULT 'dror' REFERENCES houses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fixed constraints table
CREATE TABLE fixed_constraints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
    hour_start TIME,
    hour_end TIME,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vacations table
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

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Overrides activities table
CREATE TABLE overrides_activities (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    facilitator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    patient VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    doctor VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule draft table
CREATE TABLE schedule_draft (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    weekday VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    guide1_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guide2_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Schedule table (main table)
CREATE TABLE schedule (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    weekday VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL,
    guide1_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guide2_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_manual BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guide1_name VARCHAR(100),
    guide1_role VARCHAR(50),
    guide2_name VARCHAR(100),
    guide2_role VARCHAR(50),
    house_id VARCHAR(50) NOT NULL DEFAULT 'dror' REFERENCES houses(id)
);

-- Shifts table
CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    day VARCHAR(20) NOT NULL,
    handover_guide_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    regular_guide_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50),
    shift_date DATE,
    notes TEXT,
    closed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    closed_at TIMESTAMP,
    house_id VARCHAR(50) NOT NULL DEFAULT 'dror' REFERENCES houses(id)
);

-- Weekly activities table
CREATE TABLE weekly_activities (
    id SERIAL PRIMARY KEY,
    weekday VARCHAR(20) NOT NULL,
    time TIME NOT NULL,
    duration INTERVAL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    facilitator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheduling rules table
CREATE TABLE scheduling_rules (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('manual_only', 'prevent_pair')),
    guide_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    guide2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Shabbat status table
CREATE TABLE shabbat_status (
    date DATE PRIMARY KEY,
    status VARCHAR(20) NOT NULL CHECK (status IN ('סגורה', 'פתוחה')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drafts table
CREATE TABLE drafts (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    version INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_final BOOLEAN DEFAULT false,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Guide availability table
CREATE TABLE guide_availability (
    id SERIAL PRIMARY KEY,
    guide_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    override_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guide_id, date)
);

-- Assignment types table
CREATE TABLE assignment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    hours_per_shift INTEGER DEFAULT 24,
    salary_factor DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shift types table
CREATE TABLE shift_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    guides_required INTEGER DEFAULT 2,
    roles_required JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Weekend types table
CREATE TABLE weekend_types (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coordinator rules table
CREATE TABLE coordinator_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL,
    guide1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    guide2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER DEFAULT 1 REFERENCES users(id) ON DELETE SET DEFAULT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Official schedules table
CREATE TABLE official_schedules (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    version INTEGER NOT NULL DEFAULT 1,
    schedule_data JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT
);

-- Schedule history table
CREATE TABLE schedule_history (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('draft', 'official')),
    version INTEGER NOT NULL,
    schedule_data JSONB NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50), -- 'created', 'modified', 'sent_to_guides', 'finalized'
    notes TEXT
);

-- Email logs table
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    draft_version INTEGER NOT NULL,
    recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    email_content TEXT
);

-- Workflow status table
CREATE TABLE workflow_status (
    month VARCHAR(7) PRIMARY KEY, -- YYYY-MM format
    current_draft_version INTEGER DEFAULT 0,
    is_finalized BOOLEAN DEFAULT false,
    finalized_at TIMESTAMP,
    finalized_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    last_email_sent_version INTEGER DEFAULT 0,
    last_email_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_name_gin ON users USING gin(name gin_trgm_ops);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_house ON users(house_id);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_constraints_user_date ON constraints(user_id, date);
CREATE INDEX idx_constraints_date ON constraints(date);
CREATE INDEX idx_constraints_house ON constraints(house_id);

CREATE INDEX idx_fixed_constraints_user_weekday ON fixed_constraints(user_id, weekday);

CREATE INDEX idx_vacations_user_dates ON vacations(user_id, date_start, date_end);
CREATE INDEX idx_vacations_dates ON vacations(date_start, date_end);

CREATE INDEX idx_schedule_date ON schedule(date);
CREATE INDEX idx_schedule_guides ON schedule(guide1_id, guide2_id);
CREATE INDEX idx_schedule_manual ON schedule(is_manual, is_locked);
CREATE INDEX idx_schedule_house ON schedule(house_id);

CREATE INDEX idx_tasks_house ON tasks(house_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to_id);

CREATE INDEX idx_coordinator_rules_type ON coordinator_rules(rule_type, is_active);
CREATE INDEX idx_coordinator_rules_guides ON coordinator_rules(guide1_id, guide2_id, is_active);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

CREATE INDEX idx_guide_availability_guide_date ON guide_availability(guide_id, date);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedule_updated_at BEFORE UPDATE ON schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coordinator_rules_updated_at BEFORE UPDATE ON coordinator_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_status_updated_at BEFORE UPDATE ON workflow_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate Hebrew text
CREATE OR REPLACE FUNCTION is_hebrew_text(text_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if text contains Hebrew characters (Unicode range 0590-05FF)
    RETURN text_to_check ~ '[\u0590-\u05FF]';
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for fast reporting
CREATE MATERIALIZED VIEW monthly_schedule_stats AS
SELECT 
    DATE_TRUNC('month', date) as month,
    guide1_id,
    COUNT(*) as shift_count,
    COUNT(CASE WHEN is_manual = true THEN 1 END) as manual_shifts,
    COUNT(CASE WHEN is_locked = true THEN 1 END) as locked_shifts
FROM schedule
GROUP BY DATE_TRUNC('month', date), guide1_id;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_monthly_schedule_stats_month_guide ON monthly_schedule_stats(month, guide1_id);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_monthly_schedule_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW monthly_schedule_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to sigalit_user

-- Create a function to get guide workload balance
CREATE OR REPLACE FUNCTION get_guide_workload_balance(p_year INTEGER, p_month INTEGER)
RETURNS TABLE(
    guide_id INTEGER,
    guide_name VARCHAR(100),
    current_shifts INTEGER,
    target_shifts DECIMAL,
    balance_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as guide_id,
        u.name as guide_name,
        COUNT(s.id)::INTEGER as current_shifts,
        (COUNT(s.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM schedule WHERE DATE_TRUNC('month', date) = DATE(p_year || '-' || p_month || '-01')), 0))::DECIMAL as target_shifts,
        (COUNT(s.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM schedule WHERE DATE_TRUNC('month', date) = DATE(p_year || '-' || p_month || '-01')), 0))::DECIMAL as balance_percentage
    FROM users u
    LEFT JOIN schedule s ON u.id = s.guide1_id 
        AND DATE_TRUNC('month', s.date) = DATE(p_year || '-' || p_month || '-01')
    WHERE u.role = 'מדריך' AND u.is_active = true
    GROUP BY u.id, u.name
    ORDER BY balance_percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default assignment types
INSERT INTO assignment_types (name, description, hours_per_shift, salary_factor) VALUES
('רגיל', 'משמרת רגילה', 24, 1.0),
('חג', 'משמרת בחג', 24, 1.5),
('שבת', 'משמרת בשבת', 24, 1.3)
ON CONFLICT (name) DO NOTHING;

-- Insert default shift types
INSERT INTO shift_types (name, description, guides_required, roles_required) VALUES
('רגיל', 'משמרת רגילה', 2, '["מדריך", "מדריך"]'::jsonb),
('רכז', 'משמרת עם רכז', 2, '["רכז", "מדריך"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE users IS 'משתמשי המערכת - מדריכים ורכזים';
COMMENT ON TABLE schedule IS 'לוח הזמנים הראשי של המשמרות';
COMMENT ON TABLE constraints IS 'אילוצים אישיים של המדריכים';
COMMENT ON TABLE coordinator_rules IS 'כללי תיאום בין רכזים';
COMMENT ON TABLE houses IS 'בתי המגורים במערכת';
