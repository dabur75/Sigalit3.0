// Phase 1 Task 2: Enhanced API Endpoints for Sigalit Scheduler
// These endpoints will be integrated into app.js

// =====================================================
// 1. ENHANCED GUIDE MANAGEMENT ENDPOINTS
// =====================================================

// Get all guides with enhanced information
app.get('/api/guides/enhanced', (req, res) => {
  try {
    const guides = db.prepare(`
      SELECT 
        u.id, u.name, u.role, u.email, u.phone, u.percent, u.is_active,
        u.created_at, u.updated_at,
        COUNT(s.id) as total_shifts,
        COUNT(CASE WHEN s.is_manual = 1 THEN 1 END) as manual_shifts,
        COUNT(CASE WHEN s.is_manual = 0 THEN 1 END) as auto_shifts
      FROM users u
      LEFT JOIN schedule s ON (u.id = s.guide1_id OR u.id = s.guide2_id)
      WHERE u.role = 'מדריך'
      GROUP BY u.id, u.name, u.role
      ORDER BY u.name
    `).all();
    
    res.json(guides);
  } catch (error) {
    console.error('Error fetching enhanced guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get guide availability for a specific date
app.get('/api/guides/availability/:date', (req, res) => {
  try {
    const { date } = req.params;
    
    const availability = db.prepare(`
      SELECT 
        u.id as guide_id,
        u.name as guide_name,
        u.role as guide_role,
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
      LEFT JOIN guide_availability ga ON u.id = ga.guide_id AND ga.date = ?
      LEFT JOIN constraints c ON u.id = c.user_id AND c.date = ?
      LEFT JOIN fixed_constraints fc ON u.id = fc.user_id AND CAST(strftime('%w', ?) AS INTEGER) = fc.weekday
      LEFT JOIN vacations v ON u.id = v.user_id AND ? BETWEEN v.date_start AND v.date_end AND v.status = 'approved'
      WHERE u.role = 'מדריך' AND u.is_active = 1
      ORDER BY u.name
    `).all(date, date, date, date);
    
    res.json(availability);
  } catch (error) {
    console.error('Error fetching guide availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// =====================================================
// 2. ENHANCED SCHEDULE MANAGEMENT ENDPOINTS
// =====================================================

// Get monthly schedule with enhanced information
app.get('/api/schedule/enhanced/:year/:month', (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;
    
    const schedule = db.prepare(`
      SELECT 
        s.*,
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
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      WHERE s.date >= ? AND s.date <= ?
      ORDER BY s.date ASC
    `).all(startDate, endDate);
    
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching enhanced schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create manual assignment
app.post('/api/schedule/manual', (req, res) => {
  try {
    const { date, guide1_id, guide2_id, type, created_by } = req.body;
    
    // Check if assignment already exists
    const existing = db.prepare('SELECT id FROM schedule WHERE date = ?').get(date);
    
    if (existing) {
      // Update existing assignment
      db.prepare(`
        UPDATE schedule 
        SET guide1_id = ?, guide2_id = ?, type = ?, is_manual = 1, is_locked = 1, 
            created_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE date = ?
      `).run(guide1_id, guide2_id, type, created_by, date);
    } else {
      // Create new assignment
      db.prepare(`
        INSERT INTO schedule (date, weekday, type, guide1_id, guide2_id, is_manual, is_locked, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, 1, 1, ?, CURRENT_TIMESTAMP)
      `).run(date, getWeekday(date), type, guide1_id, guide2_id, created_by);
    }
    
    // Log the change
    db.prepare(`
      INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
      VALUES ('schedule', ?, 'create_manual', ?, ?)
    `).run(existing ? existing.id : db.prepare('SELECT last_insert_rowid()').get()['last_insert_rowid()'], 
           JSON.stringify(req.body), created_by);
    
    res.json({ success: true, message: 'Manual assignment created' });
  } catch (error) {
    console.error('Error creating manual assignment:', error);
    res.status(500).json({ error: 'Failed to create manual assignment' });
  }
});

// Unlock manual assignment
app.put('/api/schedule/unlock/:date', (req, res) => {
  try {
    const { date } = req.params;
    const { user_id } = req.body;
    
    db.prepare(`
      UPDATE schedule 
      SET is_locked = 0, updated_at = CURRENT_TIMESTAMP
      WHERE date = ? AND is_manual = 1
    `).run(date);
    
    // Log the change
    db.prepare(`
      INSERT INTO audit_log (table_name, record_id, action, new_values, user_id)
      VALUES ('schedule', ?, 'unlock_manual', ?, ?)
    `).run(db.prepare('SELECT id FROM schedule WHERE date = ?').get(date)?.id, 
           JSON.stringify({ date, unlocked: true }), user_id);
    
    res.json({ success: true, message: 'Assignment unlocked' });
  } catch (error) {
    console.error('Error unlocking assignment:', error);
    res.status(500).json({ error: 'Failed to unlock assignment' });
  }
});

// =====================================================
// 3. DRAFT MANAGEMENT ENDPOINTS
// =====================================================

// Save draft
app.post('/api/drafts', (req, res) => {
  try {
    const { month, name, data, created_by } = req.body;
    
    // Get next version number for this month
    const lastVersion = db.prepare('SELECT MAX(version) as max_version FROM drafts WHERE month = ?').get(month);
    const version = (lastVersion?.max_version || 0) + 1;
    
    db.prepare(`
      INSERT INTO drafts (month, version, name, data, created_by, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(month, version, name, JSON.stringify(data), created_by);
    
    res.json({ 
      success: true, 
      message: 'Draft saved',
      draft_id: db.prepare('SELECT last_insert_rowid()').get()['last_insert_rowid()'],
      version: version
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Get drafts for a month
app.get('/api/drafts/:month', (req, res) => {
  try {
    const { month } = req.params;
    
    const drafts = db.prepare(`
      SELECT d.*, u.name as created_by_name
      FROM drafts d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.month = ?
      ORDER BY d.version DESC
    `).all(month);
    
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Load draft
app.get('/api/drafts/:month/:version', (req, res) => {
  try {
    const { month, version } = req.params;
    
    const draft = db.prepare(`
      SELECT d.*, u.name as created_by_name
      FROM drafts d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.month = ? AND d.version = ?
    `).get(month, version);
    
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    draft.data = JSON.parse(draft.data);
    res.json(draft);
  } catch (error) {
    console.error('Error loading draft:', error);
    res.status(500).json({ error: 'Failed to load draft' });
  }
});

// =====================================================
// 4. ASSIGNMENT TYPES AND SHIFT TYPES ENDPOINTS
// =====================================================

// Get assignment types
app.get('/api/assignment-types', (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM assignment_types WHERE is_active = 1 ORDER BY name').all();
    res.json(types);
  } catch (error) {
    console.error('Error fetching assignment types:', error);
    res.status(500).json({ error: 'Failed to fetch assignment types' });
  }
});

// Get shift types
app.get('/api/shift-types', (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM shift_types WHERE is_active = 1 ORDER BY name').all();
    res.json(types);
  } catch (error) {
    console.error('Error fetching shift types:', error);
    res.status(500).json({ error: 'Failed to fetch shift types' });
  }
});

// =====================================================
// 5. AUDIT LOG ENDPOINTS
// =====================================================

// Get audit log
app.get('/api/audit-log', (req, res) => {
  try {
    const { table_name, record_id, limit = 100 } = req.query;
    
    let query = `
      SELECT al.*, u.name as user_name
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (table_name) {
      conditions.push('al.table_name = ?');
      params.push(table_name);
    }
    
    if (record_id) {
      conditions.push('al.record_id = ?');
      params.push(record_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY al.timestamp DESC LIMIT ?';
    params.push(limit);
    
    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// =====================================================
// 6. UTILITY FUNCTIONS
// =====================================================

// Helper function to get weekday name
function getWeekday(dateStr) {
  const date = new Date(dateStr);
  const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return weekdays[date.getDay()];
}

// =====================================================
// 7. INTEGRATION NOTES
// =====================================================

/*
To integrate these endpoints into app.js:

1. Add these endpoints to your existing app.js file
2. Update the existing endpoints to use the new schema
3. Test each endpoint individually
4. Update the frontend to use the new endpoints

Key changes needed in existing endpoints:
- Update /api/guides to include new fields
- Update /api/schedule to include is_manual, is_locked fields
- Add audit logging to existing CRUD operations
- Update scheduling logic to respect manual assignments

Testing checklist:
- [ ] All new endpoints work correctly
- [ ] Existing endpoints still work
- [ ] Database constraints are respected
- [ ] Audit logging works properly
- [ ] Error handling is comprehensive
*/ 