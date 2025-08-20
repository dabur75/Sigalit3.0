'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { pool } = require('../database/postgresql');

(async () => {
  try {
    console.log('=== Checking Database Data ===\n');
    
    // Check houses
    const houses = await pool.query('SELECT * FROM houses ORDER BY id');
    console.log('Houses:', houses.rows);
    
    // Check users by house
    const users = await pool.query(`
      SELECT id, name, role, house_id, is_active 
      FROM users 
      ORDER BY house_id, role, name
    `);
    console.log('\nUsers by house:');
    const usersByHouse = {};
    users.rows.forEach(u => {
      const house = u.house_id || 'no_house';
      if (!usersByHouse[house]) usersByHouse[house] = [];
      usersByHouse[house].push(u);
    });
    
    Object.keys(usersByHouse).forEach(house => {
      console.log(`\n  House ${house}:`);
      usersByHouse[house].forEach(u => {
        console.log(`    ${u.id}: ${u.name} (${u.role}) - ${u.is_active ? 'active' : 'inactive'}`);
      });
    });
    
    // Check recent schedule data
    const recentSchedule = await pool.query(`
      SELECT date, guide1_id, guide1_role, guide2_id, guide2_role 
      FROM schedule 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date DESC 
      LIMIT 10
    `);
    console.log('\nRecent schedule entries:', recentSchedule.rows.length);
    recentSchedule.rows.slice(0, 3).forEach(s => {
      console.log(`  ${s.date}: Guide1=${s.guide1_id}(${s.guide1_role}), Guide2=${s.guide2_id}(${s.guide2_role})`);
    });
    
    // Check constraints
    const constraints = await pool.query(`
      SELECT user_id, date 
      FROM constraints 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      LIMIT 5
    `);
    console.log('\nRecent constraints:', constraints.rows.length);
    
    // Check weekend types
    const weekendTypes = await pool.query(`
      SELECT date, is_closed 
      FROM weekend_types 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date
      LIMIT 5
    `);
    console.log('\nRecent weekend types:', weekendTypes.rows.length);
    weekendTypes.rows.forEach(w => {
      console.log(`  ${w.date}: ${w.is_closed ? 'closed' : 'open'}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('Check failed:', e.message);
    process.exit(1);
  }
})();