const { Pool } = require('pg');

// Test configuration - using the same config as the main app
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sigalit_pg',
  user: 'sigalit_user',
  password: 'sigalit_password'
});

async function testAutoScheduling() {
  try {
    console.log('🧪 Testing Auto-Scheduling for Closed Shabbat...\n');
    
    // Test 1: Clear existing schedule for August
    console.log('1. Clearing existing schedule for August...');
    await pool.query('DELETE FROM schedule WHERE date >= $1 AND date <= $2', ['2025-08-01', '2025-08-31']);
    console.log('✅ Schedule cleared');
    
    // Test 2: Run auto-scheduling for August
    console.log('\n2. Running auto-scheduling for August...');
    
    // Import the auto-scheduling function
    const { runCompleteAutoSchedulingPG } = require('./app_postgresql.js');
    
    const result = await runCompleteAutoSchedulingPG(2025, 8, {
      preserveManualAssignments: false,
      forceReschedule: true
    });
    
    console.log('✅ Auto-scheduling completed');
    console.log('Result:', result);
    
    // Test 3: Check the new schedule
    console.log('\n3. Checking new schedule for August...');
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
    
    // Test 4: Check specific closed Saturday weekends
    console.log('\n4. Checking closed Saturday weekends...');
    const closedWeekends = [
      { friday: '2025-08-08', saturday: '2025-08-09' },
      { friday: '2025-08-15', saturday: '2025-08-16' },
      { friday: '2025-08-22', saturday: '2025-08-23' }
    ];
    
    closedWeekends.forEach(weekend => {
      const fridaySchedule = scheduleResult.rows.find(s => s.date === weekend.friday);
      const saturdaySchedule = scheduleResult.rows.find(s => s.date === weekend.saturday);
      
      console.log(`\nWeekend ${weekend.friday} -> ${weekend.saturday}:`);
      if (fridaySchedule) {
        console.log(`  Friday ${weekend.friday}: ${fridaySchedule.type} - ${fridaySchedule.guide1_name}${fridaySchedule.guide2_name ? ', ' + fridaySchedule.guide2_name : ''}`);
      } else {
        console.log(`  Friday ${weekend.friday}: No assignment`);
      }
      
      if (saturdaySchedule) {
        console.log(`  Saturday ${weekend.saturday}: ${saturdaySchedule.type} - ${saturdaySchedule.guide1_name}${saturdaySchedule.guide2_name ? ', ' + saturdaySchedule.guide2_name : ''}`);
      } else {
        console.log(`  Saturday ${weekend.saturday}: No assignment`);
      }
    });
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testAutoScheduling();
