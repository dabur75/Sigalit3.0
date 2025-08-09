# Sigalit AI Agent - Emergency Swap Assistant

## 🎯 Overview

The Sigalit AI Agent is an intelligent assistant that helps coordinators find optimal guide replacements during emergencies. It analyzes constraints, learns from historical patterns, and provides prioritized recommendations while respecting the human approval workflow.

## 🏗️ Architecture

### Components
- **AI Agent Core** (`ai-agent/index.js`) - Main orchestrator
- **Swap Engine** (`ai-agent/swap-engine.js`) - Finds possible swap solutions
- **Learning System** (`ai-agent/learning-system.js`) - Learns from guide behavior patterns
- **Contact Tracker** (`ai-agent/contact-tracker.js`) - Tracks coordinator contacts and guide responses
- **Frontend Widget** (`frontend/ai-assistant.js`) - Interactive UI component

### Database Tables
- `emergency_swap_requests` - Records each emergency situation
- `ai_swap_suggestions` - AI-generated solutions with scoring
- `guide_contact_history` - Tracks coordinator contact attempts
- `executed_swaps` - Successfully completed swaps
- `ai_scheduling_patterns` - Learned behavior patterns
- `guide_preferences` - Individual guide preferences

## 🚀 How to Use

### For Coordinators

#### 1. Emergency Swap Process
1. **Navigate to Schedule Page** - Go to the finalized schedule view
2. **Find Emergency Shift** - Locate the shift needing replacement
3. **Click "🔄 החלפה חכמה"** - Click the smart swap button next to the shift
4. **Fill Emergency Form**:
   - Select the unavailable guide
   - Choose shift type (morning/evening/night/weekend)
   - Add reason (optional)
5. **Get AI Recommendations** - Click "🔍 חפש פתרונות"

#### 2. Review Recommendations
The AI provides ranked suggestions with:
- **Guide Name** - Who can replace
- **Likelihood Score** - Probability of acceptance (0-100%)
- **Swap Type** - Direct, chain, or split shift
- **Reasoning** - Why this guide is recommended

#### 3. Contact Guides
1. **Click "📞 פרטי קשר"** for contact template
2. **Make the Call** - Use suggested message template
3. **Record Result** - Click "✅ יצרתי קשר" to log outcome

#### 4. Execute Swap
- If guide **accepts**: System offers to execute swap automatically
- If guide **declines**: Try next recommendation or use reserves
- **All changes require coordinator confirmation**

### API Endpoints

#### Get Emergency Recommendations
```http
POST /api/ai/emergency-recommendations
Content-Type: application/json

{
  "unavailableGuideId": 123,
  "date": "2024-01-15",
  "shiftType": "night",
  "reason": "Guide sick",
  "coordinatorId": 456
}
```

#### Record Contact Result
```http
POST /api/ai/contact-result
Content-Type: application/json

{
  "emergencyId": 789,
  "suggestionId": 1,
  "contactedGuideId": 123,
  "contactOrder": 1,
  "coordinatorId": 456,
  "response": "accepted",
  "responseTime": 5,
  "notes": "Guide agreed immediately"
}
```

#### Execute Confirmed Swap
```http
POST /api/ai/execute-swap
Content-Type: application/json

{
  "emergencyId": 789,
  "swapSolution": { /* swap details */ },
  "coordinatorId": 456
}
```

## 🧠 AI Intelligence Features

### 1. Smart Recommendations
- **Constraint Analysis**: Checks all guide constraints automatically
- **Workload Balancing**: Considers fair distribution of shifts
- **Historical Patterns**: Learns which guides accept emergency requests
- **Partner Compatibility**: Prefers guides who work well together

### 2. Contact Optimization
- **Priority Ranking**: Orders contacts by likelihood of success
- **Personalized Templates**: Generates custom messages per guide
- **Response Learning**: Improves suggestions based on outcomes
- **Fatigue Tracking**: Avoids overcontacting the same guides

### 3. Swap Types Supported
- **Direct Swap**: Simple 1-to-1 guide replacement
- **Chain Swap**: Multi-guide rotations (A→B→C→A)
- **Split Shift**: Divide shift between multiple guides
- **Compensation**: Offer future preferred shifts as incentive

## 📊 Learning & Analytics

### Continuous Learning
The AI learns from every interaction:
- **Acceptance Rates**: Tracks which guides say yes to emergencies
- **Response Times**: Learns optimal contact timing
- **Decline Reasons**: Improves future recommendations
- **Seasonal Patterns**: Adapts to holiday/vacation periods

