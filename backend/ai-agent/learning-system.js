/**
 * Learning System - Machine learning for guide behavior patterns
 */

class LearningSystem {
  constructor(database) {
    this.db = database;
  }

  /**
   * Prioritize swap options based on historical patterns
   */
  async prioritizeOptions(swapOptions, unavailableGuideId, date) {
    const prioritizedOptions = [];

    for (const option of swapOptions) {
      const priority = await this.calculatePriority(option, unavailableGuideId, date);
      prioritizedOptions.push({
        ...option,
        priority,
        estimatedAcceptanceRate: priority.acceptanceRate
      });
    }

    // Sort by priority score (highest first)
    return prioritizedOptions.sort((a, b) => b.priority.score - a.priority.score);
  }

  /**
   * Calculate priority score for a swap option
   */
  async calculatePriority(option, unavailableGuideId, date) {
    const guideId = option.primaryGuide.id;
    const dayOfWeek = new Date(date).getDay();
    const timeOfYear = this.getTimeOfYear(date);

    // Get historical data
    const acceptanceRate = await this.getGuideAcceptanceRate(guideId);
    const emergencyResponsiveness = await this.getEmergencyResponsiveness(guideId);
    const workloadPreference = await this.getWorkloadPreference(guideId);
    const timePreferences = await this.getTimePreferences(guideId, dayOfWeek);
    const partnerCompatibility = await this.getPartnerCompatibility(guideId, unavailableGuideId);
    const seasonalPatterns = await this.getSeasonalPatterns(guideId, timeOfYear);

    // Calculate weighted score
    const weights = {
      acceptanceRate: 0.3,
      responsiveness: 0.25,
      workloadBalance: 0.2,
      timePreference: 0.15,
      compatibility: 0.1
    };

    const score = 
      (acceptanceRate * weights.acceptanceRate) +
      (emergencyResponsiveness * weights.responsiveness) +
      (workloadPreference * weights.workloadBalance) +
      (timePreferences * weights.timePreference) +
      (partnerCompatibility * weights.compatibility);

    return {
      score: Math.round(score * 100), // 0-100 scale
      acceptanceRate: Math.round(acceptanceRate * 100),
      factors: {
        historicalAcceptance: Math.round(acceptanceRate * 100),
        responsiveness: Math.round(emergencyResponsiveness * 100),
        workloadFit: Math.round(workloadPreference * 100),
        timePreference: Math.round(timePreferences * 100),
        compatibility: Math.round(partnerCompatibility * 100)
      }
    };
  }

  /**
   * Calculate acceptance probability for specific guide and swap type
   */
  async calculateAcceptanceProbability(guideId, swapType, emergencyId) {
    try {
      // Base acceptance rate from history
      const baseRate = await this.getGuideAcceptanceRate(guideId);
      
      // Validate baseRate
      if (isNaN(baseRate) || baseRate === null || baseRate === undefined) {
        console.log(`Warning: Invalid base rate for guide ${guideId}, using default 0.6`);
        return 0.6;
      }
      
      // Adjust for swap complexity
      const complexityAdjustment = this.getComplexityAdjustment(swapType);
      
      // Adjust for recent activity (fatigue factor)
      const fatigueAdjustment = await this.getFatigueAdjustment(guideId);
      
      // Adjust for time of request
      const timingAdjustment = this.getTimingAdjustment(new Date());
      
      // Validate all adjustments
      const validatedComplexity = isNaN(complexityAdjustment) ? 1.0 : complexityAdjustment;
      const validatedFatigue = isNaN(fatigueAdjustment) ? 1.0 : fatigueAdjustment;
      const validatedTiming = isNaN(timingAdjustment) ? 1.0 : timingAdjustment;
      
      // Combine factors
      const probability = Math.max(0.1, Math.min(0.95,
        baseRate * validatedComplexity * validatedFatigue * validatedTiming
      ));

      // Final validation
      if (isNaN(probability)) {
        console.log(`Warning: Calculated probability is NaN for guide ${guideId}, returning default`);
        return 0.6;
      }

      return probability;

    } catch (error) {
      console.error('Error calculating acceptance probability:', error);
      return 0.6; // Default moderate probability
    }
  }

