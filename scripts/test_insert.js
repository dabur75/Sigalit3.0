#!/usr/bin/env node
const { pool } = require('../backend/database/postgresql');

(async () => {
  try {
    const dateOnly = process.argv[2] || '2025-08-10';
    const weekday = 'ראשון';
    const scheduleType = 'weekday';
    const guide1_id = 1;
    const guide2_id = 2;
    const guide1_role = 'רגיל';
    const guide2_role = 'חפיפה';

    await pool.query('DELETE FROM schedule WHERE date::date = $1::date', [dateOnly]);
    const ins = await pool.query(
      `INSERT INTO schedule (
        date, weekday, type,
        guide1_id, guide2_id,
        guide1_role, guide2_role,
        is_manual, is_locked,
        created_by, created_at, updated_at, house_id
      ) VALUES (
        $1::date, $2, $3,
        $4, $5,
        $6, $7,
        true, false,
        $8, NOW(), NOW(), 'dror'
      ) RETURNING *`,
      [dateOnly, weekday, scheduleType, guide1_id, guide2_id, guide1_role, guide2_role, null]
    );
    console.log('OK', ins.rows[0]);
  } catch (e) {
    console.error('ERR', e.stack || e);
  } finally {
    pool.end();
  }
})();


