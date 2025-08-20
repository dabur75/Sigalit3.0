'use strict';

const { pool } = require('../database/postgresql');

(async () => {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'drafts'
      ORDER BY ordinal_position
    `);
    console.log('drafts columns:', cols.rows);

    const sample = await pool.query(`SELECT * FROM drafts ORDER BY id DESC LIMIT 1`);
    console.log('latest draft row example:', sample.rows[0] || null);

    const wsCols = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'workflow_status'
      ORDER BY ordinal_position
    `);
    console.log('workflow_status columns:', wsCols.rows);

    process.exit(0);
  } catch (e) {
    console.error('inspect error:', e.message);
    process.exit(1);
  }
})();


