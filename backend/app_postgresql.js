const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL connection
const { pool, testConnection } = require('./database/postgresql');

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());



// Serve static files - dev can serve from frontend/, prod serves from public/
const serveFromFrontend = process.env.SERVE_FROM_FRONTEND === 'true';
if (serveFromFrontend) {
  app.use(express.static(path.join(__dirname, '..', 'frontend')));
}
app.use(express.static(path.join(__dirname, 'public')));

// Helper to serve a file from frontend/ if exists, otherwise from backend/public/
function sendFrontendOrPublic(res, filename) {
  const frontendPath = path.join(__dirname, '..', 'frontend', filename);
  const publicPath = path.join(__dirname, 'public', filename);
  try {
    if (serveFromFrontend && fs.existsSync(frontendPath)) {
      return res.sendFile(frontendPath);
    }
  } catch (err) {
    // no-op, fallback below
  }
  return res.sendFile(publicPath);
}

// Serve frontend files
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  sendFrontendOrPublic(res, 'login.html');
});

app.get('/login', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  sendFrontendOrPublic(res, 'login.html');
});

app.get('/dashboard', (req, res) => {
  sendFrontendOrPublic(res, 'dashboard.html');
});

app.get('/schedule', (req, res) => {
  sendFrontendOrPublic(res, 'schedule.html');
});

app.get('/scheduler', (req, res) => {
  sendFrontendOrPublic(res, 'scheduler.html');
});

app.get('/reports', (req, res) => {
  sendFrontendOrPublic(res, 'reports.html');
});

app.get('/guides', (req, res) => {
  sendFrontendOrPublic(res, 'guides.html');
});

app.get('/tasks', (req, res) => {
  sendFrontendOrPublic(res, 'tasks.html');
});

app.get('/constraints', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  sendFrontendOrPublic(res, 'constraints.html');
});

// ============================================================================
// PHASE 3: TASK & VACATION MANAGEMENT - MIGRATED TO POSTGRESQL
// ============================================================================

// Get all tasks (including completed) for history
app.get('/api/tasks/all', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*,
        u1.name as creator_name,
        u2.name as assigned_to_name,
        u3.name as closed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to_id = u2.id
      LEFT JOIN users u3 ON t.closed_by_id = u3.id
      ORDER BY t.created_at DESC
    `);
    
    // Convert dates to Israeli format
    const formattedRows = result.rows.map(row => ({
      ...row,
      shift_date: row.shift_date ? new Date(row.shift_date).toLocaleDateString('he-IL') : null,
      created_at: row.created_at ? new Date(row.created_at).toLocaleDateString('he-IL') : null,
      closed_at: row.closed_at ? new Date(row.closed_at).toLocaleDateString('he-IL') : null
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    res.status(500).json({ error: 'Failed to fetch all tasks' });
  }
});

// Get tasks by status
app.get('/api/tasks/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const result = await pool.query(`
      SELECT 
        t.*,
        u1.name as creator_name,
        u2.name as assigned_to_name,
        u3.name as closed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to_id = u2.id
      LEFT JOIN users u3 ON t.closed_by_id = u3.id
      WHERE t.status = $1
      ORDER BY t.created_at DESC
    `, [status]);
    
    // Convert dates to Israeli format
    const formattedRows = result.rows.map(row => ({
      ...row,
      shift_date: row.shift_date ? new Date(row.shift_date).toLocaleDateString('he-IL') : null,
      created_at: row.created_at ? new Date(row.created_at).toLocaleDateString('he-IL') : null,
      closed_at: row.closed_at ? new Date(row.closed_at).toLocaleDateString('he-IL') : null
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching tasks by status:', error);
    res.status(500).json({ error: 'Failed to fetch tasks by status' });
  }
});

// Tasks Management
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, open_only } = req.query;
    let whereClause = '';
    let params = [];
    
    if (open_only === 'true') {
      whereClause = 'WHERE t.status NOT IN (\'בוצע\', \'סגורה\', \'בוטלה\')';
    } else if (status) {
      whereClause = 'WHERE t.status = $1';
      params.push(status);
    }
    
    const result = await pool.query(`
      SELECT 
        t.*,
        u1.name as creator_name,
        u2.name as assigned_to_name,
        u3.name as closed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to_id = u2.id
      LEFT JOIN users u3 ON t.closed_by_id = u3.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `, params);
    
    // Convert dates to Israeli format
    const formattedRows = result.rows.map(row => ({
      ...row,
      shift_date: row.shift_date ? new Date(row.shift_date).toLocaleDateString('he-IL') : null,
      created_at: row.created_at ? new Date(row.created_at).toLocaleDateString('he-IL') : null,
      closed_at: row.closed_at ? new Date(row.closed_at).toLocaleDateString('he-IL') : null
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { text, created_at, creator_id, assigned_to_id, status, shift_date, notes } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Missing task text' });
    }
    
    const result = await pool.query(`
      INSERT INTO tasks (text, created_at, creator_id, assigned_to_id, status, shift_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      text,
      created_at || new Date().toISOString(),
      creator_id || null,
      assigned_to_id || null,
      status || 'פתוח',
      shift_date || null,
      notes || null
    ]);
    
    // Get the created task with user names
    const taskResult = await pool.query(`
      SELECT 
        t.*,
        u1.name as creator_name,
        u2.name as assigned_to_name,
        u3.name as closed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to_id = u2.id
      LEFT JOIN users u3 ON t.closed_by_id = u3.id
      WHERE t.id = $1
    `, [result.rows[0].id]);
    
    res.status(201).json(taskResult.rows[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, created_at, creator_id, assigned_to_id, status, shift_date, notes, closed_by_id, closed_at } = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    if (text !== undefined) {
      updateFields.push(`text = $${paramIndex++}`);
      values.push(text);
    }
    if (created_at !== undefined) {
      updateFields.push(`created_at = $${paramIndex++}`);
      values.push(created_at);
    }
    if (creator_id !== undefined) {
      updateFields.push(`creator_id = $${paramIndex++}`);
      values.push(creator_id);
    }
    if (assigned_to_id !== undefined) {
      updateFields.push(`assigned_to_id = $${paramIndex++}`);
      values.push(assigned_to_id);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (shift_date !== undefined) {
      updateFields.push(`shift_date = $${paramIndex++}`);
      values.push(shift_date);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }
    if (closed_by_id !== undefined) {
      updateFields.push(`closed_by_id = $${paramIndex++}`);
      values.push(closed_by_id);
    }
    if (closed_at !== undefined) {
      updateFields.push(`closed_at = $${paramIndex++}`);
      values.push(closed_at);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    const result = await pool.query(`
      UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex}
    `, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Get the updated task with user names
    const taskResult = await pool.query(`
      SELECT 
        t.*,
        u1.name as creator_name,
        u2.name as assigned_to_name,
        u3.name as closed_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.creator_id = u1.id
      LEFT JOIN users u2 ON t.assigned_to_id = u2.id
      LEFT JOIN users u3 ON t.closed_by_id = u3.id
      WHERE t.id = $1
    `, [id]);
    
    res.json(taskResult.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM tasks WHERE id = $1
    `, [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Fixed Constraints Management
app.get('/api/fixed-constraints', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.id,
        f.user_id as guideId,
        f.weekday,
        f.hour_start as hourStart,
        f.hour_end as hourEnd,
        f.details as note,
        u.name as name
      FROM fixed_constraints f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.weekday, f.hour_start
    `);
    
    // Transform the data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      ...row,
      guideId: row.guideid, // Ensure guideId is properly cased
      hourStart: row.hourstart,
      hourEnd: row.hourend
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching fixed constraints:', error);
    res.status(500).json({ error: 'Failed to fetch fixed constraints' });
  }
});

app.post('/api/fixed-constraints', async (req, res) => {
  try {
    const { guideId, weekday, hourStart, hourEnd, note } = req.body;
    
    const result = await pool.query(`
      INSERT INTO fixed_constraints (user_id, weekday, hour_start, hour_end, details, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [guideId, weekday, hourStart || null, hourEnd || null, note || '']);
    
    res.status(201).json({
      ...result.rows[0],
      guideId: result.rows[0].user_id,
      hourStart: result.rows[0].hour_start,
      hourEnd: result.rows[0].hour_end,
      note: result.rows[0].details
    });
  } catch (error) {
    console.error('Error creating fixed constraint:', error);
    res.status(500).json({ error: 'Failed to create fixed constraint' });
  }
});

app.put('/api/fixed-constraints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { guideId, weekday, hourStart, hourEnd, note } = req.body;
    
    const result = await pool.query(`
      UPDATE fixed_constraints
      SET user_id = $1, weekday = $2, hour_start = $3, hour_end = $4, details = $5
      WHERE id = $6
      RETURNING *
    `, [guideId, weekday, hourStart || null, hourEnd || null, note || '', id]);
    
    if (result.rows.length > 0) {
      res.json({
        ...result.rows[0],
        guideId: result.rows[0].user_id,
        hourStart: result.rows[0].hour_start,
        hourEnd: result.rows[0].hour_end,
        note: result.rows[0].details
      });
    } else {
      res.status(404).json({ error: 'Fixed constraint not found' });
    }
  } catch (error) {
    console.error('Error updating fixed constraint:', error);
    res.status(500).json({ error: 'Failed to update fixed constraint' });
  }
});

app.delete('/api/fixed-constraints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM fixed_constraints WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Fixed constraint not found' });
    }
  } catch (error) {
    console.error('Error deleting fixed constraint:', error);
    res.status(500).json({ error: 'Failed to delete fixed constraint' });
  }
});

// Vacations Management
app.get('/api/vacations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        v.user_id as guideId,
        v.date_start as dateStart,
        v.date_end as dateEnd,
        v.note,
        v.status,
        v.response_note as responseNote,
        v.created_at,
        u.name as name
      FROM vacations v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.date_start DESC
    `);
    
    // Transform the data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      ...row,
      guideId: row.guideid, // Ensure guideId is properly cased
      dateStart: row.datestart.toISOString().split('T')[0], // Format as YYYY-MM-DD
      dateEnd: row.dateend.toISOString().split('T')[0],     // Format as YYYY-MM-DD
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching vacations:', error);
    res.status(500).json({ error: 'Failed to fetch vacations' });
  }
});

app.post('/api/vacations', async (req, res) => {
  try {
    const { guideId, dateStart, dateEnd, note } = req.body;
    
    const result = await pool.query(`
      INSERT INTO vacations (user_id, date_start, date_end, note, status, response_note, created_at)
      VALUES ($1, $2, $3, $4, 'pending', '', NOW())
      RETURNING *
    `, [guideId, dateStart, dateEnd, note || '']);
    
    res.status(201).json({
      ...result.rows[0],
      guideId: result.rows[0].user_id,
      dateStart: result.rows[0].date_start,
      dateEnd: result.rows[0].date_end,
      responseNote: result.rows[0].response_note
    });
  } catch (error) {
    console.error('Error creating vacation:', error);
    res.status(500).json({ error: 'Failed to create vacation' });
  }
});

app.put('/api/vacations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { guideId, dateStart, dateEnd, note, status, responseNote } = req.body;
    
    const result = await pool.query(`
      UPDATE vacations
      SET user_id = $1, date_start = $2, date_end = $3, note = $4, status = $5, response_note = $6
      WHERE id = $7
      RETURNING *
    `, [guideId, dateStart, dateEnd, note || '', status || 'pending', responseNote || '', id]);
    
    if (result.rows.length > 0) {
      res.json({
        ...result.rows[0],
        guideId: result.rows[0].user_id,
        dateStart: result.rows[0].date_start,
        dateEnd: result.rows[0].date_end,
        responseNote: result.rows[0].response_note
      });
    } else {
      res.status(404).json({ error: 'Vacation not found' });
    }
  } catch (error) {
    console.error('Error updating vacation:', error);
    res.status(500).json({ error: 'Failed to update vacation' });
  }
});

app.delete('/api/vacations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM vacations WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Vacation not found' });
    }
  } catch (error) {
    console.error('Error deleting vacation:', error);
    res.status(500).json({ error: 'Failed to delete vacation' });
  }
});

// ============================================================================
// PHASE 4: COMMUNICATION & REPORTING - MIGRATED TO POSTGRESQL
// ============================================================================

// Weekly Activities Management
app.get('/api/weekly-activities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, weekday, time, duration, title, category, facilitator, created_at
      FROM weekly_activities
      ORDER BY weekday, time
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching weekly activities:', error);
    res.status(500).json({ error: 'Failed to fetch weekly activities' });
  }
});

