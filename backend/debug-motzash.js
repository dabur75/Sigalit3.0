const AdvancedScheduler = require('./services/advanced-scheduler.js');

async function debugMotzashSelection() {
  console.log('🔍 Debug: Testing מוצ״ש guide selection logic');
  
  try {
    // Create a simple database query to test the constraints and guides directly
    const { pool } = require('./database/postgresql.js');
    
    console.log('\n📋 Active Guides:');
    const guides = await pool.query(`
      SELECT id, name FROM users 
      WHERE role = 'מדריך' AND is_active = true 
      ORDER BY name
    `);
    guides.rows.forEach(g => console.log(`  - ${g.id}: ${g.name}`));
    
    console.log('\n🚫 Constraints for Saturday Aug 9, 2025:');
    const constraints = await pool.query(`
      SELECT user_id, date::text 
      FROM constraints 
      WHERE date = '2025-08-09'
    `);
    if (constraints.rows.length === 0) {
      console.log('  - No constraints found');
    } else {
      constraints.rows.forEach(c => console.log(`  - Guide ${c.user_id} blocked on ${c.date}`));
    }
    
    console.log('\n⚠️ Fixed constraints for Saturday (day 6):');
    const fixedConstraints = await pool.query(`
      SELECT user_id, weekday 
      FROM fixed_constraints 
      WHERE weekday = 6
    `);
    if (fixedConstraints.rows.length === 0) {
      console.log('  - No fixed constraints for Saturday');
    } else {
      fixedConstraints.rows.forEach(c => console.log(`  - Guide ${c.user_id} blocked on Saturdays`));
    }
    
    console.log('\n📅 Current Friday assignment (should have כונן):');
    const friday = await pool.query(`
      SELECT guide1_id, guide1_role, guide2_id, guide2_role 
      FROM schedule 
      WHERE date = '2025-08-08'
    `);
    if (friday.rows.length === 0) {
      console.log('  - No Friday assignment found!');
    } else {
      const f = friday.rows[0];
      console.log(`  - Guide1: ${f.guide1_id} (${f.guide1_role}), Guide2: ${f.guide2_id} (${f.guide2_role})`);
    }
    
    // Based on data, guides available for מוצ״ש on Saturday should be:
    // All active guides EXCEPT:
    // - Guide who is כונן on Friday (continuing as כונן on Saturday)
    // - Any with constraints on Saturday
    console.log('\n🎯 Expected available guides for מוצ״ש on Saturday Aug 9:');
    const fridayKonan = friday.rows[0]?.guide1_id;
    if (fridayKonan) {
      const available = guides.rows
        .filter(g => g.id !== fridayKonan) // Exclude Friday כונן
        .filter(g => !constraints.rows.some(c => c.user_id === g.id)); // Exclude constrained
      
      console.log(`  - Excluding Friday כונן (${fridayKonan})`);
      console.log(`  - Available for מוצ״ש: ${available.length} guides`);
      available.forEach(g => console.log(`    * ${g.id}: ${g.name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

debugMotzashSelection();