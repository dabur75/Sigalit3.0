'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { buildMonthContext } = require('../services/context-builder');

(async () => {
  try {
    console.log('=== Debugging API Context Building ===\n');
    
    // Test context building for API call
    console.log('Building context for house_id="dror", Sept 2025...');
    const context = await buildMonthContext({
      house_id: 'dror',
      year: 2025,
      month: 9
    });
    
    console.log('Context built:');
    console.log('  Guides found:', context.guides?.length || 0);
    console.log('  Sample guides:', context.guides?.slice(0, 3).map(g => `${g.id}:${g.name}(${g.role})`) || []);
    console.log('  All guide IDs:', context.guides?.map(g => g.id) || []);
    console.log('  Constraints:', context.constraints?.length || 0);
    console.log('  Weekend types:', Object.keys(context.weekendTypes || {}).length);
    console.log('  Manual assignments:', context.manualAssignments?.length || 0);
    console.log('  Coordinator rules:', context.coordinatorRules?.length || 0);
    
    if (context.guides?.length === 0) {
      console.log('\n❌ No guides found! This explains the issue.');
      console.log('The AI has no real guide IDs to work with, so it uses example ID 123.');
    } else {
      console.log('\n✅ Guides found! The issue might be elsewhere.');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Debug failed:', e.message);
    process.exit(1);
  }
})();