'use strict';

// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const ClaudeHaikuAgent = require('../ai-scheduler/ClaudeHaikuAgent');

(async () => {
  try {
    const agent = new ClaudeHaikuAgent();
    const result = await agent.healthCheck();
    console.log('AI Health Check Reply:', result.reply);
    console.log('Token Usage:', result.usage);
    process.exit(0);
  } catch (err) {
    console.error('AI Health Check Failed:', err.message);
    process.exit(1);
  }
})();