### Analytics Dashboard
Access via `/api/ai/stats`:
- **Internal Resolution Rate**: % of emergencies solved without reserves
- **Contact Effectiveness**: Success rate by contact method
- **Guide Responsiveness**: Average response times
- **Emergency Trends**: Pattern analysis over time

## 🛠️ Setup & Installation

### Database Migration
```bash
psql -U sigalit_user -d sigalit_pg -f migration/02_ai_agent_schema.sql
```

### Backend Integration
The AI agent is automatically initialized in `app_postgresql.js`:
```javascript
const SigalitAI = require('./ai-agent');
const aiAgent = new SigalitAI(pool);
```

### Frontend Integration
Add to schedule.html:
```html
<script src="ai-assistant.js"></script>
```

### Testing
```bash
node test-ai-agent.js
```

## 🎯 Success Metrics

### Primary Goals
- **Reduce Reserve Usage**: Decrease external guide usage by 70%+
- **Faster Resolution**: Emergency swaps resolved within 10 minutes
- **Higher Success Rate**: 85%+ of emergencies solved internally
- **Coordinator Efficiency**: Reduce manual search time by 80%

### Learning Metrics  
- **Prediction Accuracy**: AI likelihood vs actual acceptance rate
- **Recommendation Quality**: % of first-choice suggestions accepted
- **Pattern Recognition**: Improvement in seasonal/temporal predictions

## 🔧 Configuration

### Environment Variables
- `AI_AGENT_ENABLED`: Enable/disable AI features (default: true)
- `AI_LEARNING_RATE`: How quickly patterns adapt (default: 0.1)
- `AI_MIN_CONFIDENCE`: Minimum confidence for suggestions (default: 0.3)

### Customization
- **Priority Weights**: Adjust importance of different factors
- **Swap Complexity**: Set maximum chain length for complex swaps  
- **Contact Templates**: Customize message templates per guide preference
- **Learning Parameters**: Tune how quickly the system adapts

## 🚨 Emergency Fallback

### When AI Can't Help
If no internal solutions are found:
1. **Clear Message**: "לא נמצאו פתרונות פנימיים"
2. **Reserve Recommendation**: System suggests contacting external guides
3. **Learn from Outcome**: Records that reserves were needed for future improvement

### Manual Override
Coordinators can always:
- Skip AI recommendations
- Make manual assignments
- Provide feedback to improve future suggestions
- Access traditional reserve contact methods

## 📈 Future Enhancements

### Planned Features
- **Proactive Suggestions**: Identify potential problems before they occur
- **Integration with Reserve System**: Manage external guides within the system
- **Mobile Notifications**: Real-time alerts for available guides
- **Advanced Analytics**: Deeper insights into scheduling patterns

### AI Improvements
- **Natural Language Processing**: Understand free-text constraint descriptions
- **Predictive Modeling**: Forecast guide availability based on patterns
- **Multi-objective Optimization**: Balance multiple goals simultaneously
- **Federated Learning**: Learn from similar systems while preserving privacy

## 🔒 Privacy & Security

### Data Protection
- **Anonymized Learning**: Personal patterns stored securely
- **Consent-Based**: Guides can opt out of behavior tracking
- **Audit Trail**: Complete log of all AI decisions and human approvals
- **Data Retention**: Automatic cleanup of old patterns and suggestions

### Security Measures
- **Human Approval Required**: AI never executes swaps automatically
- **Access Control**: Only authorized coordinators can use AI features
- **Input Validation**: All API requests thoroughly validated
- **Error Handling**: Graceful fallback when AI systems unavailable

## 📞 Support & Troubleshooting

### Common Issues
- **No Recommendations**: Check if guides exist and have proper constraints
- **Low Likelihood Scores**: Normal for new system - will improve with use
- **Frontend Widget Not Loading**: Verify ai-assistant.js is included
- **Database Errors**: Ensure migration completed successfully

### Getting Help
1. **Check Logs**: AI errors logged to console with context
2. **Test Script**: Run `node test-ai-agent.js` to verify functionality
3. **Database Queries**: Use built-in views for troubleshooting
4. **Manual Fallback**: Traditional scheduling always available

---

**The AI Agent enhances but never replaces human judgment. Coordinators maintain full control over all scheduling decisions.**