app.post('/api/weekly-activities', async (req, res) => {
  try {
    const { weekday, time, duration, title, category, facilitator } = req.body;
    
    // Convert duration string to interval format
    const durationInterval = duration ? `${duration} minutes` : null;
    
    const result = await pool.query(`
      INSERT INTO weekly_activities (weekday, time, duration, title, category, facilitator, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [weekday, time, durationInterval, title, category, facilitator]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weekly activity:', error);
    res.status(500).json({ error: 'Failed to create weekly activity' });
  }
});

app.put('/api/weekly-activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { weekday, time, duration, title, category, facilitator } = req.body;
    
    // Convert duration string to interval format
    const durationInterval = duration ? `${duration} minutes` : null;
    
    const result = await pool.query(`
      UPDATE weekly_activities
      SET weekday = $1, time = $2, duration = $3, title = $4, category = $5, facilitator = $6
      WHERE id = $7
      RETURNING *
    `, [weekday, time, durationInterval, title, category, facilitator, id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (error) {
    console.error('Error updating weekly activity:', error);
    res.status(500).json({ error: 'Failed to update weekly activity' });
  }
});

app.delete('/api/weekly-activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM weekly_activities WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Activity not found' });
    }
  } catch (error) {
    console.error('Error deleting weekly activity:', error);
    res.status(500).json({ error: 'Failed to delete weekly activity' });
  }
});

// Weekly Overrides Management
app.get('/api/weekly-overrides', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, date, time, title, category, facilitator, created_at
      FROM overrides_activities
      ORDER BY date, time
    `);
    
    // Convert dates to Israeli format (dd-mm-yyyy)
    const formattedRows = result.rows.map(row => ({
      ...row,
      date: row.date ? row.date.toLocaleDateString('he-IL') : null // he-IL gives dd/mm/yyyy format
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching weekly overrides:', error);
    res.status(500).json({ error: 'Failed to fetch weekly overrides' });
  }
});

app.post('/api/weekly-overrides', async (req, res) => {
  try {
    const { date, time, title, category, facilitator } = req.body;
    
    // Ensure date is stored as date only (without timezone)
    const cleanDate = date.split('T')[0]; // Take only YYYY-MM-DD part
    
    const result = await pool.query(`
      INSERT INTO overrides_activities (date, time, title, category, facilitator, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [cleanDate, time, title, category, facilitator]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating weekly override:', error);
    res.status(500).json({ error: 'Failed to create weekly override' });
  }
});

app.put('/api/weekly-overrides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, title, category, facilitator } = req.body;
    
    // Ensure date is stored as date only (without timezone)
    const cleanDate = date.split('T')[0]; // Take only YYYY-MM-DD part
    
    const result = await pool.query(`
      UPDATE overrides_activities
      SET date = $1, time = $2, title = $3, category = $4, facilitator = $5
      WHERE id = $6
      RETURNING *
    `, [cleanDate, time, title, category, facilitator, id]);
    
    if (result.rows.length > 0) {
      // Convert date to Israeli format (dd-mm-yyyy)
      const formattedRow = {
        ...result.rows[0],
        date: result.rows[0].date ? result.rows[0].date.toLocaleDateString('he-IL') : null
      };
      res.json(formattedRow);
    } else {
      res.status(404).json({ error: 'Override not found' });
    }
  } catch (error) {
    console.error('Error updating weekly override:', error);
    res.status(500).json({ error: 'Failed to update weekly override' });
  }
});

app.delete('/api/weekly-overrides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM overrides_activities WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Override not found' });
    }
  } catch (error) {
    console.error('Error deleting weekly override:', error);
    res.status(500).json({ error: 'Failed to delete weekly override' });
  }
});

// ============================================================================
// PHASE 2: ADVANCED SCHEDULE MANAGEMENT - MIGRATED TO POSTGRESQL
// ============================================================================

// Schedule Draft Management
app.post('/api/schedule-draft', async (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Missing name or data' });
    }

    // Remove any existing draft with this name
    await pool.query('DELETE FROM schedule_draft WHERE name = $1', [name]);

    // Insert each day in the draft with the name
    for (const row of data) {
      await pool.query(`
        INSERT INTO schedule_draft (date, weekday, type, guide1_id, guide2_id, name)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [row.date, row.weekday, row.type, row.guide1_id || null, row.guide2_id || null, name]);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error saving schedule draft:', error);
    res.status(500).json({ error: 'Failed to save schedule draft' });
  }
});

app.get('/api/schedule-draft', async (req, res) => {
  try {
    const name = req.query.name;
    let result;

    if (name) {
      // Get specific draft by name
      result = await pool.query('SELECT * FROM schedule_draft WHERE name = $1 ORDER BY date', [name]);
    } else {
      // Get all drafts
      result = await pool.query('SELECT * FROM schedule_draft ORDER BY date');
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule draft:', error);
    res.status(500).json({ error: 'Failed to fetch schedule draft' });
  }
});

// List all unique draft names
app.get('/api/schedule-drafts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT name FROM schedule_draft 
      WHERE name IS NOT NULL AND name != ''
    `);
    const names = result.rows.map(r => r.name);
    res.json(names);
  } catch (error) {
    console.error('Error fetching schedule drafts:', error);
    res.status(500).json({ error: 'Failed to fetch schedule drafts' });
  }
});

// Delete a draft by name
app.delete('/api/schedule-draft', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) {
      return res.status(400).json({ error: 'Missing name parameter' });
    }

    const result = await pool.query('DELETE FROM schedule_draft WHERE name = $1', [name]);
    
    if (result.rowCount > 0) {
      res.json({ ok: true, message: `Draft "${name}" deleted successfully` });
    } else {
      res.status(404).json({ error: 'Draft not found' });
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Official Schedule Management
app.get('/api/schedule', async (req, res) => {
  try {
    const month = req.query.month; // Optional: filter by month
    let query = `
      SELECT 
        s.id,
        s.date, 
        s.weekday, 
        s.type,
        s.guide1_id,
        s.guide2_id,
        s.guide1_role,
        s.guide2_role,
        u1.name as guide1,
        u2.name as guide2,
        s.is_manual,
        s.is_locked,
        s.created_at,
        s.updated_at
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      ORDER BY s.date ASC
    `;
    let params = [];

    if (month) {
      query = `
        SELECT 
          s.id,
          s.date, 
          s.weekday, 
          s.type,
          s.guide1_id,
          s.guide2_id,
          s.guide1_role,
          s.guide2_role,
          u1.name as guide1,
          u2.name as guide2,
          s.is_manual,
          s.is_locked,
          s.created_at,
          s.updated_at
        FROM schedule s
        LEFT JOIN users u1 ON s.guide1_id = u1.id
        LEFT JOIN users u2 ON s.guide2_id = u2.id
        WHERE s.date::text LIKE $1
        ORDER BY s.date ASC
      `;
      params = [month + '%'];
    }

    const result = await pool.query(query, params);
    
    // Convert nulls to empty strings for frontend compatibility and ensure proper date format
    const schedule = result.rows.map(row => ({
      id: row.id,
      date: row.date.toISOString ? row.date.toISOString().split('T')[0] : row.date,
      weekday: row.weekday,
      type: row.type,
      guide1_id: row.guide1_id,
      guide2_id: row.guide2_id,
      guide1: row.guide1 || '',
      guide2: row.guide2 || '',
      guide1_role: row.guide1_role || '',
      guide2_role: row.guide2_role || '',
      is_manual: row.is_manual || false,
      is_locked: row.is_locked || false,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    console.log(`📋 Retrieved ${schedule.length} schedule entries${month ? ` for month ${month}` : ''}`);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Save official schedule (overwrite existing)
app.post('/api/schedule', async (req, res) => {
  try {
    const list = req.body;

    // --- ENFORCE no_oncall RULE ---
    // Load all no_oncall rules from DB
    const noOncallResult = await pool.query("SELECT guide_id FROM scheduling_rules WHERE type = 'no_oncall'");
    const noOncallRules = noOncallResult.rows.map(r => String(r.guide_id));

    // Convert guide names to IDs for validation
    const allGuidesResult = await pool.query('SELECT * FROM users WHERE role = $1', ['מדריך']);
    const guideNameToId = {};
    allGuidesResult.rows.forEach(g => guideNameToId[g.name] = g.id);

    // Validate each day in the schedule
    for (const day of list) {
      if (day.type === 'שבת סגורה' && day.guide1) {
        const guide1Id = guideNameToId[day.guide1];
        if (guide1Id && noOncallRules.includes(String(guide1Id))) {
          return res.status(400).json({
            error: `Guide ${day.guide1} is blocked from on-call assignment on closed Shabbat (שבת סגורה) due to a custom rule.`
          });
        }
      }
    }

    // Delete existing schedule
    await pool.query('DELETE FROM schedule');

    // Insert new schedule
    for (const day of list) {
      const guide1_id = day.guide1 ? guideNameToId[day.guide1] || null : null;
      const guide2_id = day.guide2 ? guideNameToId[day.guide2] || null : null;

      await pool.query(`
        INSERT INTO schedule (date, weekday, type, guide1_id, guide2_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [day.date, day.weekday, day.type, guide1_id, guide2_id]);
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

// Schedule Statistics
app.get('/api/schedule/statistics/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = String(month).padStart(2, '0');

    // Get guide statistics
    const guideStatsResult = await pool.query(`
      SELECT 
        u.id, u.name,
        COALESCE(COUNT(s.id), 0) as total_shifts,
        COALESCE(SUM(CASE WHEN s.is_manual = true THEN 1 ELSE 0 END), 0) as manual_shifts,
        COALESCE(SUM(CASE WHEN s.is_manual = false THEN 1 ELSE 0 END), 0) as auto_shifts,
        COALESCE(SUM(CASE WHEN s.type = 'כונן' THEN 1 ELSE 0 END), 0) as conan_shifts,
        COALESCE(SUM(CASE WHEN s.type = 'מוצ״ש' THEN 1 ELSE 0 END), 0) as motzash_shifts,
        COALESCE(SUM(CASE WHEN s.type = 'חפיפה' THEN 1 ELSE 0 END), 0) as overlap_shifts,
        COALESCE(SUM(CASE WHEN s.type = 'רגיל' THEN 1 ELSE 0 END), 0) as regular_shifts
      FROM users u
      LEFT JOIN schedule s ON (u.id = s.guide1_id OR u.id = s.guide2_id) 
        AND s.date::text LIKE $1
      WHERE u.role = 'מדריך' AND u.is_active = true
      GROUP BY u.id, u.name
      ORDER BY total_shifts DESC, manual_shifts DESC
    `, [`${year}-${monthStr}-%`]);

    // Get day statistics
    const dayStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN guide1_id IS NOT NULL THEN 1 ELSE 0 END) as assigned_days,
        SUM(CASE WHEN guide1_id IS NULL THEN 1 ELSE 0 END) as empty_days,
        SUM(CASE WHEN is_manual = true THEN 1 ELSE 0 END) as manual_days,
        SUM(CASE WHEN is_manual = false THEN 1 ELSE 0 END) as auto_days,
        SUM(CASE WHEN type = 'כונן' THEN 1 ELSE 0 END) as conan_days,
        SUM(CASE WHEN type = 'מוצ״ש' THEN 1 ELSE 0 END) as motzash_days,
        SUM(CASE WHEN type = 'חפיפה' THEN 1 ELSE 0 END) as overlap_days,
        SUM(CASE WHEN type = 'רגיל' THEN 1 ELSE 0 END) as regular_days
      FROM schedule 
      WHERE date::text LIKE $1
    `, [`${year}-${monthStr}-%`]);

    // Get weekend statistics
    const weekendStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_weekends,
        SUM(CASE WHEN is_closed = true THEN 1 ELSE 0 END) as closed_saturdays,
        SUM(CASE WHEN is_closed = false THEN 1 ELSE 0 END) as open_saturdays
      FROM weekend_types 
      WHERE date::text LIKE $1
    `, [`${year}-${monthStr}-%`]);

    res.json({
      success: true,
      guide_statistics: guideStatsResult.rows,
      day_statistics: dayStatsResult.rows[0] || {},
      weekend_statistics: weekendStatsResult.rows[0] || {}
    });

  } catch (error) {
    console.error('Error getting scheduling statistics:', error);
    res.status(500).json({ error: 'Failed to get scheduling statistics' });
  }
});

// Enhanced Statistics API Endpoint
app.get('/api/schedule/enhanced-statistics/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = String(month).padStart(2, '0');
    console.log(`🔍 Fetching enhanced statistics for ${year}-${monthStr}`);
    
    // Get all guides
    const guidesResult = await pool.query(`
      SELECT * FROM users 
      WHERE role = 'מדריך' AND is_active = true
      ORDER BY name
    `);
    
    // Get schedule data for the month - try official schedule first, fallback to regular schedule
    let schedule = [];
    
    // Try to get official schedule first
    const officialScheduleResult = await pool.query(`
      SELECT schedule_data 
      FROM official_schedules 
      WHERE month = $1 
      ORDER BY version DESC 
      LIMIT 1
    `, [`${year}-${monthStr}`]);
    
    if (officialScheduleResult.rows.length > 0 && officialScheduleResult.rows[0].schedule_data) {
      try {
        const officialData = JSON.parse(officialScheduleResult.rows[0].schedule_data);
        schedule = officialData.map(item => ({
          date: item.date,
          guide1_id: item.guide1_id,
          guide1_name: item.guide1_name,
          guide1_role: item.guide1_role || (item.type === 'כונן' ? 'כונן' : item.type === 'מוצ״ש' ? 'מוצ״ש' : 'רגיל'),
          guide2_id: item.guide2_id,
          guide2_name: item.guide2_name,
          guide2_role: item.guide2_role || (item.type === 'מוצ״ש' && item.guide2_id ? 'מוצ״ש' : item.type === 'חפיפה' ? 'חפיפה' : null),
          is_manual: item.is_manual || false,
          is_locked: item.is_locked || false
        }));
        console.log(`✅ Using official schedule for ${year}-${monthStr} with ${schedule.length} assignments`);
      } catch (e) {
        console.log(`❌ Error parsing official schedule: ${e.message}`);
      }
    }
    
    // Fallback to regular schedule if no official schedule found
    if (schedule.length === 0) {
      const scheduleResult = await pool.query(`
        SELECT 
          s.*,
          u1.name as guide1_name,
          u2.name as guide2_name
        FROM schedule s
        LEFT JOIN users u1 ON s.guide1_id = u1.id
        LEFT JOIN users u2 ON s.guide2_id = u2.id
        WHERE s.date::text LIKE $1
        ORDER BY s.date
      `, [`${year}-${monthStr}-%`]);
      
      schedule = scheduleResult.rows;
      console.log(`📋 Using regular schedule for ${year}-${monthStr} with ${schedule.length} assignments`);
    }
    
    // Get weekend types for accurate hour calculations
    const weekendTypesResult = await pool.query(`
      SELECT date, is_closed 
      FROM weekend_types 
      WHERE date::text LIKE $1
    `, [`${year}-${monthStr}-%`]);
    
    const weekendTypes = {};
    weekendTypesResult.rows.forEach(row => {
      weekendTypes[row.date] = row.is_closed;
    });
    console.log(`Found ${weekendTypesResult.rows.length} weekend types`);
    
    // Calculate detailed statistics for each guide
    const guideStatistics = guidesResult.rows.map(guide => {
      const stats = calculateGuideStatisticsPG(schedule, guide.id, year, month, weekendTypes);
      return {
        id: guide.id,
        name: guide.name,
        ...stats
      };
    });
    
    // Calculate day statistics
    const dayStatistics = calculateDayStatisticsPG(schedule, year, month);
    
    // Calculate averages
    const totalShifts = guideStatistics.reduce((sum, guide) => sum + guide.total_shifts, 0);
    const activeGuides = guideStatistics.filter(guide => guide.total_shifts > 0).length;
    const averages = {
      shifts_per_guide: activeGuides > 0 ? totalShifts / activeGuides : 0,
      total_guides: guidesResult.rows.length,
      active_guides: activeGuides
    };
    
    // Generate recommendations
    const recommendations = generateRecommendationsPG(guideStatistics, averages);
    
    // Calculate balance metrics
    const balanceMetrics = calculateBalanceMetricsPG(guideStatistics);
    
    res.json({
      success: true,
      guide_statistics: guideStatistics,
      day_statistics: dayStatistics,
      averages: averages,
      recommendations: recommendations,
      balance_metrics: balanceMetrics,
      month: `${year}-${monthStr}`,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating enhanced statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhanced statistics',
      details: error.message
    });
  }
});

