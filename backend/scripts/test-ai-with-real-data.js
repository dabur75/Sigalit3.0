'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ClaudeHaikuAgent = require('../ai-scheduler/ClaudeHaikuAgent');
const PromptTemplates = require('../ai-scheduler/PromptTemplates');
const { validateMonthlyProposal } = require('../ai-scheduler/Validator');
const { buildMonthContext } = require('../services/context-builder');

(async () => {
  try {
    console.log('=== Testing AI with Real Database Data ===\n');
    
    // Test with house_id=1 (fallback to all users)
    console.log('1. Building context with real data...');
    const testContext = await buildMonthContext({ 
      house_id: 1, // Will fallback to all users since house_id is null
      year: 2025, 
      month: 9 
    });
    console.log('✅ Context built successfully');
    console.log('   Guides found:', testContext.guides?.length || 0);
    console.log('   Sample guides:', testContext.guides?.slice(0, 3).map(g => `${g.id}:${g.name}`) || []);
    console.log('   Constraints found:', testContext.constraints?.length || 0);
    console.log('   Weekend types found:', Object.keys(testContext.weekendTypes || {}).length);
    
    if (testContext.guides?.length === 0) {
      console.log('❌ No guides found - cannot test AI scheduling');
      return;
    }
    
    // Test with a small range and real guide IDs
    console.log('\n2. Testing AI proposal with real guide data...');
    const agent = new ClaudeHaikuAgent();
    const systemPrompt = PromptTemplates.systemMonthly();
    const userPrompt = PromptTemplates.userMonthlyRange(testContext, '2025-09-01', '2025-09-03');
    
    console.log('Sending context with guides:', testContext.guides.map(g => g.id));
    
    const result = await agent.sendMessage({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });
    
    console.log('✅ AI response received');
    console.log('   Tokens used:', result.usage);
    console.log('   Response preview:', result.text.substring(0, 300) + '...');
    
    // Parse and validate
    console.log('\n3. Parsing and validating response...');
    let proposal = [];
    try {
      proposal = JSON.parse(result.text);
      console.log('✅ JSON parsed successfully');
      console.log('   Proposal items:', proposal.length);
    } catch (e) {
      console.log('⚠️  JSON parse failed, attempting repair...');
      let repaired = result.text.replace(/\\"/g, '״').replace(/,(\s*[}\]])/g, '$1');
      try {
        proposal = JSON.parse(repaired);
        console.log('✅ Repaired JSON parsed successfully');
      } catch (e2) {
        console.log('❌ Could not parse response');
        console.log('Raw response:', result.text);
        return;
      }
    }
    
    // Show sample proposal
    if (proposal.length > 0) {
      console.log('\n4. Sample proposal:');
      proposal.slice(0, 2).forEach(day => {
        console.log(`   ${day.date}:`);
        (day.assignments || []).forEach(a => {
          console.log(`     - Guide ${a.guide_id} as ${a.role}`);
        });
        console.log(`     Explanation: ${day.explanation_he}`);
      });
      
      // Validate
      console.log('\n5. Validation results:');
      const validation = validateMonthlyProposal(testContext, proposal);
      console.log('   Valid assignments after validation:', validation.proposal?.length || 0);
      console.log('   Total assignments:', validation.stats?.total_assignments || 0);
      console.log('   Warnings:', validation.warnings?.length || 0);
      
      if (validation.warnings?.length > 0) {
        console.log('\n   Warning details:');
        validation.warnings.slice(0, 5).forEach(w => {
          console.log(`     - ${w.type} on ${w.date || 'N/A'} ${w.guide_id ? `(guide ${w.guide_id})` : ''}`);
        });
      }
      
      if (validation.proposal?.length > 0) {
        console.log('\n   Valid proposal sample:');
        validation.proposal.slice(0, 2).forEach(day => {
          console.log(`     ${day.date}: ${day.assignments?.length || 0} assignments`);
          (day.assignments || []).forEach(a => {
            const guide = testContext.guides.find(g => g.id === a.guide_id);
            console.log(`       - ${guide?.name || 'Unknown'} (${a.role})`);
          });
        });
      }
    }
    
    console.log('\n=== Test Complete ===');
    process.exit(0);
    
  } catch (e) {
    console.error('❌ Test failed:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
})();