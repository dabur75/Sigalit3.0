/**
 * Contact Tracker - Tracks coordinator contact attempts with guides
 */

class ContactTracker {
  constructor(database) {
    this.db = database;
  }

  /**
   * Record a contact attempt by coordinator
   */
  async recordContact(emergencyId, contactResult) {
    try {
      const {
        suggestionId,
        contactedGuideId,
        contactOrder,
        coordinatorId,
        contactMethod = 'phone',
        response,
        responseTime,
        declineReason,
        notes
      } = contactResult;

      // Insert contact record
      const query = `
        INSERT INTO guide_contact_history 
        (emergency_id, suggestion_id, contacted_guide_id, contact_order, coordinator_id,
         contact_method, response, response_time, decline_reason, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, contacted_at
      `;

      const result = await this.db.query(query, [
        emergencyId,
        suggestionId || null,
        contactedGuideId,
        contactOrder,
        coordinatorId,
        contactMethod,
        response,
        responseTime ? `${responseTime} minutes` : null,
        declineReason,
        notes
      ]);

      const contactId = result.rows[0].id;
      const contactedAt = result.rows[0].contacted_at;

      // Update guide preferences based on response
      if (response === 'accepted' || response === 'declined') {
        await this.updateGuidePreferences(contactedGuideId, response, declineReason);
      }

      // Learn from contact patterns
      await this.updateContactPatterns(emergencyId, contactResult);

      return {
        success: true,
        contactId,
        contactedAt,
        message: 'פנייה נרשמה במערכת'
      };

    } catch (error) {
      console.error('Error recording contact:', error);
      throw new Error('Failed to record contact attempt');
    }
  }

  /**
   * Get contact summary for an emergency
   */
  async getContactSummary(emergencyId) {
    try {
      const query = `
        SELECT 
          gch.*,
          u.name as guide_name,
          u.phone as guide_phone,
          coordinator.name as coordinator_name
        FROM guide_contact_history gch
        JOIN users u ON gch.contacted_guide_id = u.id
        JOIN users coordinator ON gch.coordinator_id = coordinator.id
        WHERE gch.emergency_id = $1
        ORDER BY gch.contact_order, gch.contacted_at
      `;

      const result = await this.db.query(query, [emergencyId]);

      return {
        totalContacts: result.rows.length,
        acceptances: result.rows.filter(r => r.response === 'accepted').length,
        declines: result.rows.filter(r => r.response === 'declined').length,
        pending: result.rows.filter(r => r.response === 'pending' || !r.response).length,
        contacts: result.rows
      };

    } catch (error) {
      console.error('Error getting contact summary:', error);
      throw new Error('Failed to get contact summary');
    }
  }

  /**
   * Get guide's recent contact history for context
   */
  async getGuideContactHistory(guideId, limit = 10) {
    try {
      const query = `
        SELECT 
          gch.*,
          esr.date as emergency_date,
          esr.shift_type,
          esr.reason as emergency_reason,
          coordinator.name as coordinator_name
        FROM guide_contact_history gch
        JOIN emergency_swap_requests esr ON gch.emergency_id = esr.id
        JOIN users coordinator ON gch.coordinator_id = coordinator.id
        WHERE gch.contacted_guide_id = $1
        ORDER BY gch.contacted_at DESC
        LIMIT $2
      `;

      const result = await this.db.query(query, [guideId, limit]);

      return {
        totalHistory: result.rows.length,
        recentContacts: result.rows
      };

    } catch (error) {
      console.error('Error getting guide contact history:', error);
      throw new Error('Failed to get guide contact history');
    }
  }

  /**
   * Update guide preferences based on contact responses
   */
  async updateGuidePreferences(guideId, response, declineReason) {
    try {
      // Update emergency response preference
      const emergencyPreference = response === 'accepted' ? 'willing' : 'reluctant';
      
      await this.upsertPreference(
        guideId,
        'emergency_response',
        emergencyPreference,
        response === 'accepted' ? 0.8 : 0.3
      );

      // Update preferences based on decline reasons
      if (response === 'declined' && declineReason) {
        await this.updateDeclineReasonPreferences(guideId, declineReason);
      }

      // Update time-based preferences
      const hour = new Date().getHours();
      const timeCategory = this.categorizeTimeOfDay(hour);
      
      await this.upsertPreference(
        guideId,
        'contact_time_preference',
        timeCategory,
        response === 'accepted' ? 0.7 : 0.4
      );

    } catch (error) {
      console.error('Error updating guide preferences:', error);
    }
  }