  /**
   * Get guide's historical acceptance rate for emergency requests
   */
  async getGuideAcceptanceRate(guideId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN response = 'accepted' THEN 1 END) as acceptances
        FROM guide_contact_history 
        WHERE contacted_guide_id = $1 
          AND contacted_at > CURRENT_DATE - INTERVAL '6 months'
      `;
      
      const result = await this.db.query(query, [guideId]);
      const { total_contacts, acceptances } = result.rows[0];
      
      if (total_contacts === 0) {
        // No history - check if this is a generally reliable guide
        return await this.estimateInitialAcceptanceRate(guideId);
      }
      
      return parseFloat(acceptances) / parseFloat(total_contacts);
      
    } catch (error) {
      console.error('Error getting acceptance rate:', error);
      return 0.6; // Default moderate rate
    }
  }

  /**
   * Estimate initial acceptance rate for guides without emergency history
   */
  async estimateInitialAcceptanceRate(guideId) {
    try {
      // Look at general scheduling reliability
      const query = `
        SELECT 
          COUNT(*) as total_scheduled_shifts,
          COUNT(CASE WHEN is_manual = true THEN 1 END) as manual_assignments
        FROM schedule 
        WHERE (guide1_id = $1 OR guide2_id = $1)
          AND date > CURRENT_DATE - INTERVAL '3 months'
      `;
      
      const result = await this.db.query(query, [guideId]);
      const { total_scheduled_shifts, manual_assignments } = result.rows[0];
      
      if (total_scheduled_shifts > 0) {
        // Guides who take more manual assignments are generally more flexible
        const manualRate = parseFloat(manual_assignments) / parseFloat(total_scheduled_shifts);
        return Math.max(0.5, 0.4 + (manualRate * 0.4)); // 0.5 to 0.8 range
      }
      
      return 0.6; // Default for new guides
      
    } catch (error) {
      console.error('Error estimating initial acceptance rate:', error);
      return 0.6;
    }
  }

  /**
   * Get guide's emergency responsiveness (how quickly they respond)
   */
  async getEmergencyResponsiveness(guideId) {
    try {
      const query = `
        SELECT AVG(EXTRACT(EPOCH FROM response_time) / 60) as avg_response_minutes
        FROM guide_contact_history 
        WHERE contacted_guide_id = $1 
          AND response_time IS NOT NULL
          AND contacted_at > CURRENT_DATE - INTERVAL '3 months'
      `;
      
      const result = await this.db.query(query, [guideId]);
      const avgResponseMinutes = result.rows[0].avg_response_minutes;
      
      if (!avgResponseMinutes) return 0.6; // Default
      
      // Convert response time to score (faster = better)
      // 0-30 minutes = excellent (1.0)
      // 30-120 minutes = good (0.8)
      // 120+ minutes = poor (0.4)
      if (avgResponseMinutes <= 30) return 1.0;
      if (avgResponseMinutes <= 120) return 0.8;
      return 0.4;
      
    } catch (error) {
      console.error('Error getting responsiveness:', error);
      return 0.6;
    }
  }

  /**
   * Get guide's workload preference patterns
   */
  async getWorkloadPreference(guideId) {
    try {
      // Check current month workload vs average
      const query = `
        WITH current_workload AS (
          SELECT COUNT(*) as current_shifts
          FROM schedule 
          WHERE (guide1_id = $1 OR guide2_id = $1)
            AND date >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        avg_workload AS (
          SELECT AVG(monthly_shifts) as avg_shifts
          FROM (
            SELECT COUNT(*) as monthly_shifts
            FROM schedule 
            WHERE (guide1_id = $1 OR guide2_id = $1)
              AND date >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', date)
          ) monthly
        )
        SELECT 
          COALESCE(c.current_shifts, 0) as current_shifts,
          COALESCE(a.avg_shifts, 0) as avg_shifts
        FROM current_workload c, avg_workload a
      `;
      
      const result = await this.db.query(query, [guideId]);
      const { current_shifts, avg_shifts } = result.rows[0];
      
      if (avg_shifts === 0) return 0.7; // Default for new guides
      
      const workloadRatio = current_shifts / avg_shifts;
      
      // Guides with lower current workload more likely to accept
      if (workloadRatio < 0.8) return 1.0; // Under-scheduled
      if (workloadRatio < 1.2) return 0.8; // Normal load
      return 0.5; // Over-scheduled
      
    } catch (error) {
      console.error('Error getting workload preference:', error);
      return 0.7;
    }
  }

  /**
   * Get guide's time preferences (day of week, time patterns)
   */
  async getTimePreferences(guideId, dayOfWeek) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_shifts,
          COUNT(CASE WHEN EXTRACT(DOW FROM date) = $2 THEN 1 END) as same_day_shifts
        FROM schedule 
        WHERE (guide1_id = $1 OR guide2_id = $1)
          AND date > CURRENT_DATE - INTERVAL '6 months'
      `;
      
      const result = await this.db.query(query, [guideId, dayOfWeek]);
      const { total_shifts, same_day_shifts } = result.rows[0];
      
      if (total_shifts === 0) return 0.7; // Default
      
      const dayPreferenceRate = parseFloat(same_day_shifts) / parseFloat(total_shifts);
      const expectedRate = 1/7; // Random would be 1/7 for each day
      
      // If they work this day more than average, they probably don't mind it
      return dayPreferenceRate > expectedRate ? 1.0 : 0.8;
      
    } catch (error) {
      console.error('Error getting time preferences:', error);
      return 0.7;
    }
  }

  /**
   * Get compatibility between guides (do they work well together)
   */
  async getPartnerCompatibility(guideId, partnerGuideId) {
    try {
      if (!partnerGuideId) return 0.8; // Default when no specific partner
      
      const query = `
        SELECT COUNT(*) as shifts_together
        FROM schedule 
        WHERE ((guide1_id = $1 AND guide2_id = $2) OR (guide1_id = $2 AND guide2_id = $1))
          AND date > CURRENT_DATE - INTERVAL '6 months'
      `;
      
      const result = await this.db.query(query, [guideId, partnerGuideId]);
      const shiftsTogetherCount = parseInt(result.rows[0].shifts_together);
      
      // More shifts together = better compatibility (up to a point)
      if (shiftsTogetherCount === 0) return 0.8; // Unknown compatibility
      if (shiftsTogetherCount < 3) return 0.9; // Some experience
      return 1.0; // Good compatibility
      
    } catch (error) {
      console.error('Error getting partner compatibility:', error);
      return 0.8;
    }
  }

  /**
   * Get seasonal patterns for guide availability
   */
  async getSeasonalPatterns(guideId, timeOfYear) {
    try {
      // Simple seasonal adjustment based on time of year
      const month = new Date().getMonth() + 1; // 1-12
      
      // Check historical patterns for this time of year
      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN response = 'accepted' THEN 1 END) as acceptances
        FROM guide_contact_history 
        WHERE contacted_guide_id = $1 
          AND EXTRACT(MONTH FROM contacted_at) = $2
      `;
      
      const result = await this.db.query(query, [guideId, month]);
      const { total_contacts, acceptances } = result.rows[0];
      
      if (total_contacts === 0) return 0.8; // Default
      
      return parseFloat(acceptances) / parseFloat(total_contacts);
      
    } catch (error) {
      console.error('Error getting seasonal patterns:', error);
      return 0.8;
    }
  }

  /**
   * Record feedback from coordinator for learning
   */
  async recordFeedback(emergencyId, feedback) {
    try {
      const {
        suggestionId,
        coordinatorId,
        feedbackType,
        feedbackScore,
        feedbackText,
        whatWorked,
        whatDidntWork,
        suggestedImprovements
      } = feedback;

      await this.db.query(`
        INSERT INTO ai_suggestion_feedback 
        (emergency_id, suggestion_id, coordinator_id, feedback_type, feedback_score,
         feedback_text, what_worked, what_didnt_work, suggested_improvements)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        emergencyId, suggestionId, coordinatorId, feedbackType, feedbackScore,
        feedbackText, whatWorked, whatDidntWork, suggestedImprovements
      ]);

      // Update learning patterns based on feedback
      await this.updateLearningPatterns(emergencyId, feedback);
      
      return { success: true };
      
    } catch (error) {
      console.error('Error recording feedback:', error);
      throw new Error('Failed to record feedback');
    }
  }

  /**
   * Update learning patterns based on new data
   */
  async updateLearningPatterns(emergencyId, feedback) {
    try {
      // Get the emergency details
      const emergencyQuery = `
        SELECT esr.*, ass.suggestion_data, ass.suggestion_type
        FROM emergency_swap_requests esr
        LEFT JOIN ai_swap_suggestions ass ON esr.id = ass.emergency_id
        WHERE esr.id = $1
      `;
      
      const emergencyResult = await this.db.query(emergencyQuery, [emergencyId]);
      const emergency = emergencyResult.rows[0];
      
      if (!emergency) return;

      // Update guide-specific patterns
      if (emergency.suggestion_data) {
        const suggestionData = JSON.parse(emergency.suggestion_data);
        const guideId = suggestionData.primaryGuide?.id;
        
        if (guideId) {
          await this.updateGuidePatterns(guideId, emergency, feedback);
        }
      }
      
    } catch (error) {
      console.error('Error updating learning patterns:', error);
    }
  }

  /**
   * Update patterns for specific guide based on feedback
   */
  async updateGuidePatterns(guideId, emergency, feedback) {
    try {
      const patternType = 'emergency_acceptance';
      const dayOfWeek = new Date(emergency.date).getDay();
      
      const conditions = {
        day_of_week: dayOfWeek,
        shift_type: emergency.shift_type,
        swap_type: emergency.suggestion_type
      };
      
      const patternData = {
        feedback_type: feedback.feedbackType,
        success_score: feedback.feedbackScore || (feedback.feedbackType === 'accepted' ? 5 : 1),
        timestamp: new Date().toISOString()
      };
      
      // Upsert pattern
      await this.db.query(`
        INSERT INTO ai_scheduling_patterns 
        (pattern_type, guide_id, conditions, pattern_data, confidence_score, sample_size)
        VALUES ($1, $2, $3, $4, 0.5, 1)
        ON CONFLICT (guide_id, pattern_type) 
        DO UPDATE SET 
          pattern_data = ai_scheduling_patterns.pattern_data || $4,
          sample_size = ai_scheduling_patterns.sample_size + 1,
          last_updated = CURRENT_TIMESTAMP
      `, [
        patternType, guideId, 
        JSON.stringify(conditions), 
        JSON.stringify(patternData)
      ]);
      
    } catch (error) {
      console.error('Error updating guide patterns:', error);
    }
  }

  // Helper methods
  getComplexityAdjustment(swapType) {
    switch (swapType) {
      case 'direct': return 1.0;
      case 'chain': return 0.8;
      case 'split': return 0.7;
      default: return 0.9;
    }
  }

  async getFatigueAdjustment(guideId) {
    try {
      // Check recent emergency contacts
      const query = `
        SELECT COUNT(*) as recent_contacts
        FROM guide_contact_history 
        WHERE contacted_guide_id = $1 
          AND contacted_at > CURRENT_DATE - INTERVAL '1 week'
      `;
      
      const result = await this.db.query(query, [guideId]);
      const recentContacts = parseInt(result.rows[0].recent_contacts);
      
      // Reduce likelihood if contacted frequently recently
      if (recentContacts === 0) return 1.0;
      if (recentContacts === 1) return 0.9;
      if (recentContacts === 2) return 0.8;
      return 0.7; // 3+ recent contacts
      
    } catch (error) {
      console.error('Error getting fatigue adjustment:', error);
      return 1.0;
    }
  }

  getTimingAdjustment(requestTime) {
    const hour = requestTime.getHours();
    
    // Adjust based on time of day
    if (hour >= 6 && hour <= 22) return 1.0; // Daytime - normal
    if (hour >= 23 || hour <= 2) return 0.8; // Late night - less likely
    return 0.9; // Early morning
  }

  getTimeOfYear(date) {
    const month = new Date(date).getMonth() + 1; // 1-12
    
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    if (month === 12 || month <= 2) return 'winter';
    return 'spring';
  }
}

module.exports = LearningSystem;