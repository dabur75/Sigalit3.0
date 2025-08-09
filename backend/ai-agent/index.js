/**
 * AI Agent for Sigalit Scheduling System
 * Main entry point for intelligent scheduling assistance
 */

const SwapEngine = require('./swap-engine');
const LearningSystem = require('./learning-system');
const ContactTracker = require('./contact-tracker');

class SigalitAI {
  constructor(database) {
    this.db = database;
    this.swapEngine = new SwapEngine(database);
    this.learningSystem = new LearningSystem(database);
    this.contactTracker = new ContactTracker(database);
  }

  /**
   * Main entry point for emergency swap recommendations
   * @param {Object} emergency - Emergency details
   * @returns {Object} Prioritized swap suggestions
   */
  async getEmergencySwapRecommendations(emergency) {
    const { unavailableGuideId, date, shiftType, reason } = emergency;

    try {
      // Log the emergency request
      const emergencyId = await this.logEmergencyRequest(emergency);

      // Get all possible swap solutions
      const swapOptions = await this.swapEngine.findSwapSolutions({
        unavailableGuideId,
        date,
        shiftType
      });

      // Prioritize based on historical acceptance patterns
      const prioritizedOptions = await this.learningSystem.prioritizeOptions(
        swapOptions,
        unavailableGuideId,
        date
      );

      // Store suggestions in database and add contact information
      const recommendationsWithContact = await this.storeAndEnrichSuggestions(
        prioritizedOptions,
        emergencyId
      );

      return {
        emergencyId,
        recommendations: recommendationsWithContact,
        timestamp: new Date().toISOString(),
        totalOptions: swapOptions.length
      };

    } catch (error) {
      console.error('AI Emergency Swap Error:', error);
      throw new Error('Failed to generate swap recommendations');
    }
  }

  /**
   * Record coordinator contact attempt results for learning
   */
  async recordContactResult(emergencyId, contactResult) {
    return this.contactTracker.recordContact(emergencyId, contactResult);
  }

  /**
   * Execute confirmed swap after human approval
   */
  async executeConfirmedSwap(emergencyId, swapSolution, coordinatorId) {
    return this.swapEngine.executeSwap(emergencyId, swapSolution, coordinatorId);
  }

  /**
   * Log emergency request to database
   */
  async logEmergencyRequest(emergency) {
    const query = `
      INSERT INTO emergency_swap_requests 
      (original_guide_id, date, shift_type, reason, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    
    const result = await this.db.query(query, [
      emergency.unavailableGuideId,
      emergency.date,
      emergency.shiftType,
      emergency.reason || 'Emergency unavailability'
    ]);

    return result.rows[0].id;
  }

  /**
   * Store suggestions in database and enrich with contact details
   */
  async storeAndEnrichSuggestions(swapOptions, emergencyId) {
    const enrichedOptions = [];

    for (let i = 0; i < swapOptions.length; i++) {
      const option = swapOptions[i];
      
      const likelihood = await this.learningSystem.calculateAcceptanceProbability(
        option.primaryGuide.id,
        option.swapType,
        emergencyId
      );

      const contactInfo = await this.getGuideContactInfo(option.primaryGuide.id);
      const reasoning = this.generateReasoningText(option, likelihood);

      // Store suggestion in database
      const suggestionQuery = `
        INSERT INTO ai_swap_suggestions 
        (emergency_id, suggestion_data, suggestion_type, priority_rank, likelihood_score, 
         impact_score, complexity_level, reasoning)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const likelihoodInt = isNaN(likelihood) ? 60 : Math.round(likelihood * 100);
      const impactScore = isNaN(option.impactScore) ? 0 : option.impactScore;
      const complexity = isNaN(option.complexity) ? 1 : option.complexity;

      const suggestionResult = await this.db.query(suggestionQuery, [
        emergencyId,
        JSON.stringify(option),
        option.swapType || 'direct',
        i + 1,
        likelihoodInt,
        impactScore,
        complexity,
        reasoning
      ]);

      const suggestionId = suggestionResult.rows[0].id;

      enrichedOptions.push({
        ...option,
        suggestionId,
        likelihood: likelihoodInt,
        contactInfo,
        reasoning
      });
    }

    // Sort by likelihood (highest first)
    return enrichedOptions.sort((a, b) => b.likelihood - a.likelihood);
  }

  /**
   * Enrich swap options with contact details and likelihood scores (legacy method)
   */
  async enrichWithContactInfo(swapOptions, emergencyId) {
    return this.storeAndEnrichSuggestions(swapOptions, emergencyId);
  }

  /**
   * Get guide contact information
   */
  async getGuideContactInfo(guideId) {
    const query = 'SELECT name, phone, email FROM users WHERE id = $1';
    const result = await this.db.query(query, [guideId]);
    return result.rows[0] || null;
  }

  /**
   * Generate human-readable reasoning for swap suggestion
   */
  generateReasoningText(option, likelihood) {
    const reasons = [];

    if (option.constraintViolations === 0) {
      reasons.push('אין הפרות אילוצים');
    }

    if (option.workloadImpact < 0.2) {
      reasons.push('השפעה מינימלית על חלוקת העומס');
    }

    if (likelihood > 0.8) {
      reasons.push('היסטוריה של קבלת משמרות חירום');
    }

    if (option.swapType === 'direct') {
      reasons.push('החלפה ישירה - אין צורך במדריכים נוספים');
    }

    return reasons.join(' • ');
  }

  /**
   * Get AI insights for proactive scheduling optimization
   */
  async getScheduleOptimizationSuggestions(year, month) {
    return this.swapEngine.findOptimizationOpportunities(year, month);
  }

  /**
   * Learn from coordinator feedback on suggestions
   */
  async recordFeedback(emergencyId, feedback) {
    return this.learningSystem.recordFeedback(emergencyId, feedback);
  }
}

module.exports = SigalitAI;