  /**
   * Update preferences based on decline reasons
   */
  async updateDeclineReasonPreferences(guideId, declineReason) {
    const reasonMappings = {
      'family_commitment': { type: 'availability_constraint', value: 'family_time', strength: 0.8 },
      'too_tired': { type: 'workload_preference', value: 'light_load', strength: 0.7 },
      'already_scheduled': { type: 'scheduling_conflict', value: 'avoid_doubles', strength: 0.9 },
      'short_notice': { type: 'notice_preference', value: 'advance_notice', strength: 0.8 },
      'wrong_shift_type': { type: 'shift_type_preference', value: 'selective', strength: 0.6 }
    };

    const mapping = reasonMappings[declineReason];
    if (mapping) {
      await this.upsertPreference(
        guideId,
        mapping.type,
        mapping.value,
        mapping.strength
      );
    }
  }

  /**
   * Upsert a guide preference
   */
  async upsertPreference(guideId, preferenceType, preferenceValue, strength) {
    try {
      const query = `
        INSERT INTO guide_preferences 
        (guide_id, preference_type, preference_value, strength)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (guide_id, preference_type, preference_value)
        DO UPDATE SET 
          strength = CASE 
            WHEN guide_preferences.strength < $4 THEN $4
            ELSE (guide_preferences.strength + $4) / 2
          END,
          last_reinforced = CURRENT_TIMESTAMP
      `;

      await this.db.query(query, [guideId, preferenceType, preferenceValue, strength]);

    } catch (error) {
      console.error('Error upserting preference:', error);
    }
  }

  /**
   * Update contact patterns for learning
   */
  async updateContactPatterns(emergencyId, contactResult) {
    try {
      const { contactedGuideId, response, contactOrder, responseTime } = contactResult;

      // Update interaction patterns
      const interactionType = `emergency_contact_${response || 'pending'}`;
      
      await this.db.query(`
        INSERT INTO user_interaction_patterns 
        (user_id, interaction_type, context_data, frequency_count, success_rate, average_time)
        VALUES ($1, $2, $3, 1, $4, $5)
        ON CONFLICT (user_id, interaction_type)
        DO UPDATE SET 
          frequency_count = user_interaction_patterns.frequency_count + 1,
          success_rate = (user_interaction_patterns.success_rate + $4) / 2,
          average_time = (user_interaction_patterns.average_time + $5) / 2,
          last_interaction = CURRENT_TIMESTAMP
      `, [
        contactedGuideId,
        interactionType,
        JSON.stringify({ emergency_id: emergencyId, contact_order: contactOrder }),
        response === 'accepted' ? 1.0 : 0.0,
        responseTime ? `${responseTime} minutes` : null
      ]);

    } catch (error) {
      console.error('Error updating contact patterns:', error);
    }
  }

  /**
   * Get contact effectiveness statistics
   */
  async getContactEffectiveness(coordinatorId = null, dateRange = 30) {
    try {
      const whereClause = coordinatorId ? 'AND gch.coordinator_id = $2' : '';
      const params = [dateRange];
      if (coordinatorId) params.push(coordinatorId);

      const query = `
        SELECT 
          COUNT(*) as total_contacts,
          COUNT(CASE WHEN response = 'accepted' THEN 1 END) as acceptances,
          COUNT(CASE WHEN response = 'declined' THEN 1 END) as declines,
          COUNT(CASE WHEN response = 'no_answer' THEN 1 END) as no_answers,
          AVG(EXTRACT(EPOCH FROM response_time) / 60) as avg_response_minutes,
          COUNT(DISTINCT emergency_id) as total_emergencies,
          COUNT(DISTINCT CASE WHEN response = 'accepted' THEN emergency_id END) as resolved_emergencies
        FROM guide_contact_history gch
        WHERE gch.contacted_at > CURRENT_DATE - INTERVAL '${dateRange} days'
        ${whereClause}
      `;

      const result = await this.db.query(query, params);
      const stats = result.rows[0];

      return {
        totalContacts: parseInt(stats.total_contacts),
        acceptanceRate: stats.total_contacts > 0 ? 
          Math.round((stats.acceptances / stats.total_contacts) * 100) : 0,
        declineRate: stats.total_contacts > 0 ? 
          Math.round((stats.declines / stats.total_contacts) * 100) : 0,
        noAnswerRate: stats.total_contacts > 0 ? 
          Math.round((stats.no_answers / stats.total_contacts) * 100) : 0,
        averageResponseMinutes: Math.round(stats.avg_response_minutes || 0),
        emergencyResolutionRate: stats.total_emergencies > 0 ? 
          Math.round((stats.resolved_emergencies / stats.total_emergencies) * 100) : 0
      };

    } catch (error) {
      console.error('Error getting contact effectiveness:', error);
      throw new Error('Failed to get contact effectiveness statistics');
    }
  }

