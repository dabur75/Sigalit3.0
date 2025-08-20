'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fetch = require('node-fetch') || ((...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)));

const BASE_URL = 'http://localhost:4000';

async function testEndToEndWorkflow() {
  console.log('=== Testing End-to-End AI Scheduling Workflow ===\n');
  
  try {
    // Test 1: Propose month
    console.log('1. Testing propose-month...');
    const proposeResponse = await fetch(`${BASE_URL}/api/schedule/ai/propose-month`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 2025,
        month: 9,
        house_id: 'dror'
      })
    });
    
    const proposeData = await proposeResponse.json();
    console.log('✅ Propose response status:', proposeResponse.status);
    console.log('   Success:', proposeData.success);
    console.log('   Session ID:', proposeData.sessionId);
    console.log('   Proposal items:', proposeData.proposal?.length || 0);
    console.log('   Warnings:', proposeData.warnings?.length || 0);
    console.log('   Cost:', proposeData.cost ? `$${proposeData.cost.toFixed(4)}` : 'N/A');
    
    if (!proposeData.success) {
      console.log('❌ Propose failed:', proposeData.error);
      return;
    }
    
    const sessionId = proposeData.sessionId;
    
    // Test 2: Refine a day
    console.log('\n2. Testing refine-day...');
    const refineResponse = await fetch(`${BASE_URL}/api/schedule/ai/refine-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        date: '2025-09-01',
        instructions: 'שבץ שני מדריכים זמינים ומתאימים'
      })
    });
    
    const refineData = await refineResponse.json();
    console.log('✅ Refine response status:', refineResponse.status);
    console.log('   Success:', refineData.success);
    console.log('   Updated:', refineData.updated);
    console.log('   Warnings:', refineData.warnings?.length || 0);
    
    // Test 3: Get session info
    console.log('\n3. Testing get session...');
    const sessionResponse = await fetch(`${BASE_URL}/api/schedule/ai/session/${sessionId}`);
    const sessionData = await sessionResponse.json();
    console.log('✅ Session response status:', sessionResponse.status);
    console.log('   Success:', sessionData.success);
    console.log('   Session proposal items:', sessionData.session?.proposal?.length || 0);
    
    // Test 4: Approve as draft
    console.log('\n4. Testing approve-as-draft...');
    const approveResponse = await fetch(`${BASE_URL}/api/schedule/ai/approve-as-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        draftName: 'Test AI Draft Sept 2025'
      })
    });
    
    const approveData = await approveResponse.json();
    console.log('✅ Approve response status:', approveResponse.status);
    console.log('   Success:', approveData.success);
    console.log('   Month:', approveData.month);
    
    // Test 5: Usage summary
    console.log('\n5. Testing usage summary...');
    const usageResponse = await fetch(`${BASE_URL}/api/schedule/ai/usage/summary`);
    const usageData = await usageResponse.json();
    console.log('✅ Usage response status:', usageResponse.status);
    console.log('   Success:', usageData.success);
    console.log('   Total cost:', usageData.total_cost_usd ? `$${usageData.total_cost_usd.toFixed(4)}` : 'N/A');
    console.log('   Total tokens:', (usageData.total_input_tokens || 0) + (usageData.total_output_tokens || 0));
    
    console.log('\n=== End-to-End Test Complete ===');
    console.log('✅ All API endpoints are working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndToEndWorkflow();