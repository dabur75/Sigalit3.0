'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ClaudeHaikuAgent = require('../ai-scheduler/ClaudeHaikuAgent');
const PromptTemplates = require('../ai-scheduler/PromptTemplates');
const { validateMonthlyProposal } = require('../ai-scheduler/Validator');
const { buildMonthContext } = require('../services/context-builder');

(async () => {
  try {
    console.log('=== Testing AI Scheduling Components ===\n');
    
    // Test 1: Agent connectivity
    console.log('1. Testing Claude Haiku Agent...');
    const agent = new ClaudeHaikuAgent();
    const healthResult = await agent.healthCheck();
    console.log('✅ Agent connected. Response:', healthResult.reply);
    console.log('   Tokens used:', healthResult.usage);
    
    // Test 2: Context builder
    console.log('\n2. Testing context builder...');
    const testContext = await buildMonthContext({ 
      house_id: 'dror', 
      year: 2025, 
      month: 9 
    });
    console.log('✅ Context built successfully');
    console.log('   Guides found:', testContext.guides?.length || 0);
    console.log('   Constraints found:', testContext.constraints?.length || 0);
    console.log('   Weekend types found:', Object.keys(testContext.weekendTypes || {}).length);
    
    // Test 3: Prompt templates
    console.log('\n3. Testing prompt templates...');
    const systemPrompt = PromptTemplates.systemMonthly();
    const userPrompt = PromptTemplates.userMonthlyRange(testContext, '2025-09-01', '2025-09-03');
    console.log('✅ Prompts generated');
    console.log('   System prompt length:', systemPrompt.length);
    console.log('   User prompt length:', userPrompt.length);
    
    // Test 4: Small AI call for 3 days
    console.log('\n4. Testing small AI proposal (3 days)...');
    const result = await agent.sendMessage({
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });
    console.log('✅ AI response received');
    console.log('   Tokens used:', result.usage);
    console.log('   Response length:', result.text.length);
    console.log('   First 200 chars:', result.text.substring(0, 200) + '...');
    
    // Test 5: Parse and validate response
    console.log('\n5. Testing validation...');
    let proposal = [];
    try {
      proposal = JSON.parse(result.text);
      console.log('✅ JSON parsed successfully');
      console.log('   Proposal items:', proposal.length);
    } catch (e) {
      console.log('⚠️  JSON parse failed, attempting repair...');
      // Simple repair attempt
      let repaired = result.text.replace(/\\"/g, '״').replace(/,(\s*[}\]])/g, '$1');
      try {
        proposal = JSON.parse(repaired);
        console.log('✅ Repaired JSON parsed successfully');
        console.log('   Proposal items:', proposal.length);
      } catch (e2) {
        console.log('❌ Could not parse AI response as JSON');
        console.log('   Raw response:', result.text);
        return;
      }
    }
    
    // Test 6: Validator
    if (proposal.length > 0) {
      const validation = validateMonthlyProposal(testContext, proposal);
      console.log('✅ Validation completed');
      console.log('   Valid days:', validation.proposal?.length || 0);
      console.log('   Warnings:', validation.warnings?.length || 0);
      console.log('   Stats:', validation.stats);
      
      if (validation.warnings?.length > 0) {
        console.log('   Sample warnings:');
        validation.warnings.slice(0, 3).forEach(w => {
          console.log('     -', w.type, w.date || '');
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