// Helper functions for enhanced statistics
function generateRecommendationsPG(guideStatistics, averages) {
  const recommendations = [];
  
  // Check for workload imbalance
  const overworked = guideStatistics.filter(g => g.total_shifts > averages.shifts_per_guide + 2);
  const underworked = guideStatistics.filter(g => g.total_shifts < averages.shifts_per_guide - 2 && g.total_shifts > 0);
  
  if (overworked.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'עומס עבודה לא מאוזן',
      message: `${overworked.length} מדריכים עם עומס גבוה מדי`,
      guides: overworked.map(g => g.name)
    });
  }
  
  if (underworked.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'הזדמנות לאיזון',
      message: `${underworked.length} מדריכים עם עומס נמוך`,
      guides: underworked.map(g => g.name)
    });
  }
  
  return recommendations;
}

function calculateBalanceMetricsPG(guideStatistics) {
  const shifts = guideStatistics.map(g => g.total_shifts).filter(s => s > 0);
  
  if (shifts.length === 0) {
    return { standard_deviation: 0, gini_coefficient: 0 };
  }
  
  const mean = shifts.reduce((sum, s) => sum + s, 0) / shifts.length;
  const variance = shifts.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / shifts.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Simple Gini coefficient calculation
  const sorted = [...shifts].sort((a, b) => a - b);
  let giniSum = 0;
  for (let i = 0; i < sorted.length; i++) {
    giniSum += (2 * (i + 1) - sorted.length - 1) * sorted[i];
  }
  const giniCoefficient = giniSum / (sorted.length * sorted.reduce((sum, s) => sum + s, 0));
  
  return {
    standard_deviation: standardDeviation,
    gini_coefficient: giniCoefficient
  };
}

// Schedule Issues Detection
app.get('/api/schedule/issues/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthStr = String(month).padStart(2, '0');
    const issues = [];

    // Check for empty days
    const emptyDaysResult = await pool.query(`
      SELECT all_days.date, all_days.weekday
      FROM (
        SELECT 
          date,
          CASE 
            WHEN EXTRACT(DOW FROM date) = 0 THEN 'ראשון'
            WHEN EXTRACT(DOW FROM date) = 1 THEN 'שני'
            WHEN EXTRACT(DOW FROM date) = 2 THEN 'שלישי'
            WHEN EXTRACT(DOW FROM date) = 3 THEN 'רביעי'
            WHEN EXTRACT(DOW FROM date) = 4 THEN 'חמישי'
            WHEN EXTRACT(DOW FROM date) = 5 THEN 'שישי'
            WHEN EXTRACT(DOW FROM date) = 6 THEN 'שבת'
          END as weekday
        FROM generate_series(
          DATE($1),
          DATE($1) + INTERVAL '1 month' - INTERVAL '1 day',
          INTERVAL '1 day'
        ) as date
      ) all_days
      LEFT JOIN schedule s ON all_days.date = s.date
      WHERE s.date IS NULL
      ORDER BY all_days.date
    `, [`${year}-${monthStr}-01`]);

    if (emptyDaysResult.rows.length > 0) {
      issues.push({
        type: 'empty_days',
        count: emptyDaysResult.rows.length,
        days: emptyDaysResult.rows
      });
    }

    // Check for consecutive assignments (potential overwork)
    const consecutiveResult = await pool.query(`
      WITH consecutive_assignments AS (
        SELECT 
          s1.guide1_id,
          s1.date as date1,
          s2.date as date2,
          s2.date - s1.date as days_between
        FROM schedule s1
        JOIN schedule s2 ON s1.guide1_id = s2.guide1_id 
          AND s2.date > s1.date 
          AND s2.date <= s1.date + INTERVAL '7 days'
        WHERE s1.date::text LIKE $1
      )
      SELECT 
        u.name as guide_name,
        COUNT(*) as consecutive_count,
        MIN(date1) as first_date,
        MAX(date2) as last_date
      FROM consecutive_assignments ca
      JOIN users u ON ca.guide1_id = u.id
      WHERE days_between <= 2
      GROUP BY u.id, u.name
      HAVING COUNT(*) >= 3
      ORDER BY consecutive_count DESC
    `, [`${year}-${monthStr}-%`]);

    if (consecutiveResult.rows.length > 0) {
      issues.push({
        type: 'consecutive_assignments',
        count: consecutiveResult.rows.length,
        guides: consecutiveResult.rows
      });
    }

    // Check for weekend type conflicts
    const weekendConflictsResult = await pool.query(`
      SELECT 
        s.date,
        s.weekday,
        wt.is_closed,
        CASE 
          WHEN wt.is_closed = true AND s.guide1_id IS NOT NULL THEN 'Closed Saturday with assignment'
          WHEN wt.is_closed = false AND s.guide1_id IS NULL THEN 'Open Saturday without assignment'
          ELSE NULL
        END as conflict_type
      FROM schedule s
      LEFT JOIN weekend_types wt ON s.date = wt.date
      WHERE s.date::text LIKE $1 
        AND s.weekday IN ('שישי', 'שבת')
        AND (
          (wt.is_closed = true AND s.guide1_id IS NOT NULL) OR
          (wt.is_closed = false AND s.guide1_id IS NULL)
        )
    `, [`${year}-${monthStr}-%`]);

    if (weekendConflictsResult.rows.length > 0) {
      issues.push({
        type: 'weekend_conflicts',
        count: weekendConflictsResult.rows.length,
        conflicts: weekendConflictsResult.rows
      });
    }

    res.json({
      success: true,
      issues: issues,
      total_issues: issues.reduce((sum, issue) => sum + issue.count, 0)
    });

  } catch (error) {
    console.error('Error getting schedule issues:', error);
    res.status(500).json({ error: 'Failed to get schedule issues' });
  }
});

// ============================================================================
// PHASE 1: CORE USER & AUTHENTICATION - MIGRATED TO POSTGRESQL
// ============================================================================

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { username, password } = req.body;
    
    const result = await pool.query(`
      SELECT id, name, role, house_id, email, phone, is_active, accessible_houses
      FROM users 
      WHERE name = $1 AND password = $2 AND is_active = true
    `, [username, password]);
    
    console.log('📊 Login query result:', result.rows.length, 'rows');
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const response = {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          house: user.house_id,
          email: user.email,
          phone: user.phone,
          accessible_houses: user.accessible_houses
        }
      };
      console.log('✅ Login successful for:', user.name);
      res.json(response);
    } else {
      console.log('❌ Login failed - invalid credentials');
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get all users
app.get('/api/guides', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, role, house_id, email, phone, is_active, created_at, updated_at
      FROM users
      WHERE role = 'מדריך'
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get all users (including coordinators)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, role, house_id, email, phone, is_active, created_at, updated_at
      FROM users
      ORDER BY role, name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
app.post('/api/guides', async (req, res) => {
  try {
    const { name, role, house_id, email, phone, password } = req.body;
    
    const result = await pool.query(`
      INSERT INTO users (name, role, house_id, email, phone, password, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING *
    `, [name, role, house_id, email, phone, password]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating guide:', error);
    res.status(500).json({ error: 'Failed to create guide' });
  }
});

// Update user
app.put('/api/guides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, house_id, email, phone, password } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, role = $2, house_id = $3, email = $4, phone = $5, 
          password = COALESCE($6, password), updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [name, role, house_id, email, phone, password, id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Guide not found' });
    }
  } catch (error) {
    console.error('Error updating guide:', error);
    res.status(500).json({ error: 'Failed to update guide' });
  }
});

// Delete user
app.delete('/api/guides/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM users WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Guide deleted successfully' });
    } else {
      res.status(404).json({ error: 'Guide not found' });
    }
  } catch (error) {
    console.error('Error deleting guide:', error);
    res.status(500).json({ error: 'Failed to delete guide' });
  }
});

// ============================================================================
// PHASE 1: CORE API ENDPOINTS - MIGRATED TO POSTGRESQL
// ============================================================================

