const Database = require('better-sqlite3');
const db = new Database('sigalit.db');

// Test constraint checking for August 3rd, 2025
const testDate = '2025-08-03';
const weekdayNum = new Date(testDate).getDay(); // Should be 0 (Sunday)

console.log(`Testing constraints for ${testDate} (weekday ${weekdayNum})`);

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
  
  const isAvailable = !hasConstraint && !hasFixedConstraint && !hasVacation && !hasCoordinatorBlock;
  console.log(`  RESULT: ${isAvailable ? 'AVAILABLE' : 'BLOCKED'}`);
}

db.close(); 