const Database = require('better-sqlite3');
const db = new Database('sigalit.db');

// Test August 5th specifically
const testDate = '2025-08-05';
const weekdayNum = new Date(testDate).getDay(); // Should be 2 (Tuesday)

console.log(`Testing August 5th, 2025 (weekday ${weekdayNum})`);

// Load all data
const guides = db.prepare("SELECT * FROM users WHERE role = 'מדריך' AND COALESCE(is_active, 1) = 1").all();
const constraints = db.prepare("SELECT * FROM constraints").all();
const fixedConstraints = db.prepare("SELECT * FROM fixed_constraints").all();
const vacations = db.prepare("SELECT * FROM vacations WHERE status = 'approved'").all();
const coordinatorRules = db.prepare("SELECT * FROM coordinator_rules WHERE is_active = 1").all();

console.log(`Loaded: ${guides.length} guides, ${constraints.length} constraints, ${fixedConstraints.length} fixed constraints`);

// Test each guide
for (const guide of guides) {
  console.log(`\n--- Testing ${guide.name} ---`);
  
  // 1. Check regular constraints
  const hasConstraint = constraints.some(c => c.user_id === guide.id && c.date === testDate);
  console.log(`  Regular constraint: ${hasConstraint ? 'BLOCKED' : 'OK'}`);
  
  // 2. Check fixed constraints
  const hasFixedConstraint = fixedConstraints.some(fc => fc.user_id === guide.id && fc.weekday === weekdayNum);
  console.log(`  Fixed constraint: ${hasFixedConstraint ? 'BLOCKED' : 'OK'}`);
  
  // 3. Check vacations
  const hasVacation = vacations.some(v => v.user_id === guide.id && v.date_start <= testDate && v.date_end >= testDate);
  console.log(`  Vacation: ${hasVacation ? 'BLOCKED' : 'OK'}`);
  
  // 4. Check coordinator rules
  const hasCoordinatorBlock = coordinatorRules.some(rule => rule.rule_type === 'no_auto_scheduling' && rule.guide1_id === guide.id);
  console.log(`  Coordinator block: ${hasCoordinatorBlock ? 'BLOCKED' : 'OK'}`);
  
  // 5. Check what their last shift was
  const lastShift = db.prepare(`
    SELECT date FROM schedule 
    WHERE (guide1_id = ? OR guide2_id = ?) AND date < ?
    ORDER BY date DESC LIMIT 1
  `).get(guide.id, guide.id, testDate);
  
  if (lastShift) {
    const lastShiftDate = new Date(lastShift.date);
    const currentDate = new Date(testDate);
    const diffDays = Math.ceil((currentDate - lastShiftDate) / (1000 * 60 * 60 * 24));
    console.log(`  Last shift: ${lastShift.date} (${diffDays} days ago)`);
    
    if (diffDays <= 1) {
      console.log(`  Consecutive days: BLOCKED (worked ${diffDays} day(s) ago)`);
    } else if (diffDays <= 3) {
      console.log(`  Consecutive days: OK but penalty (worked ${diffDays} days ago)`);
    } else {
      console.log(`  Consecutive days: OK (worked ${diffDays} days ago)`);
    }
  } else {
    console.log(`  Last shift: None found`);
  }
  
  const isAvailable = !hasConstraint && !hasFixedConstraint && !hasVacation && !hasCoordinatorBlock;
  console.log(`  RESULT: ${isAvailable ? 'AVAILABLE' : 'BLOCKED'}`);
}

db.close(); 