// Get all guides with enhanced statistics
app.get('/api/guides/enhanced', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        u.house_id as house,
        u.email,
        u.phone,
        u.is_active as status,
        u.created_at,
        u.updated_at,
        COALESCE(u.accessible_houses, '{}'::jsonb) as metadata,
        COUNT(s.id) as total_shifts,
        COUNT(CASE WHEN s.guide1_role = 'מדריך ראשי' THEN 1 END) as lead_shifts,
        COUNT(CASE WHEN s.guide2_role = 'מדריך שני' THEN 1 END) as second_shifts
      FROM users u
      LEFT JOIN schedule s ON u.id = s.guide1_id OR u.id = s.guide2_id
      WHERE u.role = 'מדריך' AND u.is_active = true
      GROUP BY u.id, u.name, u.role, u.house_id, u.email, u.phone, u.is_active, u.created_at, u.updated_at, u.accessible_houses
      ORDER BY u.name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get monthly schedule
app.get('/api/schedule/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await pool.query(`
      SELECT 
        s.*,
        u1.name as guide1_name,
        u2.name as guide2_name,
        CASE 
          WHEN wt.is_closed = true THEN 'closed'
          ELSE 'regular'
        END as weekend_type
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      LEFT JOIN weekend_types wt ON s.date = wt.date
      WHERE EXTRACT(YEAR FROM s.date) = $1 
        AND EXTRACT(MONTH FROM s.date) = $2
      ORDER BY s.date
    `, [year, month]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create manual assignment
app.post('/api/schedule/manual', async (req, res) => {
  try {
    const { date, guide1_id, guide2_id, role1, role2, notes } = req.body;
    
    const result = await pool.query(`
      INSERT INTO schedule (date, guide1_id, guide2_id, role1, role2, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [date, guide1_id, guide2_id, role1, role2, notes]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating manual assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get guide availability for a specific date - Enhanced with Traffic Light System
app.get('/api/guides/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const weekdayNum = new Date(date).getDay();
    
    console.log(`🚦 Fetching enhanced availability for ${date}`);
    
    // Get comprehensive availability data
    const result = await pool.query(`
      SELECT 
        u.id as guide_id,
        u.name as guide_name,
        u.role as guide_role,
        u.house_id as house,
        c.id as constraint_id,
        c.details as constraint_details,
        fc.id as fixed_constraint_id,
        fc.details as fixed_constraint_details,
        v.id as vacation_id,
        v.note as vacation_note,
        consecutive_prev.id as consecutive_prev_id,
        consecutive_next.id as consecutive_next_id,
        cr_no_auto.id as coordinator_rule_no_auto_id,
        cr_no_conan.id as coordinator_rule_no_conan_id
      FROM users u
      LEFT JOIN constraints c ON u.id = c.user_id AND c.date = $1
      LEFT JOIN fixed_constraints fc ON u.id = fc.user_id AND fc.weekday = $2
      LEFT JOIN vacations v ON u.id = v.user_id AND $1 BETWEEN v.date_start AND v.date_end AND v.status = 'approved'
      LEFT JOIN schedule consecutive_prev ON (consecutive_prev.guide1_id = u.id OR consecutive_prev.guide2_id = u.id) 
        AND consecutive_prev.date = $1::date - INTERVAL '1 day'
      LEFT JOIN schedule consecutive_next ON (consecutive_next.guide1_id = u.id OR consecutive_next.guide2_id = u.id) 
        AND consecutive_next.date = $1::date + INTERVAL '1 day'
      LEFT JOIN coordinator_rules cr_no_auto ON u.id = cr_no_auto.guide1_id AND cr_no_auto.rule_type = 'no_auto_scheduling' AND cr_no_auto.is_active = true
      LEFT JOIN coordinator_rules cr_no_conan ON u.id = cr_no_conan.guide1_id AND cr_no_conan.rule_type = 'no_conan' AND cr_no_conan.is_active = true
      WHERE u.role = 'מדריך' AND u.is_active = true
      ORDER BY u.name
    `, [date, weekdayNum]);
    
    // Get workload statistics for each guide
    const workloadResult = await pool.query(`
      SELECT 
        guide_id,
        COUNT(*) as total_shifts,
        COUNT(CASE WHEN EXTRACT(DOW FROM date) IN (5, 6) THEN 1 END) as weekend_shifts,
        COUNT(CASE WHEN guide1_role = 'כונן' OR guide2_role = 'כונן' THEN 1 END) as standby_shifts,
        MAX(date) as last_shift_date
      FROM (
        SELECT guide1_id as guide_id, date, guide1_role, guide2_role FROM schedule WHERE guide1_id IS NOT NULL
        UNION ALL
        SELECT guide2_id as guide_id, date, guide1_role, guide2_role FROM schedule WHERE guide2_id IS NOT NULL
      ) shifts
      WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM $1::date)
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM $1::date)
      GROUP BY guide_id
    `, [date]);
    
    const workloadStats = {};
    workloadResult.rows.forEach(row => {
      workloadStats[row.guide_id] = row;
    });
    
    // Calculate traffic light status for each guide
    const enhancedAvailability = result.rows.map(guide => {
      const workload = workloadStats[guide.guide_id] || { 
        total_shifts: 0, 
        weekend_shifts: 0, 
        standby_shifts: 0, 
        last_shift_date: null 
      };
      
      const trafficLightData = calculateTrafficLightStatusPG(guide, workload, date);
      
      return {
        ...guide,
        status: trafficLightData.available ? 'available' : 'blocked',
        availability_status: trafficLightData.status, // green, yellow, red
        traffic_light_reason: trafficLightData.reason,
        total_shifts: workload.total_shifts,
        weekend_shifts: workload.weekend_shifts,
        standby_shifts: workload.standby_shifts,
        last_shift_date: workload.last_shift_date
      };
    });
    
    console.log(`✅ Enhanced availability calculated for ${enhancedAvailability.length} guides`);
    res.json(enhancedAvailability);
    
  } catch (error) {
    console.error('Error fetching enhanced guide availability:', error);
    res.status(500).json({ error: 'Failed to fetch enhanced availability' });
  }
});

// ============================================================================
// PHASE 2: TRAFFIC LIGHT SYSTEM FUNCTIONS
// ============================================================================

function calculateTrafficLightStatusPG(guide, workload, date) {
  // Check hard constraints first (RED status)
  
  // Personal constraints
  if (guide.constraint_id) {
    return {
      available: false,
      status: 'red',
      reason: 'אילוץ אישי'
    };
  }
  
  // Fixed constraints (weekly recurring)
  if (guide.fixed_constraint_id) {
    return {
      available: false,
      status: 'red', 
      reason: 'אילוץ קבוע שבועי'
    };
  }
  
  // Vacations
  if (guide.vacation_id) {
    return {
      available: false,
      status: 'red',
      reason: 'חופשה'
    };
  }
  
  // Coordinator rules - no auto scheduling
  if (guide.coordinator_rule_no_auto_id) {
    return {
      available: false,
      status: 'red',
      reason: 'חוק רכז - לא באוטומטי'
    };
  }
  
  // Consecutive days rule
  if (guide.consecutive_prev_id) {
    return {
      available: false,
      status: 'red',
      reason: 'עבד אתמול (חוק ימים ברצף)'
    };
  }
  
  // Check workload constraints (RED to YELLOW)
  
  // Excessive workload (RED)
  if (workload.total_shifts > 12) {
    return {
      available: false,
      status: 'red',
      reason: `עומס גבוה מדי (${workload.total_shifts} משמרות)`
    };
  }
  
  // High workload (YELLOW) 
  if (workload.total_shifts > 8) {
    return {
      available: true,
      status: 'yellow',
      reason: `עומס בינוני (${workload.total_shifts} משמרות)`
    };
  }
  
  // Too many standby shifts (YELLOW)
  if (workload.standby_shifts >= 2) {
    return {
      available: true,
      status: 'yellow',
      reason: `הרבה כוננויות (${workload.standby_shifts})`
    };
  }
  
  // Recent work (YELLOW)
  if (workload.last_shift_date) {
    const lastShift = new Date(workload.last_shift_date);
    const currentDate = new Date(date);
    const diffDays = Math.ceil((currentDate - lastShift) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays > 1) {
      return {
        available: true,
        status: 'yellow',
        reason: `עבד לפני ${diffDays} ימים`
      };
    }
  }
  
  // All good - GREEN status
  return {
    available: true,
    status: 'green',
    reason: 'זמין - מומלץ'
  };
}

// Get weekend type for a date
app.get('/api/weekend-type/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(`
      SELECT is_closed FROM weekend_types WHERE date = $1
    `, [date]);
    
    const is_closed = result.rows[0]?.is_closed ? 1 : 0;
    res.json({ is_closed });
  } catch (error) {
    console.error('Error fetching weekend type:', error);
    res.status(500).json({ error: 'Failed to fetch weekend type' });
  }
});

// Set weekend type for a date
app.post('/api/weekend-type/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { is_closed } = req.body;
    
    const is_closed_bool = is_closed === 1 || is_closed === true;
    
    const result = await pool.query(`
      INSERT INTO weekend_types (date, is_closed, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (date) DO UPDATE SET 
        is_closed = EXCLUDED.is_closed
      RETURNING *
    `, [date, is_closed_bool]);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error setting weekend type:', error);
    res.status(500).json({ error: 'Failed to set weekend type' });
  }
});

// Get constraints
app.get('/api/constraints', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.user_id as guideId,
        c.type,
        c.date,
        c.details as note,
        c.created_at,
        u.name as user_name
      FROM constraints c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.date DESC
    `);
    
    // Transform the data to match frontend expectations
    const transformedData = result.rows.map(row => ({
      id: row.id,
      guideId: row.guideid,
      type: row.type,
      date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      note: row.note || '',
      hourStart: null, // These fields don't exist in our schema
      hourEnd: null,   // These fields don't exist in our schema
      created_at: row.created_at,
      user_name: row.user_name
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching constraints:', error);
    res.status(500).json({ error: 'Failed to fetch constraints' });
  }
});

// Create constraint
app.post('/api/constraints', async (req, res) => {
  try {
    const { user_id, type, date, details } = req.body;
    
    const result = await pool.query(`
      INSERT INTO constraints (user_id, type, date, details, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [user_id, type, date, details]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating constraint:', error);
    res.status(500).json({ error: 'Failed to create constraint' });
  }
});

// Update constraint
app.put('/api/constraints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, type, date, details } = req.body;
    
    const result = await pool.query(`
      UPDATE constraints 
      SET user_id = $1, type = $2, date = $3, details = $4
      WHERE id = $5
      RETURNING *
    `, [user_id, type, date, details, id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Constraint not found' });
    }
  } catch (error) {
    console.error('Error updating constraint:', error);
    res.status(500).json({ error: 'Failed to update constraint' });
  }
});

// Delete constraint
app.delete('/api/constraints/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM constraints WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Constraint deleted successfully' });
    } else {
      res.status(404).json({ error: 'Constraint not found' });
    }
  } catch (error) {
    console.error('Error deleting constraint:', error);
    res.status(500).json({ error: 'Failed to delete constraint' });
  }
});

// Get coordinator rules
app.get('/api/coordinator-rules', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cr.*,
        u1.name as guide1_name,
        u2.name as guide2_name
      FROM coordinator_rules cr
      LEFT JOIN users u1 ON cr.guide1_id = u1.id
      LEFT JOIN users u2 ON cr.guide2_id = u2.id
      ORDER BY cr.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching coordinator rules:', error);
    res.status(500).json({ error: 'Failed to fetch coordinator rules' });
  }
});

// Create coordinator rule
app.post('/api/coordinator-rules', async (req, res) => {
  try {
    const { guide1_id, guide2_id, rule_type, description, created_by } = req.body;
    
    const result = await pool.query(`
      INSERT INTO coordinator_rules (guide1_id, guide2_id, rule_type, description, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [guide1_id, guide2_id, rule_type, description, created_by]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating coordinator rule:', error);
    res.status(500).json({ error: 'Failed to create coordinator rule' });
  }
});

// Update coordinator rule
app.put('/api/coordinator-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { guide1_id, guide2_id, rule_type, description } = req.body;
    
    const result = await pool.query(`
      UPDATE coordinator_rules 
      SET guide1_id = $1, guide2_id = $2, rule_type = $3, description = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [guide1_id, guide2_id, rule_type, description, id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Coordinator rule not found' });
    }
  } catch (error) {
    console.error('Error updating coordinator rule:', error);
    res.status(500).json({ error: 'Failed to update coordinator rule' });
  }
});

// Delete coordinator rule
app.delete('/api/coordinator-rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      DELETE FROM coordinator_rules WHERE id = $1
    `, [id]);
    
    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Coordinator rule deleted successfully' });
    } else {
      res.status(404).json({ error: 'Coordinator rule not found' });
    }
  } catch (error) {
    console.error('Error deleting coordinator rule:', error);
    res.status(500).json({ error: 'Failed to delete coordinator rule' });
  }
});

// ============================================================================
// PHASE 1: BASIC SCHEDULE MANAGEMENT - MIGRATED TO POSTGRESQL
// ============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: 'PostgreSQL',
    timestamp: new Date().toISOString(),
    message: 'Sigalit PostgreSQL Backend is running'
  });
});

