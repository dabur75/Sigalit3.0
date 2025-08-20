'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { pool } = require('../database/postgresql');

(async () => {
  try {
    console.log('=== Debugging Context Builder ===\n');
    
    // Test the exact queries from context-builder
    console.log('1. Testing house_id query...');
    try {
      const result1 = await pool.query(
        `SELECT id, name, role FROM users WHERE house_id = $1 AND is_active = true AND (role = 'מדריך' OR role = 'רכז') ORDER BY name`,
        [1]
      );
      console.log('   House_id query result:', result1.rows.length, 'rows');
    } catch (e) {
      console.log('   House_id query error:', e.message);
      console.log('   This explains why fallback is needed');
    }
    
    console.log('\n2. Testing fallback query...');
    try {
      const result2 = await pool.query(
        `SELECT id, name, role FROM users WHERE is_active = true AND (role = 'מדריך' OR role = 'רכז') ORDER BY name`
      );
      console.log('   Fallback query result:', result2.rows.length, 'rows');
      result2.rows.slice(0, 5).forEach(u => {
        console.log(`     ${u.id}: ${u.name} (${u.role})`);
      });
    } catch (e) {
      console.log('   Fallback query error:', e.message);
    }
    
    console.log('\n3. Checking users table structure...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('   Users table columns:');
    columns.rows.forEach(c => {
      console.log(`     ${c.column_name}: ${c.data_type} (${c.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n4. Checking actual users data...');
    const users = await pool.query(`
      SELECT id, name, role, house_id, is_active 
      FROM users 
      WHERE is_active = true 
      ORDER BY id 
      LIMIT 10
    `);
    console.log('   Active users:');
    users.rows.forEach(u => {
      console.log(`     ${u.id}: ${u.name} (${u.role}) house_id=${u.house_id} active=${u.is_active}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('Debug failed:', e.message);
    process.exit(1);
  }
})();