  /**
   * Get suggested contact templates based on guide preferences
   */
  async getContactTemplate(guideId, emergencyDetails) {
    try {
      // Get guide preferences
      const preferencesQuery = `
        SELECT preference_type, preference_value, strength
        FROM guide_preferences 
        WHERE guide_id = $1 AND strength > 0.5
        ORDER BY strength DESC
      `;

      const preferences = await this.db.query(preferencesQuery, [guideId]);
      
      // Get guide info
      const guideQuery = 'SELECT name, phone FROM users WHERE id = $1';
      const guideResult = await this.db.query(guideQuery, [guideId]);
      const guide = guideResult.rows[0];

      // Generate personalized template
      const template = this.generateContactTemplate(guide, preferences.rows, emergencyDetails);

      return {
        guide: guide,
        template: template,
        preferences: preferences.rows,
        suggestedMethod: this.getSuggestedContactMethod(preferences.rows)
      };

    } catch (error) {
      console.error('Error getting contact template:', error);
      return {
        guide: { name: 'Unknown' },
        template: this.getDefaultTemplate(emergencyDetails),
        preferences: [],
        suggestedMethod: 'phone'
      };
    }
  }

  // Helper methods
  categorizeTimeOfDay(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  generateContactTemplate(guide, preferences, emergencyDetails) {
    const { date, shiftType, reason } = emergencyDetails;
    const dayName = new Date(date).toLocaleDateString('he-IL', { weekday: 'long' });

    let template = `שלום ${guide.name},\n\n`;
    
    // Check for advance notice preference
    const noticePrefs = preferences.filter(p => p.preference_type === 'notice_preference');
    if (noticePrefs.length > 0) {
      template += 'מצטערים על הודעה קצרה. ';
    }

    template += `יש לנו בעיה בלוח זמנים ל${dayName} (${date}) - ${reason}.\n`;
    
    // Check for shift type preferences
    const shiftPrefs = preferences.filter(p => p.preference_type === 'shift_type_preference');
    if (shiftPrefs.length > 0 && shiftPrefs[0].preference_value === 'selective') {
      template += `המשמרת היא ${shiftType} - האם זה מתאים לך?\n`;
    } else {
      template += `האם תוכל לקחת משמרת ${shiftType}?\n`;
    }

    // Check for emergency response history
    const emergencyPrefs = preferences.filter(p => p.preference_type === 'emergency_response');
    if (emergencyPrefs.length > 0 && emergencyPrefs[0].preference_value === 'willing') {
      template += 'אנחנו יודעים שאפשר לסמוך עליך במצבים כאלה.\n';
    }

    template += '\nאנא הודע בהקדם. תודה!';

    return template;
  }

  getSuggestedContactMethod(preferences) {
    const timePrefs = preferences.filter(p => p.preference_type === 'contact_time_preference');
    const hour = new Date().getHours();
    
    // If it's late/early and guide prefers normal hours, suggest SMS
    if ((hour < 8 || hour > 21) && timePrefs.some(p => p.preference_value === 'morning' || p.preference_value === 'afternoon')) {
      return 'sms';
    }
    
    return 'phone';
  }

  getDefaultTemplate(emergencyDetails) {
    const { date, shiftType, reason } = emergencyDetails;
    const dayName = new Date(date).toLocaleDateString('he-IL', { weekday: 'long' });
    
    return `שלום,\n\nיש לנו בעיה בלוח זמנים ל${dayName} (${date}) - ${reason}.\nהאם תוכל לקחת משמרת ${shiftType}?\n\nאנא הודע בהקדם. תודה!`;
  }
}

module.exports = ContactTracker;