// Clear month schedule
app.delete('/api/schedule/clear-month', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const result = await pool.query(`
      DELETE FROM schedule 
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
    `, [year, month]);
    
    res.json({ 
      success: true, 
      message: `Cleared ${result.rowCount} assignments for ${year}-${month}`,
      deleted_count: result.rowCount
    });
  } catch (error) {
    console.error('Error clearing month schedule:', error);
    res.status(500).json({ error: 'Failed to clear month schedule' });
  }
});

// Get enhanced schedule with more details
app.get('/api/schedule/enhanced/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await pool.query(`
      SELECT 
        s.*,
        u1.name as guide1_name,
        u2.name as guide2_name,
        wt.is_closed as weekend_closed,
        CASE 
          WHEN wt.is_closed = true THEN 'closed'
          ELSE 'regular'
        END as weekend_type
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      LEFT JOIN weekend_types wt ON s.date = wt.date
      WHERE EXTRACT(YEAR FROM s.date) = $1 
        AND EXTRACT(MONTH FROM s.date) = $2
      ORDER BY s.date
    `, [year, month]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching enhanced schedule:', error);
    res.status(500).json({ error: 'Failed to fetch enhanced schedule' });
  }
});

// Get assignment types
app.get('/api/assignment-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignment_types WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assignment types:', error);
    res.status(500).json({ error: 'Failed to fetch assignment types' });
  }
});

// Get shift types
app.get('/api/shift-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shift_types WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shift types:', error);
    res.status(500).json({ error: 'Failed to fetch shift types' });
  }
});

// Initialize default assignment and shift types if they don't exist
async function initializeDefaultTypes() {
  try {
    // Add missing assignment types (רגיל already exists)
    console.log('Ensuring all required assignment types exist...');
    await pool.query(`
      INSERT INTO assignment_types (name, description, hours_per_shift, salary_factor) VALUES
      ('חפיפה', 'משמרת חפיפה - 09:00 עד 10:00 למחרת', 25, 1.0),
      ('כונן', 'כונן שבת סגורה - שישי 09:00 עד שבת 17:00', 32, 1.0),
      ('מוצ״ש', 'מוצאי שבת - שבת 17:00 עד ראשון 09:00', 16, 1.0)
      ON CONFLICT (name) DO NOTHING
    `);

    // Add missing shift types with correct Hebrew role names
    console.log('Ensuring all required shift types exist...');
    await pool.query(`
      INSERT INTO shift_types (name, description, guides_required, roles_required) VALUES
      ('weekday', 'יום חול רגיל', 2, '["רגיל", "חפיפה"]'::jsonb),
      ('weekend_open', 'סוף שבוע פתוח', 2, '["רגיל", "חפיפה"]'::jsonb),
      ('weekend_closed', 'סוף שבוע סגור', 1, '["כונן"]'::jsonb),
      ('holiday', 'חג', 2, '["רגיל", "חפיפה"]'::jsonb)
      ON CONFLICT (name) DO NOTHING
    `);
    
    console.log('✅ Required assignment and shift types initialized');
  } catch (error) {
    console.error('Error initializing default types:', error);
  }
}

// ============================================================================
// WORKFLOW MANAGEMENT SYSTEM - POSTGRESQL VERSION
// ============================================================================

// Get workflow status for a month
app.get('/api/workflow/status/:month', async (req, res) => {
  try {
    const { month } = req.params;
    
    const statusResult = await pool.query('SELECT * FROM workflow_status WHERE month = $1', [month]);
    const status = statusResult.rows[0];
    
    if (!status) {
      return res.json({
        month: month,
        current_draft_version: 0,
        is_finalized: false,
        can_edit: true,
        drafts_available: [],
        last_email_sent: null
      });
    }
    
    // Get available drafts
    const draftsResult = await pool.query(`
      SELECT d.version, d.name, d.created_at, d.created_by, u.name as created_by_name
      FROM drafts d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.month = $1
      ORDER BY d.version DESC
    `, [month]);
    
    res.json({
      month: month,
      current_draft_version: status.current_draft_version,
      is_finalized: status.is_finalized,
      can_edit: !status.is_finalized,
      drafts_available: draftsResult.rows,
      finalized_at: status.finalized_at,
      finalized_by: status.finalized_by,
      last_email_sent: status.last_email_sent
    });
    
  } catch (error) {
    console.error('Error getting workflow status:', error);
    res.status(500).json({ error: 'Failed to get workflow status' });
  }
});

// Create first draft
app.post('/api/workflow/create-draft/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const { created_by = 1, notes = '' } = req.body;
    
    // Check if month is finalized
    const statusResult = await pool.query('SELECT * FROM workflow_status WHERE month = $1', [month]);
    const status = statusResult.rows[0];
    
    if (status && status.is_finalized) {
      return res.status(400).json({ error: 'Month is already finalized' });
    }
    
    // Get current schedule as the first draft
    const scheduleResult = await pool.query(`
      SELECT 
        s.date, s.weekday, s.type,
        s.guide1_id, s.guide2_id, s.guide1_role, s.guide2_role,
        u1.name as guide1_name, u2.name as guide2_name
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      WHERE s.date::text LIKE $1
      ORDER BY s.date
    `, [month + '%']);
    
    const scheduleData = scheduleResult.rows;
    const version = status ? status.current_draft_version + 1 : 1;
    
    // Create draft entry
    await pool.query(`
      INSERT INTO drafts (month, version, name, schedule_data, created_by, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      month, 
      version, 
      `Draft ${version}`, 
      JSON.stringify(scheduleData), 
      created_by, 
      notes
    ]);
    
    // Update workflow status
    await pool.query(`
      INSERT INTO workflow_status (month, current_draft_version, is_finalized)
      VALUES ($1, $2, false)
      ON CONFLICT (month) DO UPDATE SET current_draft_version = $2
    `, [month, version]);
    
    // Log to history
    await pool.query(`
      INSERT INTO schedule_history (month, schedule_type, version, schedule_data, created_by, action, notes)
      VALUES ($1, 'draft', $2, $3, $4, 'created', $5)
    `, [month, version, JSON.stringify(scheduleData), created_by, notes]);
    
    res.json({ 
      success: true, 
      version: version, 
      message: `Draft version ${version} created successfully` 
    });
    
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// Finalize schedule
app.post('/api/workflow/finalize/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const { finalized_by = 1, notes = '' } = req.body;
    
    // Get current draft
    const draftResult = await pool.query(`
      SELECT * FROM drafts WHERE month = $1 ORDER BY version DESC LIMIT 1
    `, [month]);
    
    if (draftResult.rows.length === 0) {
      return res.status(400).json({ error: 'No draft available to finalize' });
    }
    
    const draft = draftResult.rows[0];
    
    // Create official schedule
    await pool.query(`
      INSERT INTO official_schedules (month, version, schedule_data, created_by, status, notes)
      VALUES ($1, $2, $3, $4, 'active', $5)
    `, [month, draft.version, draft.schedule_data, finalized_by, notes]);
    
    // Update workflow status
    await pool.query(`
      UPDATE workflow_status 
      SET is_finalized = true, finalized_at = CURRENT_TIMESTAMP, finalized_by = $2
      WHERE month = $1
    `, [month, finalized_by]);
    
    // Log to history
    await pool.query(`
      INSERT INTO schedule_history (month, schedule_type, version, schedule_data, created_by, action, notes)
      VALUES ($1, 'official', $2, $3, $4, 'finalized', $5)
    `, [month, draft.version, draft.schedule_data, finalized_by, notes]);
    
    res.json({ 
      success: true, 
      message: `Schedule for ${month} finalized successfully`,
      version: draft.version
    });
    
  } catch (error) {
    console.error('Error finalizing schedule:', error);
    res.status(500).json({ error: 'Failed to finalize schedule' });
  }
});

// ============================================================================
// AUTO-SCHEDULING ALGORITHM - MIGRATED TO POSTGRESQL
// ============================================================================

