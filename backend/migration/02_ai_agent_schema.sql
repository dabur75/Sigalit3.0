-- AI Agent Database Schema Extensions for Sigalit System
-- PostgreSQL Migration Script

-- Emergency swap requests tracking
CREATE TABLE IF NOT EXISTS emergency_swap_requests (
    id SERIAL PRIMARY KEY,
    original_guide_id INTEGER NOT NULL,
    date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    reason TEXT,
    urgency_level VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolution_type VARCHAR(50), -- 'internal_swap', 'reserve_guide', 'cancelled'
    coordinator_id INTEGER,
    
    FOREIGN KEY (original_guide_id) REFERENCES users(id),
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- AI swap suggestions and their outcomes
CREATE TABLE IF NOT EXISTS ai_swap_suggestions (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL,
    suggestion_data JSONB NOT NULL, -- Complete swap solution details
    suggestion_type VARCHAR(50) NOT NULL, -- 'direct', 'chain', 'split'
    priority_rank INTEGER NOT NULL,
    likelihood_score INTEGER, -- 0-100
    impact_score REAL,
    complexity_level INTEGER,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (emergency_id) REFERENCES emergency_swap_requests(id)
);

-- Contact attempt tracking for learning
CREATE TABLE IF NOT EXISTS guide_contact_history (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL,
    suggestion_id INTEGER,
    contacted_guide_id INTEGER NOT NULL,
    contact_order INTEGER NOT NULL, -- 1st, 2nd, 3rd contact attempt
    coordinator_id INTEGER NOT NULL,
    contacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contact_method VARCHAR(20), -- 'phone', 'sms', 'whatsapp'
    response VARCHAR(20), -- 'accepted', 'declined', 'no_answer', 'pending'
    response_time INTERVAL,
    decline_reason TEXT,
    notes TEXT,
    
    FOREIGN KEY (emergency_id) REFERENCES emergency_swap_requests(id),
    FOREIGN KEY (suggestion_id) REFERENCES ai_swap_suggestions(id),
    FOREIGN KEY (contacted_guide_id) REFERENCES users(id),
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- Successfully executed swaps
CREATE TABLE IF NOT EXISTS executed_swaps (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL,
    final_solution JSONB NOT NULL, -- The actual swap that was executed
    affected_guides JSONB NOT NULL, -- Array of guide IDs involved
    confirmation_method VARCHAR(50), -- How confirmation was obtained
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    coordinator_id INTEGER NOT NULL,
    coordinator_notes TEXT,
    
    FOREIGN KEY (emergency_id) REFERENCES emergency_swap_requests(id),
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- AI learning patterns and insights
CREATE TABLE IF NOT EXISTS ai_scheduling_patterns (
    id SERIAL PRIMARY KEY,
    pattern_type VARCHAR(50) NOT NULL, -- 'acceptance_rate', 'workload_preference', 'time_pattern'
    guide_id INTEGER,
    conditions JSONB, -- Conditions under which pattern applies
    pattern_data JSONB NOT NULL, -- The learned pattern data
    confidence_score REAL, -- 0.0 to 1.0
    sample_size INTEGER, -- How many data points support this pattern
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    FOREIGN KEY (guide_id) REFERENCES users(id)
);

-- Guide preferences learned from behavior
CREATE TABLE IF NOT EXISTS guide_preferences (
    id SERIAL PRIMARY KEY,
    guide_id INTEGER NOT NULL,
    preference_type VARCHAR(50) NOT NULL, -- 'shift_type', 'partner', 'day_of_week', 'emergency_response'
    preference_value VARCHAR(100),
    strength REAL, -- How strong this preference is (0.0 to 1.0)
    learned_from_data BOOLEAN DEFAULT true, -- vs manually entered
    last_reinforced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (guide_id) REFERENCES users(id),
    UNIQUE(guide_id, preference_type, preference_value)
);

-- Feedback on AI suggestions for continuous learning
CREATE TABLE IF NOT EXISTS ai_suggestion_feedback (
    id SERIAL PRIMARY KEY,
    emergency_id INTEGER NOT NULL,
    suggestion_id INTEGER NOT NULL,
    coordinator_id INTEGER NOT NULL,
    feedback_type VARCHAR(20) NOT NULL, -- 'accepted', 'rejected', 'modified'
    feedback_score INTEGER, -- 1-5 rating
    feedback_text TEXT,
    what_worked TEXT,
    what_didnt_work TEXT,
    suggested_improvements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (emergency_id) REFERENCES emergency_swap_requests(id),
    FOREIGN KEY (suggestion_id) REFERENCES ai_swap_suggestions(id),
    FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- User interaction patterns for personalized assistance
CREATE TABLE IF NOT EXISTS user_interaction_patterns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'emergency_request', 'schedule_view', 'constraint_add'
    context_data JSONB,
    frequency_count INTEGER DEFAULT 1,
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success_rate REAL, -- Success rate for this type of interaction
    average_time INTERVAL, -- Average time to complete
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, interaction_type)
);

-- Help content and tutorials effectiveness tracking
CREATE TABLE IF NOT EXISTS ai_help_effectiveness (
    id SERIAL PRIMARY KEY,
    help_topic VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    help_provided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    was_helpful BOOLEAN,
    completion_rate REAL, -- Did they complete the helped task?
    follow_up_questions INTEGER DEFAULT 0,
    feedback_text TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_requests_date ON emergency_swap_requests(date);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_guide ON emergency_swap_requests(original_guide_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_resolved ON emergency_swap_requests(resolved_at, resolution_type);

CREATE INDEX IF NOT EXISTS idx_contact_history_emergency ON guide_contact_history(emergency_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_guide ON guide_contact_history(contacted_guide_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_response ON guide_contact_history(response, contacted_at);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_guide ON ai_scheduling_patterns(guide_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_active ON ai_scheduling_patterns(is_active, confidence_score);

CREATE INDEX IF NOT EXISTS idx_guide_preferences_guide ON guide_preferences(guide_id, preference_type);
CREATE INDEX IF NOT EXISTS idx_guide_preferences_strength ON guide_preferences(strength DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_emergency ON ai_suggestion_feedback(emergency_id);
CREATE INDEX IF NOT EXISTS idx_feedback_suggestion ON ai_suggestion_feedback(suggestion_id);

-- Views for easy querying
CREATE OR REPLACE VIEW v_emergency_swap_summary AS
SELECT 
    esr.*,
    u.name as original_guide_name,
    coord.name as coordinator_name,
    COUNT(gch.id) as contact_attempts,
    COUNT(CASE WHEN gch.response = 'accepted' THEN 1 END) as acceptances,
    COUNT(CASE WHEN gch.response = 'declined' THEN 1 END) as declines,
    es.executed_at is not null as was_executed
FROM emergency_swap_requests esr
LEFT JOIN users u ON esr.original_guide_id = u.id
LEFT JOIN users coord ON esr.coordinator_id = coord.id  
LEFT JOIN guide_contact_history gch ON esr.id = gch.emergency_id
LEFT JOIN executed_swaps es ON esr.id = es.emergency_id
GROUP BY esr.id, u.name, coord.name, es.executed_at;

CREATE OR REPLACE VIEW v_guide_emergency_stats AS
SELECT 
    u.id,
    u.name,
    COUNT(gch.id) as total_emergency_contacts,
    COUNT(CASE WHEN gch.response = 'accepted' THEN 1 END) as acceptances,
    COUNT(CASE WHEN gch.response = 'declined' THEN 1 END) as declines,
    CASE WHEN COUNT(gch.id) > 0 THEN 
        ROUND(COUNT(CASE WHEN gch.response = 'accepted' THEN 1 END) * 100.0 / COUNT(gch.id), 1) 
    ELSE 0 END as acceptance_rate,
    AVG(EXTRACT(EPOCH FROM gch.response_time) / 60) as avg_response_minutes
FROM users u
LEFT JOIN guide_contact_history gch ON u.id = gch.contacted_guide_id
WHERE u.role = 'מדריך' AND u.is_active = true
GROUP BY u.id, u.name
ORDER BY acceptance_rate DESC, total_emergency_contacts DESC;

-- Initial AI learning data population
-- This will be populated as the system learns from actual usage

-- Comments for documentation
COMMENT ON TABLE emergency_swap_requests IS 'Records each emergency situation requiring guide replacement';
COMMENT ON TABLE ai_swap_suggestions IS 'AI-generated swap solutions with scoring and reasoning';
COMMENT ON TABLE guide_contact_history IS 'Tracks coordinator attempts to contact guides for learning';
COMMENT ON TABLE executed_swaps IS 'Successfully executed swap solutions for analysis';
COMMENT ON TABLE ai_scheduling_patterns IS 'Learned patterns about guide behavior and preferences';
COMMENT ON TABLE guide_preferences IS 'Individual guide preferences learned from behavior';
COMMENT ON TABLE ai_suggestion_feedback IS 'Coordinator feedback on AI suggestions for improvement';
COMMENT ON TABLE user_interaction_patterns IS 'User behavior patterns for personalized assistance';
COMMENT ON TABLE ai_help_effectiveness IS 'Effectiveness tracking of AI help and tutorials';

-- Grant permissions (adjust as needed for your user setup)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO sigalit_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sigalit_app_user;