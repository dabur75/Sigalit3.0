CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  , password TEXT, email TEXT, phone TEXT, percent INTEGER, is_active BOOLEAN DEFAULT 1, created_at TEXT, updated_at TEXT, house_id VARCHAR(50) DEFAULT 'dror', accessible_houses TEXT DEFAULT '["dror", "havatzelet"]');
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    date TEXT NOT NULL,
    details TEXT
  , house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
CREATE TABLE fixed_constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weekday INTEGER NOT NULL,
    hour_start TEXT,
    hour_end TEXT,
    details TEXT
  );
CREATE TABLE vacations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date_start TEXT NOT NULL,
    date_end TEXT NOT NULL,
    note TEXT,
    status TEXT,
    response_note TEXT
  );
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY,
    updated_at TEXT
  );
CREATE TABLE conversation_participants (
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL
  );
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    conversation_id INTEGER NOT NULL,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
CREATE TABLE overrides_activities (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    facilitator TEXT
  );
CREATE TABLE referrals (
    id INTEGER PRIMARY KEY,
    patient TEXT NOT NULL,
    reason TEXT NOT NULL,
    doctor TEXT NOT NULL,
    date TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT
  );
CREATE TABLE schedule_draft (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weekday TEXT NOT NULL,
    type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER
  , name TEXT);
CREATE TABLE schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    weekday TEXT NOT NULL,
    type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER
  , is_manual BOOLEAN DEFAULT 0, is_locked BOOLEAN DEFAULT 0, created_by INTEGER, created_at TEXT, updated_at TEXT, guide1_name TEXT, guide1_role TEXT, guide2_name TEXT, guide2_role TEXT, house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
CREATE TABLE shifts (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    day TEXT NOT NULL,
    handover_guide_id INTEGER,
    regular_guide_id INTEGER
  );
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    created_at TEXT,
    creator_id INTEGER,
    assigned_to_id INTEGER,
    status TEXT,
    shift_date TEXT,
    notes TEXT,
    closed_by_id INTEGER,
    closed_at TEXT
  , house_id VARCHAR(50) NOT NULL DEFAULT 'dror');
CREATE TABLE weekly_activities (
    id INTEGER PRIMARY KEY,
    weekday TEXT NOT NULL,
    time TEXT NOT NULL,
    duration TEXT,
    title TEXT NOT NULL,
    category TEXT,
    facilitator TEXT
  );
CREATE TABLE scheduling_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- 'manual_only' or 'prevent_pair'
    guide_id INTEGER NOT NULL,
    guide2_id INTEGER, -- nullable, only for prevent_pair
    created_by INTEGER,
    created_at TEXT,
    description TEXT
  );
CREATE TABLE shabbat_status (
    date TEXT PRIMARY KEY, -- שבת date (YYYY-MM-DD)
    status TEXT NOT NULL -- 'סגורה' or 'פתוחה'
  );
CREATE TABLE drafts (id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT NOT NULL, version INTEGER NOT NULL, name TEXT NOT NULL, data TEXT NOT NULL, created_by INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP, is_final BOOLEAN DEFAULT 0, approved_at TEXT, approved_by INTEGER);
CREATE TABLE guide_availability (id INTEGER PRIMARY KEY AUTOINCREMENT, guide_id INTEGER NOT NULL, date TEXT NOT NULL, status TEXT NOT NULL, reason TEXT, override_enabled BOOLEAN DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (guide_id) REFERENCES users(id));
CREATE TABLE assignment_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, hours_per_shift INTEGER DEFAULT 24, salary_factor REAL DEFAULT 1.0, is_active BOOLEAN DEFAULT 1);
CREATE TABLE shift_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, guides_required INTEGER DEFAULT 2, roles_required TEXT, is_active BOOLEAN DEFAULT 1);
CREATE TABLE audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, record_id INTEGER, action TEXT NOT NULL, old_values TEXT, new_values TEXT, user_id INTEGER, timestamp TEXT DEFAULT CURRENT_TIMESTAMP, ip_address TEXT, user_agent TEXT);
CREATE TABLE weekend_types (id INTEGER PRIMARY KEY, date TEXT UNIQUE, is_closed INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE coordinator_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_type TEXT NOT NULL,
    guide1_id INTEGER,
    guide2_id INTEGER,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guide1_id) REFERENCES users(id),
    FOREIGN KEY (guide2_id) REFERENCES users(id)
  );
CREATE INDEX idx_coordinator_rules_type 
  ON coordinator_rules(rule_type, is_active)
;
CREATE INDEX idx_coordinator_rules_guides 
  ON coordinator_rules(guide1_id, guide2_id, is_active)
;
CREATE INDEX idx_schedule_date 
  ON schedule(date)
;
CREATE INDEX idx_schedule_guides 
  ON schedule(guide1_id, guide2_id)
;
CREATE INDEX idx_schedule_manual 
  ON schedule(is_manual, is_locked)
;
CREATE INDEX idx_constraints_user_date 
  ON constraints(user_id, date)
;
CREATE INDEX idx_fixed_constraints_user_weekday 
  ON fixed_constraints(user_id, weekday)
;
CREATE INDEX idx_vacations_user_dates 
  ON vacations(user_id, date_start, date_end)
;
CREATE TABLE official_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    schedule_data TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
CREATE TABLE schedule_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    schedule_type TEXT NOT NULL, -- 'draft', 'official'
    version INTEGER NOT NULL,
    schedule_data TEXT NOT NULL,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    action TEXT, -- 'created', 'modified', 'sent_to_guides', 'finalized'
    notes TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL,
    draft_version INTEGER NOT NULL,
    recipient_id INTEGER,
    recipient_email TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    email_content TEXT,
    FOREIGN KEY (recipient_id) REFERENCES users(id)
  );
CREATE TABLE workflow_status (
    month TEXT PRIMARY KEY,
    current_draft_version INTEGER DEFAULT 0,
    is_finalized INTEGER DEFAULT 0,
    finalized_at DATETIME,
    finalized_by INTEGER,
    last_email_sent_version INTEGER DEFAULT 0,
    last_email_sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (finalized_by) REFERENCES users(id)
  );
CREATE TABLE houses (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100) NOT NULL, display_name VARCHAR(100) NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