// Enhanced auto-scheduling endpoint - Complete Algorithm (with path parameters)
app.post('/api/schedule/auto-schedule-enhanced/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { options = {} } = req.body;
    
    console.log(`🚀 Starting complete auto-scheduling for ${year}-${month} with options:`, options);
    
    // Run the complete auto-scheduling algorithm
    const result = await runCompleteAutoSchedulingPG(parseInt(year), parseInt(month), options);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Auto-scheduling completed: ${result.stats.assigned} assignments created`,
        stats: result.stats,
        warnings: result.warnings,
        assignments: result.assignments
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error,
        warnings: result.warnings || []
      });
    }
  } catch (error) {
    console.error('Error in auto-scheduling:', error);
    res.status(500).json({ error: 'Auto-scheduling failed', details: error.message });
  }
});

// Enhanced auto-scheduling endpoint - Complete Algorithm (with body parameters)
app.post('/api/schedule/auto-schedule-enhanced', async (req, res) => {
  try {
    const { year, month, options = {} } = req.body;
    
    console.log(`🚀 Starting complete auto-scheduling for ${year}-${month} with options:`, options);
    
    // Run the complete auto-scheduling algorithm
    const result = await runCompleteAutoSchedulingPG(parseInt(year), parseInt(month), options);
    
    if (result.success) {
      res.json({
        success: true,
        message: `Auto-scheduling completed: ${result.stats.assigned} assignments created`,
        stats: result.stats,
        warnings: result.warnings,
        assignments: result.assignments
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error,
        warnings: result.warnings || []
      });
    }
  } catch (error) {
    console.error('Error in auto-scheduling:', error);
    res.status(500).json({ error: 'Auto-scheduling failed', details: error.message });
  }
});

// Legacy endpoint for backwards compatibility
app.post('/api/schedule/auto-schedule/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    console.log(`Starting auto-scheduling for ${year}-${month}`);
    
    const result = await runCompleteAutoSchedulingPG(parseInt(year), parseInt(month));
    
    if (result.success) {
      res.json({
        success: true,
        message: `Auto-scheduling completed: ${result.stats.assigned} assignments created`,
        stats: result.stats,
        warnings: result.warnings,
        assignments: result.assignments
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error,
        warnings: result.warnings || []
      });
    }
  } catch (error) {
    console.error('Auto-scheduling error:', error);
    res.status(500).json({ error: 'Auto-scheduling failed', details: error.message });
  }
});

// ============================================================================
// AUTO-SCHEDULING ALGORITHM FUNCTIONS
// ============================================================================

// ============================================================================
// MAIN AUTO-SCHEDULING FUNCTION - COMPLETE POSTGRESQL VERSION
// ============================================================================

async function runCompleteAutoSchedulingPG(year, month, options = {}) {
  try {
    console.log(`Initializing complete auto-scheduling for ${year}-${month}`);
    
    // Phase 1: Prepare all data
    const context = await prepareSchedulingDataPG(year, month);
    console.log(`Loaded ${context.guides.length} guides, ${context.days.length} days`);
    
    // Phase 2: Process each day
    const assignments = [];
    const warnings = [];
    
    // Initialize assignments array in context
    context.assignments = assignments;
    
    for (const dayInfo of context.days) {
      console.log(`Processing ${dayInfo.date} (${dayInfo.weekday})`);
      
      try {
        const assignment = await assignDayOptimalPG(dayInfo, context);
        if (assignment) {
          assignments.push(assignment);
          updateContextWithAssignmentPG(context, assignment);
          console.log(`✓ Assigned ${dayInfo.date}: ${assignment.guide1_name || 'none'} + ${assignment.guide2_name || 'none'}`);
        } else {
          warnings.push({
            type: 'assignment_failed',
            date: dayInfo.date,
            message: `Failed to assign guides for ${dayInfo.date}`
          });
          console.log(`✗ Failed to assign ${dayInfo.date}`);
        }
      } catch (error) {
        console.error(`Error assigning ${dayInfo.date}:`, error);
        warnings.push({
          type: 'assignment_error',
          date: dayInfo.date,
          message: `Error assigning ${dayInfo.date}: ${error.message}`
        });
      }
    }
    
    // Phase 3: Save to database
    await saveAssignmentsToDatabasePG(assignments, year, month, context.guides);
    
    // Phase 4: Generate statistics
    const stats = generateFinalStatisticsPG(context, assignments);
    
    return {
      success: true,
      assignments,
      warnings,
      stats
    };
    
  } catch (error) {
    console.error('Error in complete auto-scheduling:', error);
    return {
      success: false,
      error: error.message,
      warnings: []
    };
  }
}

// ============================================================================
// PHASE 1: DATA PREPARATION - POSTGRESQL VERSION
// ============================================================================

async function prepareSchedulingDataPG(year, month) {
  // Load all required data with PostgreSQL queries
  const guidesResult = await pool.query("SELECT * FROM users WHERE role = 'מדריך' AND is_active = true ORDER BY name");
  const guides = guidesResult.rows;
  
  const constraintsResult = await pool.query("SELECT * FROM constraints");
  const constraints = constraintsResult.rows;
  
  const fixedConstraintsResult = await pool.query("SELECT * FROM fixed_constraints");
  const fixedConstraints = fixedConstraintsResult.rows;
  
  const vacationsResult = await pool.query("SELECT * FROM vacations WHERE status = 'approved'");
  const vacations = vacationsResult.rows;
  
  const coordinatorRulesResult = await pool.query("SELECT * FROM coordinator_rules WHERE is_active = true");
  const coordinatorRules = coordinatorRulesResult.rows;
  
  const existingScheduleResult = await pool.query(`
    SELECT * FROM schedule 
    WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
  `, [year, month]);
  const existingSchedule = existingScheduleResult.rows;
  
  // Load weekend types
  const weekendTypes = {};
  const weekendRowsResult = await pool.query(`
    SELECT * FROM weekend_types 
    WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
  `, [year, month]);
  weekendRowsResult.rows.forEach(row => {
    weekendTypes[row.date.toISOString().split('T')[0]] = row.is_closed; // Keep as boolean
  });
  
  // Generate all days in month
  const days = getAllDaysInMonth(year, month).map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const weekday = getHebrewWeekday(date.getDay());
    const weekendType = weekendTypes[dateStr] || null;
    
    return {
      date: dateStr,
      weekday: weekday,
      weekdayNum: date.getDay(),
      weekendType: weekendType,
      isWeekend: date.getDay() === 5 || date.getDay() === 6, // Friday or Saturday
      requirements: null // Will be calculated later
    };
  });
  
  // Initialize guide statistics
  const guideStats = {};
  guides.forEach(guide => {
    guideStats[guide.id] = {
      totalShifts: 0,
      leadShifts: 0,
      secondShifts: 0,
      regularShifts: 0,
      overlapShifts: 0,
      standbyShifts: 0,
      motzashShifts: 0,
      weekendShifts: 0,
      weekdayShifts: 0,
      lastShiftDate: null,
      consecutiveDays: 0
    };
  });
  
  // Load existing assignments and update stats
  const manualAssignments = {};
  existingSchedule.forEach(assignment => {
    if (assignment.is_manual) {
      manualAssignments[assignment.date.toISOString().split('T')[0]] = assignment;
      
      // Update statistics for manual assignments
      if (assignment.guide1_id) {
        updateGuideStatsForAssignmentPG(guideStats[assignment.guide1_id], assignment.date, assignment.guide1_role || 'רגיל');
      }
      if (assignment.guide2_id) {
        updateGuideStatsForAssignmentPG(guideStats[assignment.guide2_id], assignment.date, assignment.guide2_role || 'רגיל');
      }
    }
  });
  
  return {
    guides,
    constraints,
    fixedConstraints,
    vacations,
    coordinatorRules,
    weekendTypes,
    days,
    guideStats,
    manualAssignments,
    year,
    month,
    options: {},
    totalDays: days.length,
    averageShiftsPerGuide: 0 // Will be calculated during assignment
  };
}

// Helper function to get Hebrew weekday name
function getHebrewWeekday(dayIndex) {
  const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return weekdays[dayIndex];
}

// ============================================================================
// PHASE 2: DAY-BY-DAY ASSIGNMENT - POSTGRESQL VERSION
// ============================================================================

async function assignDayOptimalPG(dayInfo, context) {
  const { date, weekday, weekdayNum, weekendType } = dayInfo;
  
  // Skip if manually assigned
  if (context.manualAssignments[date]) {
    console.log(`Skipping manually assigned day: ${date}`);
    return context.manualAssignments[date];
  }
  
  // Determine requirements for this day
  const requirements = getDayRequirementsPG(dayInfo, context);
  dayInfo.requirements = requirements;
  
  console.log(`Day ${date} requirements:`, requirements);
  
  // Handle special case: closed Saturday weekend
  if (requirements.isClosedSaturday) {
    // For Saturday, we need to handle it differently
    if (weekdayNum === 6) { // Saturday
      // Find the standby guide that was assigned for Friday
      const fridayDate = new Date(date);
      fridayDate.setDate(fridayDate.getDate() - 1);
      const fridayDateStr = fridayDate.toISOString().split('T')[0];
      
      // Find the standby guide from Friday
      const fridayAssignment = context.assignments?.find(a => 
        a.date === fridayDateStr && a.linkedSaturday === date
      );
      
      if (fridayAssignment && fridayAssignment.standbyGuideId) {
        const standbyGuide = context.guides.find(g => g.id === fridayAssignment.standbyGuideId);
        
        // Find motzash guide (different from standby guide)
        const motzashAvailable = await Promise.all(
          context.guides.map(async guide => {
            if (guide.id === standbyGuide.id) return null; // Skip standby guide
            const availability = await validateGuideAvailabilityPG(guide, date, context);
            return { ...guide, availability };
          })
        );
        
        const availableForMotzash = motzashAvailable
          .filter(guide => guide && guide.availability.available)
          .sort((a, b) => a.availability.score - b.availability.score);
        
        if (availableForMotzash.length > 0) {
          const motzashGuide = availableForMotzash[0];
          
          return {
            date: date,
            weekday: weekday,
            type: 'כונן+מוצ״ש',
            guide1_id: standbyGuide.id,
            guide1_name: standbyGuide.name,
            guide1_role: 'כונן',
            guide2_id: motzashGuide.id,
            guide2_name: motzashGuide.name,
            guide2_role: 'מוצ״ש',
            is_manual: false,
            is_locked: false,
            created_by: null
          };
        }
      }
    }
    
    // For Friday, use the original logic
    return await handleClosedSaturdayWeekendPG(dayInfo, context);
  }
  
  // Get available guides with scores
  const guidesWithAvailability = await Promise.all(
    context.guides.map(async guide => {
      const availability = await validateGuideAvailabilityPG(guide, date, context);
      return {
        ...guide,
        availability
      };
    })
  );
  
  // Filter available guides and sort by score
  const availableGuides = guidesWithAvailability
    .filter(guide => guide.availability.available)
    .sort((a, b) => a.availability.score - b.availability.score);
  
  console.log(`Available guides for ${date}: ${availableGuides.length}/${context.guides.length}`);
  
  // If no guides available, try override soft constraints
  if (availableGuides.length === 0) {
    console.log(`No available guides for ${date}, trying soft constraint override`);
    const overrideGuides = await tryOverrideSoftConstraintsPG(guidesWithAvailability, date, context);
    if (overrideGuides.length > 0) {
      return await selectOptimalGuidesPG(overrideGuides, requirements, context, date);
    } else {
      console.log(`Cannot assign any guides for ${date} - will notify coordinator`);
      return null; // Will create warning
    }
  }
  
  // Select optimal guides
  return await selectOptimalGuidesPG(availableGuides, requirements, context, date);
}

function getDayRequirementsPG(dayInfo, context) {
  const { date, weekday, weekdayNum, weekendType } = dayInfo;
  
  // Check if this is a closed Saturday Friday
  if (weekdayNum === 5) { // Friday
    const saturdayDate = new Date(date);
    saturdayDate.setDate(saturdayDate.getDate() + 1);
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0];
    const saturdayWeekendType = context.weekendTypes[saturdayDateStr];
    
    if (saturdayWeekendType === true) { // PostgreSQL stores boolean
      return {
        guidesNeeded: 1,
        roles: ['כונן'],
        type: 'standby',
        isClosedSaturdayFriday: true,
        linkedSaturday: saturdayDateStr
      };
    }
  }
  
  // Check if this is a closed Saturday
  if (weekdayNum === 6) { // Saturday
    // Check if this Saturday is closed
    const isClosed = context.weekendTypes[date] === true;
    if (isClosed) {
      return {
        guidesNeeded: 2, // conan from Friday + motzash
        roles: ['כונן', 'מוצ״ש'],
        type: 'closed_saturday',
        isClosedSaturday: true,
        requiresMotzash: true
      };
    }
  }
  
  // Regular days (including open Saturday, holidays)
  return {
    guidesNeeded: 2,
    roles: ['רגיל', 'חפיפה'],
    type: 'regular',
    isWeekend: weekdayNum === 5 || weekdayNum === 6
  };
}

async function handleClosedSaturdayWeekendPG(fridayInfo, context) {
  const { date: fridayDate } = fridayInfo;
  
  // Get Saturday date
  const saturdayDate = new Date(fridayDate);
  saturdayDate.setDate(saturdayDate.getDate() + 1);
  const saturdayDateStr = saturdayDate.toISOString().split('T')[0];
  
  console.log(`Handling closed Saturday weekend: ${fridayDate} -> ${saturdayDateStr}`);
  
  // Find best standby guide for Friday
  const fridayAvailable = await Promise.all(
    context.guides.map(async guide => {
      const availability = await validateGuideAvailabilityPG(guide, fridayDate, context);
      // Additional check: standby limit
      if (availability.available && context.guideStats[guide.id].standbyShifts >= 2) {
        availability.available = false;
        availability.reason = 'כבר עבד כונן פעמיים החודש';
      }
      return { ...guide, availability };
    })
  );
  
  const availableForStandby = fridayAvailable
    .filter(guide => guide.availability.available)
    .sort((a, b) => a.availability.score - b.availability.score);
  
  if (availableForStandby.length === 0) {
    console.log(`No available standby guides for closed Saturday ${fridayDate}`);
    return null;
  }
  
  const standbyGuide = availableForStandby[0];
  console.log(`Selected standby guide: ${standbyGuide.name} for ${fridayDate}-${saturdayDateStr}`);
  
  // Return Friday assignment
  return {
    date: fridayDate,
    weekday: getHebrewWeekday(new Date(fridayDate).getDay()),
    type: 'כונן',
    guide1_id: standbyGuide.id,
    guide1_name: standbyGuide.name,
    guide1_role: 'כונן',
    guide2_id: null,
    guide2_name: null,
    guide2_role: null,
    is_manual: false,
    is_locked: false,
    created_by: null,
    linkedSaturday: saturdayDateStr,
    standbyGuideId: standbyGuide.id, // For Saturday processing
  };
}

// ============================================================================
// TRAFFIC LIGHT SYSTEM FOR SCHEDULING - POSTGRESQL VERSION
// ============================================================================

function calculateTrafficLightStatusForSchedulingPG(guide, guideStats, date, context) {
  try {
    // Base status is green
    let status = 'green';
    let reason = 'זמין לעבודה';
    
    if (!guideStats) {
      return { status: 'green', reason: 'מדריך חדש - מועדף לעבודה' };
    }

    // Check recent work pattern
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    // High workload checks
    if (guideStats.totalShifts >= 8) {
      status = 'yellow';
      reason = 'עומס עבודה גבוה החודש';
    } else if (guideStats.weekendShifts >= 3) {
      status = 'yellow'; 
      reason = 'הרבה עבודה בסופי שבוע';
    } else if (guideStats.standbyShifts >= 2) {
      status = 'yellow';
      reason = 'הרבה עבודת כונן';
    }
    
    // Weekend specific logic
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    if (isWeekend && guideStats.weekendShifts >= 4) {
      status = 'red';
      reason = 'חריגה חמורה בעבודת סופי שבוע';
    }
    
    // Critical overwork check
    if (guideStats.totalShifts >= 12) {
      status = 'red';
      reason = 'עומס עבודה קיצוני - נדרשת הפגה';
    }
    
    // Recent work check (if worked in last 2 days)
    if (guideStats.lastShiftDate) {
      const lastShift = new Date(guideStats.lastShiftDate);
      const diffDays = Math.ceil((dateObj - lastShift) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 2) {
        if (status === 'green') {
          status = 'yellow';
          reason = 'עבד לפני יומיים - מומלץ מנוחה';
        }
      }
    }

    return { status, reason };
  } catch (error) {
    console.error('Error calculating traffic light for scheduling:', error);
    return { status: 'yellow', reason: 'שגיאה בחישוב סטטוס' };
  }
}

// ============================================================================
// PHASE 3: CONSTRAINT VALIDATION - POSTGRESQL VERSION
// ============================================================================

async function validateGuideAvailabilityPG(guide, date, context) {
  try {
    const availability = {
      available: true,
      score: 0,
      reasons: [],
      traffic_light_status: 'green',
      traffic_light_reason: ''
    };

    // Check constraints
    const hasConstraint = context.constraints.some(c => 
      c.user_id === guide.id && c.date === date
    );
    if (hasConstraint) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'אילוץ אישי';
      availability.reasons.push('אילוץ אישי');
      return availability;
    }

    // Check fixed constraints
    const dayOfWeek = new Date(date).getDay();
    const hasFixedConstraint = context.fixedConstraints.some(fc => 
      fc.user_id === guide.id && fc.weekday === dayOfWeek
    );
    if (hasFixedConstraint) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'אילוץ קבוע';
      availability.reasons.push('אילוץ קבוע');
      return availability;
    }

    // Check vacations
    const hasVacation = context.vacations.some(v => 
      v.user_id === guide.id && 
      date >= v.date_start.toISOString().split('T')[0] && 
      date <= v.date_end.toISOString().split('T')[0]
    );
    if (hasVacation) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'חופשה';
      availability.reasons.push('חופשה');
      return availability;
    }

    // ========================================================================
    // ENHANCED COORDINATOR RULES VALIDATION
    // ========================================================================
    
    // Check no_auto_scheduling rule
    const hasCoordinatorBlock = context.coordinatorRules.some(rule => 
      rule.rule_type === 'no_auto_scheduling' && rule.is_active &&
      rule.guide1_id === guide.id
    );
    if (hasCoordinatorBlock) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'חוק רכז - לא באוטומטי';
      availability.reasons.push('חוק רכז - לא באוטומטי');
      return availability;
    }
    
    // Check no_conan rule (prevent standby assignments)
    const dayOfWeekForConan = new Date(date).getDay();
    const isWeekendForConan = dayOfWeekForConan === 5 || dayOfWeekForConan === 6;
    const hasNoConanRule = context.coordinatorRules.some(rule => 
      rule.rule_type === 'no_conan' && rule.is_active &&
      rule.guide1_id === guide.id
    );
    
    // Apply no_conan rule during role assignment validation (will be checked later in specific contexts)
    // For now, we store this information for later use in shift-specific validations
    
    // Check no_weekends rule
    const hasNoWeekendsRule = context.coordinatorRules.some(rule => 
      rule.rule_type === 'no_weekends' && rule.is_active &&
      rule.guide1_id === guide.id
    );
    if (hasNoWeekendsRule && isWeekendForConan) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'חוק רכז - לא בסופי שבוע';
      availability.reasons.push('חוק רכז - לא בסופי שבוע');
      return availability;
    }
    
    // Check manual_only rule
    const hasManualOnlyRule = context.coordinatorRules.some(rule => 
      rule.rule_type === 'manual_only' && rule.is_active &&
      rule.guide1_id === guide.id
    );
    if (hasManualOnlyRule) {
      availability.available = false;
      availability.traffic_light_status = 'red';
      availability.traffic_light_reason = 'חוק רכז - רק שיבוץ ידני';
      availability.reasons.push('חוק רכז - רק שיבוץ ידני');
      return availability;
    }

    // Check consecutive days rule
    const guideStats = context.guideStats[guide.id];
    if (guideStats && guideStats.lastShiftDate) {
      const lastShift = new Date(guideStats.lastShiftDate);
      const currentDate = new Date(date);
      const diffDays = Math.ceil((currentDate - lastShift) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        availability.available = false;
        availability.traffic_light_status = 'red';
        availability.traffic_light_reason = 'עבד אתמול - מנוחה נדרשת';
        availability.reasons.push('עבד אתמול');
        return availability;
      }
    }

    // Calculate traffic light status based on workload and recent activity
    const trafficLightData = calculateTrafficLightStatusForSchedulingPG(guide, guideStats, date, context);
    availability.traffic_light_status = trafficLightData.status;
    availability.traffic_light_reason = trafficLightData.reason;

    // ========================================================================
    // ADVANCED SCORING SYSTEM - Sophisticated workload balancing
    // ========================================================================
    
    // Calculate base score for balancing (lower is better)
    let baseScore = 0;
    if (guideStats) {
      // Primary workload balancing - prefer guides with fewer shifts
      baseScore += guideStats.totalShifts * 10;
      
      // Weekend work penalty - reduce consecutive weekend assignments
      baseScore += guideStats.weekendShifts * 6;
      
      // Standby work penalty - balance conan assignments
      baseScore += guideStats.standbyShifts * 12;
      
      // Additional specific role penalties
      if (guideStats.motzashShifts) {
        baseScore += guideStats.motzashShifts * 8; // Motzash is demanding
      }
      
      // Recent work pattern penalty (within 3 days)
      if (guideStats.lastShiftDate) {
        const lastShift = new Date(guideStats.lastShiftDate);
        const currentDate = new Date(date);
        const diffDays = Math.ceil((currentDate - lastShift) / (1000 * 60 * 60 * 24));
        
        // Add score penalty for recent work (within 3 days) - prefer 2-day gap
        if (diffDays <= 3 && diffDays > 1) {
          baseScore += (4 - diffDays) * 5; // Reduced penalty for recent work
          availability.reasons.push(`עבד לפני ${diffDays} ימים`);
        }
      }
      
      // Standby limit penalty (don't block completely, but add high penalty)
      if (guideStats.standbyShifts >= 2) {
        baseScore += 100; // High penalty for exceeding conan limit
        availability.reasons.push(`כבר ${guideStats.standbyShifts} כוננויות החודש`);
      }
      
      // Weekend overwork penalty
      if (guideStats.weekendShifts >= 4) {
        baseScore += 80; // High penalty for too many weekends
        availability.reasons.push('הרבה עבודת סופי שבוע');
      }
    }

    // Apply traffic light weighting to scores
    switch (availability.traffic_light_status) {
      case 'green':
        availability.score = baseScore; // No penalty
        break;
      case 'yellow':
        availability.score = baseScore + 50; // Medium penalty
        break;
      case 'red':
        // Red status should already be marked as unavailable above
        // But if we reach here, it's a soft red (high penalty but still available)
        availability.score = baseScore + 200;
        break;
    }
    
    // Add small random factor to break ties (ensures fair distribution)
    availability.score += Math.random() * 2;

    return availability;
  } catch (error) {
    console.error('Error validating guide availability:', error);
    return {
      available: false,
      score: 1000,
      reasons: ['שגיאה בבדיקת זמינות'],
      traffic_light_status: 'red',
      traffic_light_reason: 'שגיאה במערכת'
    };
  }
}

async function selectOptimalGuidesPG(availableGuides, requirements, context, date) {
  if (availableGuides.length === 0) {
    return null;
  }
  
  const { guidesNeeded, roles, type } = requirements;
  
  // Handle closed Saturday (Saturday day)
  if (type === 'closed_saturday') {
    // Find the standby guide from Friday
    const fridayDate = new Date(date);
    fridayDate.setDate(fridayDate.getDate() - 1);
    const fridayDateStr = fridayDate.toISOString().split('T')[0];
    
    const fridayAssignment = context.manualAssignments[fridayDateStr];
    let standbyGuide = null;
    
    if (fridayAssignment && fridayAssignment.guide1_id) {
      standbyGuide = context.guides.find(g => g.id === fridayAssignment.guide1_id);
    }
    
    // Select motzash guide (different from standby)
    const motzashCandidates = availableGuides.filter(g => g.id !== standbyGuide?.id);
    const motzashGuide = motzashCandidates[0];
    
    return {
      date: date,
      weekday: getHebrewWeekday(new Date(date).getDay()),
      type: 'מוצ״ש',
      guide1_id: standbyGuide?.id || null,
      guide1_name: standbyGuide?.name || null,
      guide1_role: 'כונן',
      guide2_id: motzashGuide?.id || null,
      guide2_name: motzashGuide?.name || null,
      guide2_role: 'מוצ״ש',
      is_manual: false,
      is_locked: false,
      created_by: null
    };
  }
  
  // Handle standby assignment (Friday for closed Saturday) with no_conan rule validation
  if (type === 'standby') {
    // Filter out guides with no_conan rule
    const validStandbyGuides = availableGuides.filter(guide => {
      const hasNoConanRule = context.coordinatorRules.some(rule => 
        rule.rule_type === 'no_conan' && rule.is_active &&
        rule.guide1_id === guide.id
      );
      return !hasNoConanRule;
    });
    
    if (validStandbyGuides.length === 0) {
      console.log('No valid guides for standby assignment due to no_conan rules');
      return null;
    }
    
    const standbyGuide = validStandbyGuides[0];
    return {
      date: date,
      weekday: getHebrewWeekday(new Date(date).getDay()),
      type: 'כונן',
      guide1_id: standbyGuide.id,
      guide1_name: standbyGuide.name,
      guide1_role: 'כונן',
      guide2_id: null,
      guide2_name: null,
      guide2_role: null,
      is_manual: false,
      is_locked: false,
      created_by: null
    };
  }
  
  // Handle regular assignment (1 or 2 guides) with sophisticated selection
  const guide1 = availableGuides[0];
  let guide2 = null;
  
  if (guidesNeeded > 1) {
    // Select second guide with advanced conflict avoidance and optimization
    const guide2Candidates = availableGuides.slice(1).filter(g => {
      // Check coordinator conflicts
      if (hasCoordinatorConflictPG(guide1, g, context)) {
        return false;
      }
      
      // Avoid pairing guides with similar recent work patterns for better distribution
      const guide1Stats = context.guideStats[guide1.id];
      const guide2Stats = context.guideStats[g.id];
      
      // If both guides have high workload, prefer mixing high/low workload
      if (guide1Stats && guide2Stats) {
        const bothHighWorkload = guide1Stats.totalShifts >= 6 && guide2Stats.totalShifts >= 6;
        const bothHighWeekends = guide1Stats.weekendShifts >= 3 && guide2Stats.weekendShifts >= 3;
        
        // Avoid pairing two overworked guides when possible
        if ((bothHighWorkload || bothHighWeekends) && availableGuides.length > 3) {
          return false;
        }
      }
      
      return true;
    });
    
    // Select best candidate from filtered list
    guide2 = guide2Candidates.length > 0 ? guide2Candidates[0] : availableGuides[1];
  }
  
  return {
    date: date,
    weekday: getHebrewWeekday(new Date(date).getDay()),
    type: roles.join('+'),
    guide1_id: guide1.id,
    guide1_name: guide1.name,
    guide1_role: roles[0],
    guide2_id: guide2?.id || null,
    guide2_name: guide2?.name || null,
    guide2_role: guide2 ? roles[1] : null,
    is_manual: false,
    is_locked: false,
    created_by: null
  };
}

function hasCoordinatorConflictPG(guide1, guide2, context) {
  // Check no_together rule (bidirectional)
  const noTogetherRule = context.coordinatorRules.find(r => 
    r.rule_type === 'no_together' && r.is_active &&
    ((r.guide1_id === guide1.id && r.guide2_id === guide2.id) ||
     (r.guide1_id === guide2.id && r.guide2_id === guide1.id))
  );
  
  if (noTogetherRule) {
    return true;
  }
  
  // Check prevent_pair rule (more general pairing prevention)
  const preventPairRule = context.coordinatorRules.find(r => 
    r.rule_type === 'prevent_pair' && r.is_active &&
    ((r.guide1_id === guide1.id && r.guide2_id === guide2.id) ||
     (r.guide1_id === guide2.id && r.guide2_id === guide1.id))
  );
  
  if (preventPairRule) {
    return true;
  }
  
  // Check manual_only rules for individual guides
  const guide1ManualOnly = context.coordinatorRules.find(r => 
    r.rule_type === 'manual_only' && r.is_active && r.guide1_id === guide1.id
  );
  
  const guide2ManualOnly = context.coordinatorRules.find(r => 
    r.rule_type === 'manual_only' && r.is_active && r.guide1_id === guide2.id
  );
  
  // If either guide is manual_only, they cannot be auto-assigned together
  if (guide1ManualOnly || guide2ManualOnly) {
    return true;
  }
  
  return false;
}

async function tryOverrideSoftConstraintsPG(guidesWithAvailability, date, context) {
  // For now, return empty array - can be implemented later for emergency assignments
  return [];
}

// ============================================================================
// PHASE 4: UTILITY FUNCTIONS - POSTGRESQL VERSION
// ============================================================================

function updateContextWithAssignmentPG(context, assignment) {
  // Update guide statistics with the new assignment
  if (assignment.guide1_id) {
    updateGuideStatsForAssignmentPG(context.guideStats[assignment.guide1_id], assignment.date, assignment.guide1_role);
  }
  if (assignment.guide2_id) {
    updateGuideStatsForAssignmentPG(context.guideStats[assignment.guide2_id], assignment.date, assignment.guide2_role);
  }
  
  // Add to manual assignments if it's manual
  if (assignment.is_manual) {
    context.manualAssignments[assignment.date] = assignment;
  }
  
  // Note: assignments are already added to the main assignments array in runCompleteAutoSchedulingPG
  // We don't need to add them here to avoid duplication
  
  console.log(`Updated context with assignment for ${assignment.date}`);
}

function updateGuideStatsForAssignmentPG(stats, date, role) {
  if (!stats) return;
  
  stats.totalShifts++;
  stats.lastShiftDate = date;
  
  // Update role-specific counts
  switch (role) {
    case 'רגיל':
      stats.regularShifts++;
      break;
    case 'חפיפה':
      stats.overlapShifts++;
      break;
    case 'כונן':
      stats.standbyShifts++;
      break;
    case 'מוצ״ש':
      stats.motzashShifts++;
      break;
  }
  
  // Update weekend/weekday counts
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    stats.weekendShifts++;
  } else {
    stats.weekdayShifts++;
  }
}

async function saveAssignmentsToDatabasePG(assignments, year, month, guides) {
  console.log(`💾 Saving ${assignments.length} assignments to database`);
  
  // Delete existing assignments for the month
  await pool.query(`
    DELETE FROM schedule 
    WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
  `, [year, month]);
  
  // Insert new assignments
  for (const assignment of assignments) {
    // Get guide names for the assignment
    const guide1Name = assignment.guide1_id ? guides.find(g => g.id === assignment.guide1_id)?.name : null;
    const guide2Name = assignment.guide2_id ? guides.find(g => g.id === assignment.guide2_id)?.name : null;
    
    // Get weekday name
    const dateObj = new Date(assignment.date);
    const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const weekdayName = weekdays[dateObj.getDay()];
    
    // Determine type based on weekday
    const type = (dateObj.getDay() === 5 || dateObj.getDay() === 6) ? 'weekend' : 'weekday';
    
    await pool.query(`
      INSERT INTO schedule (date, weekday, type, guide1_id, guide2_id, guide1_role, guide2_role, guide1_name, guide2_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      assignment.date,
      weekdayName,
      type,
      assignment.guide1_id,
      assignment.guide2_id,
      assignment.guide1_role,
      assignment.guide2_role,
      guide1Name,
      guide2Name,
      assignment.created_at,
      assignment.updated_at
    ]);
  }
  
  console.log(`✅ Successfully saved ${assignments.length} assignments`);
}

