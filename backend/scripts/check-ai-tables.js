'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { pool } = require('../database/postgresql');

(async () => {
  try {
    console.log('Checking AI-related tables...');
    
    // Check for AI tables
    const aiTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%ai%' OR table_name IN ('emergency_swap_requests'))
      ORDER BY table_name
    `);
    
    console.log('Existing AI tables:', aiTables.rows.map(r => r.table_name));
    
    // Check if key AI tables exist
    const requiredTables = [
      'ai_sessions',
      'ai_usage', 
      'emergency_swap_requests',
      'ai_swap_suggestions'
    ];
    
    for (const tableName of requiredTables) {
      const exists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [tableName]);
      
      console.log(`Table ${tableName}: ${exists.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    // Check if migration files exist
    const fs = require('fs');
    const migrationFiles = [
      '../migration/01_postgresql_schema.sql',
      '../migration/02_ai_agent_schema.sql'
    ];
    
    for (const file of migrationFiles) {
      const exists = fs.existsSync(require('path').join(__dirname, file));
      console.log(`Migration file ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Check failed:', e.message);
    process.exit(1);
  }
})();