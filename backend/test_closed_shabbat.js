const { Pool } = require('pg');

// Test configuration - using the same config as the main app
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sigalit_pg',
  user: 'sigalit_user',
  password: 'sigalit_password'
});

async function testClosedShabbatFunction() {
  try {
    console.log('🧪 Testing Closed Shabbat Function...\n');
    
    // Test 1: Check if weekend types table has closed Saturday data
    console.log('1. Checking weekend types table...');
    const weekendTypesResult = await pool.query(`
      SELECT date, is_closed 
      FROM weekend_types 
      WHERE date >= '2025-08-01' AND date <= '2025-08-31'
      ORDER BY date
    `);
    
    console.log(`Found ${weekendTypesResult.rows.length} weekend type records:`);
    weekendTypesResult.rows.forEach(row => {
      console.log(`  ${row.date}: ${row.is_closed ? 'Closed' : 'Open'}`);
    });
    
    // Test 2: Check if we have guides available
    console.log('\n2. Checking available guides...');
    const guidesResult = await pool.query(`
      SELECT id, name, role, is_active 
      FROM users 
      WHERE role = 'מדריך' AND is_active = true
      ORDER BY name
    `);
    
    console.log(`Found ${guidesResult.rows.length} active guides:`);
    guidesResult.rows.forEach(guide => {
      console.log(`  ${guide.id}: ${guide.name}`);
    });
    
    // Test 3: Check current schedule for August
    console.log('\n3. Checking current schedule for August...');
    const scheduleResult = await pool.query(`
      SELECT s.date, s.weekday, s.type, s.guide1_id, s.guide2_id,
             u1.name as guide1_name, u2.name as guide2_name
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      WHERE s.date >= '2025-08-01' AND s.date <= '2025-08-31'
      ORDER BY s.date
    `);
    
    console.log(`Found ${scheduleResult.rows.length} schedule entries:`);
    scheduleResult.rows.forEach(entry => {
      console.log(`  ${entry.date} (${entry.weekday}): ${entry.type} - ${entry.guide1_name || 'None'}${entry.guide2_name ? ', ' + entry.guide2_name : ''}`);
    });
    
    // Test 4: Find a specific closed Saturday weekend
    console.log('\n4. Looking for closed Saturday weekends...');
    const closedWeekends = weekendTypesResult.rows.filter(row => row.is_closed);
    
    if (closedWeekends.length > 0) {
      const testWeekend = closedWeekends[0];
      const fridayDate = new Date(testWeekend.date);
      fridayDate.setDate(fridayDate.getDate() - 1);
      const fridayDateStr = fridayDate.toISOString().split('T')[0];
      
      console.log(`Testing closed Saturday weekend: Friday ${fridayDateStr} -> Saturday ${testWeekend.date}`);
      
      // Check if Friday has a conan assignment
      const fridaySchedule = scheduleResult.rows.find(s => s.date === fridayDateStr);
      if (fridaySchedule) {
        console.log(`  Friday ${fridayDateStr}: ${fridaySchedule.type} - ${fridaySchedule.guide1_name}`);
      } else {
        console.log(`  Friday ${fridayDateStr}: No assignment found`);
      }
      
      // Check if Saturday has a motzash assignment
      const saturdaySchedule = scheduleResult.rows.find(s => s.date === testWeekend.date);
      if (saturdaySchedule) {
        console.log(`  Saturday ${testWeekend.date}: ${saturdaySchedule.type} - ${saturdaySchedule.guide1_name}${saturdaySchedule.guide2_name ? ', ' + saturdaySchedule.guide2_name : ''}`);
      } else {
        console.log(`  Saturday ${testWeekend.date}: No assignment found`);
      }
    } else {
      console.log('No closed Saturday weekends found in August');
    }
    
    // Test 5: Check assignment types
    console.log('\n5. Checking assignment types...');
    const assignmentTypesResult = await pool.query(`
      SELECT id, name, description, hours_per_shift, salary_factor
      FROM assignment_types
      ORDER BY id
    `);
    
    console.log(`Found ${assignmentTypesResult.rows.length} assignment types:`);
    assignmentTypesResult.rows.forEach(type => {
      console.log(`  ${type.id}: ${type.name} - ${type.description} (${type.hours_per_shift}h, ${type.salary_factor}x)`);
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testClosedShabbatFunction();