function generateFinalStatisticsPG(context, assignments) {
  const { guides } = context;
  
  const stats = {
    total_assignments: assignments.length,
    guides_used: new Set(),
    average_shifts_per_guide: 0,
    assigned: assignments.length,
    empty_days: context.totalDays - assignments.length
  };
  
  assignments.forEach(assignment => {
    if (assignment.guide1_id) stats.guides_used.add(assignment.guide1_id);
    if (assignment.guide2_id) stats.guides_used.add(assignment.guide2_id);
  });
  
  stats.guides_used = Array.from(stats.guides_used).length;
  stats.average_shifts_per_guide = stats.total_assignments > 0 ? 
    (stats.total_assignments * 2) / stats.guides_used : 0;
  
  return stats;
}

function getAllDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month - 1, 1);
  
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

// Get weekend type for a specific date
async function getWeekendType(date, weekdayNum) {
  try {
    // If it's not Friday or Saturday, return regular
    if (weekdayNum !== 5 && weekdayNum !== 6) {
      return 'regular';
    }
    
    // Check weekend_types table
    const result = await pool.query(`
      SELECT is_closed FROM weekend_types WHERE date = $1
    `, [date]);
    
    if (result.rows.length > 0) {
      return result.rows[0].is_closed ? 'closed' : 'regular';
    }
    
    // Default to regular if no specific type is set
    return 'regular';
  } catch (error) {
    console.error('Error getting weekend type:', error);
    return 'regular'; // Default fallback
  }
}

function determineShiftRequirements(weekdayNum, weekendType) {
  // Friday (5) and Saturday (6) need 2 guides
  if (weekdayNum === 5 || weekdayNum === 6) {
    return {
      guidesNeeded: 2,
      roles: ['מדריך ראשי', 'מדריך שני']
    };
  }
  
  // Other days need 1 guide
  return {
    guidesNeeded: 1,
    roles: ['מדריך ראשי']
  };
}

// ============================================================================
// REMOVE AUTO-SCHEDULED ASSIGNMENTS ENDPOINT
// ============================================================================

app.delete('/api/schedule/remove-auto-scheduled/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    console.log(`🗑️ Removing auto-scheduled assignments for ${year}-${month}`);
    
    // Delete only auto-scheduled assignments (is_manual = false)
    const result = await pool.query(`
      DELETE FROM schedule 
      WHERE EXTRACT(YEAR FROM date) = $1 
        AND EXTRACT(MONTH FROM date) = $2 
        AND (is_manual IS NULL OR is_manual = false)
    `, [year, month]);
    
    console.log(`✅ Removed ${result.rowCount} auto-scheduled assignments`);
    
    res.json({
      success: true,
      message: `Removed ${result.rowCount} auto-scheduled assignments`,
      removedCount: result.rowCount
    });
    
  } catch (error) {
    console.error('Error removing auto-scheduled assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove auto-scheduled assignments',
      details: error.message
    });
  }
});

console.log('✅ Phase 1: Core auto-scheduling algorithm infrastructure migrated to PostgreSQL');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getHebrewWeekday(dayIndex) {
  const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return weekdays[dayIndex];
}

// ============================================================================
// PHASE 6: PRECISE HOUR CALCULATIONS AND STATISTICS - POSTGRESQL VERSION
// ============================================================================

function calculateHoursForShiftPG(day, role, weekendTypes, schedule, dayIndex) {
  const hours = {
    regular: 0,
    night: 0,
    shabbat: 0,
    conan: 0,
    conan_shabbat: 0,
    motzash: 0
  };
  
  const dayOfWeek = new Date(day.date).getDay();
  const isFriday = dayOfWeek === 5;
  const isSaturday = dayOfWeek === 6;
  
  // Check if this is a closed Saturday weekend
  let isClosedSaturday = false;
  if (isFriday) {
    // Check Saturday status
    const saturdayDate = new Date(day.date);
    saturdayDate.setDate(saturdayDate.getDate() + 1);
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0];
    isClosedSaturday = weekendTypes[saturdayDateStr] === true; // PostgreSQL stores boolean
  } else if (isSaturday) {
    // Check this Saturday's status
    isClosedSaturday = weekendTypes[day.date] === true; // PostgreSQL stores boolean
  }
  
  // Calculate hours based on role and day - EXACT SAME LOGIC AS SQLITE VERSION
  switch (role) {
    case 'כונן':
      if (isFriday && isClosedSaturday) {
        // Friday conan for closed Saturday: Friday 09:00 - Saturday 17:00
        hours.conan = 10;           // Friday 09:00-19:00 (10 hours weekday conan)
        hours.conan_shabbat = 22;   // Friday 19:00 - Saturday 17:00 (22 hours Shabbat conan)
      } else {
        // Regular conan (shouldn't happen in weekdays)
        hours.conan = 24;
      }
      break;
      
    case 'מוצ״ש':
      if (isSaturday && isClosedSaturday) {
        // Motzash for closed Saturday: Saturday 17:00 - Sunday 08:00
        hours.shabbat = 2;    // Saturday 17:00-19:00 (2 hours Shabbat)
        hours.regular = 5;    // Saturday 19:00-24:00 (5 hours regular)
        hours.night = 8;      // Sunday 00:00-08:00 (8 hours night)
        hours.motzash = 15;   // Total motzash hours for salary calculation
      } else {
        // Regular Saturday (open)
        hours.shabbat = 16;   // Saturday shift in open Shabbat
      }
      break;
      
    case 'רגיל':
      if (isFriday && !isClosedSaturday) {
        // Regular Friday (open Shabbat)
        hours.regular = 10;   // Friday 09:00-19:00
        hours.shabbat = 14;   // Friday 19:00 - Saturday 09:00
      } else if (isSaturday && !isClosedSaturday) {
        // Regular Saturday (open Shabbat)
        hours.shabbat = 24;   // Full Saturday shift
      } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        // Weekday (Sunday-Thursday)
        hours.regular = 16;   // Day shift 09:00 - next day 09:00 (15+1)
        hours.night = 8;      // Night shift 00:00 - 08:00
      }
      break;
      
    case 'חפיפה':
      if (isFriday && !isClosedSaturday) {
        // Handover Friday (open Shabbat)
        hours.regular = 10;   // Friday 09:00-19:00
        hours.shabbat = 15;   // Friday 19:00 - Saturday 10:00 (includes handover)
      } else if (isSaturday && !isClosedSaturday) {
        // Handover Saturday (open Shabbat)
        hours.shabbat = 25;   // Full Saturday + handover hour
      } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        // Weekday handover (Sunday-Thursday)
        hours.regular = 17;   // Day shift 09:00 - next day 10:00 (15+2)
        hours.night = 8;      // Night shift 00:00 - 08:00
      }
      break;
  }
  
  return hours;
}

function calculateGuideStatisticsPG(schedule, guideId, year, month, weekendTypes) {
  const stats = {
    regular_hours: 0,
    night_hours: 0,
    shabbat_hours: 0,
    conan_hours: 0,
    conan_shabbat_hours: 0,
    motzash_hours: 0,
    total_shifts: 0,
    weekend_shifts: 0,
    weekday_shifts: 0
  };
  
  schedule.forEach((day, index) => {
    let role = null;
    
    // Determine guide's role for this day
    if (day.guide1_id === guideId) {
      role = day.guide1_role || 'רגיל';
    } else if (day.guide2_id === guideId) {
      role = day.guide2_role || 'חפיפה';
    }
    
    if (role) {
      stats.total_shifts++;
      
      const dayOfWeek = new Date(day.date).getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        stats.weekend_shifts++;
      } else {
        stats.weekday_shifts++;
      }
      
      // Calculate hours based on role and day type - EXACT SAME LOGIC AS SQLITE VERSION
      const hours = calculateHoursForShiftPG(day, role, weekendTypes, schedule, index);
      
      stats.regular_hours += hours.regular;
      stats.night_hours += hours.night;
      stats.shabbat_hours += hours.shabbat;
      stats.conan_hours += hours.conan;
      stats.conan_shabbat_hours += hours.conan_shabbat;
      stats.motzash_hours += hours.motzash;
    }
  });
  
  return stats;
}

function calculateDayStatisticsPG(schedule, year, month) {
  // Get total days in month
  const totalDays = new Date(year, month, 0).getDate();
  
  // Create set of all dates that should exist
  const allDates = new Set();
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    allDates.add(date.toISOString().split('T')[0]);
  }
  
  // Get assigned dates
  const assignedDates = new Set();
  const doubleAssignedDates = new Set();
  const overassignedDates = new Set(); // More than 2 guides
  
  schedule.forEach(day => {
    const dateStr = day.date.toISOString ? day.date.toISOString().split('T')[0] : day.date;
    assignedDates.add(dateStr);
    
    const assignedGuides = [day.guide1_id, day.guide2_id].filter(Boolean).length;
    if (assignedGuides === 2) {
      doubleAssignedDates.add(dateStr);
    } else if (assignedGuides > 2) {
      overassignedDates.add(dateStr);
    }
  });
  
  // Calculate statistics
  const unassignedDates = [...allDates].filter(date => !assignedDates.has(date));
  
  return {
    total_days: totalDays,
    assigned_days: assignedDates.size,
    unassigned_days: unassignedDates.length,
    double_assigned_days: doubleAssignedDates.size,
    overassigned_days: overassignedDates.size,
    coverage_percentage: Math.round((assignedDates.size / totalDays) * 100),
    unassigned_dates: unassignedDates,
    completion_rate: assignedDates.size === totalDays ? 100 : Math.round((assignedDates.size / totalDays) * 100)
  };
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test PostgreSQL connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Failed to connect to PostgreSQL. Exiting...');
      process.exit(1);
    }
    
    // Initialize default data
    await initializeDefaultTypes();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Sigalit PostgreSQL Backend running on port ${PORT}`);
      console.log(`📊 Database: PostgreSQL (sigalit_pg)`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
