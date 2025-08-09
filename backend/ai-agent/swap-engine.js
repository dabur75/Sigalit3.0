/**
 * Swap Engine - Core logic for finding optimal guide swaps
 */

class SwapEngine {
  constructor(database) {
    this.db = database;
  }

  /**
   * Find all possible swap solutions for an emergency
   */
  async findSwapSolutions({ unavailableGuideId, date, shiftType }) {
    const solutions = [];

    // Get all active guides
    const guides = await this.getActiveGuides();
    
    // Get current schedule constraints
    const constraints = await this.getConstraintsForDate(date);
    
    // Get existing schedule for the month
    const existingSchedule = await this.getMonthlySchedule(date);

    // 1. Find direct replacement options (simple 1:1 swap)
    const directSwaps = await this.findDirectReplacements(
      unavailableGuideId, date, shiftType, guides, constraints
    );
    solutions.push(...directSwaps);

    // 2. Find chain swap options (A->B->C->A)
    const chainSwaps = await this.findChainSwaps(
      unavailableGuideId, date, shiftType, guides, constraints, existingSchedule
    );
    solutions.push(...chainSwaps);

    // 3. Find split shift options (divide the shift)
    const splitOptions = await this.findSplitShiftOptions(
      unavailableGuideId, date, shiftType, guides, constraints
    );
    solutions.push(...splitOptions);

    // Calculate impact scores for all solutions
    for (const solution of solutions) {
      solution.impactScore = await this.calculateImpactScore(solution, existingSchedule);
      solution.workloadImpact = await this.calculateWorkloadImpact(solution, existingSchedule);
      solution.constraintViolations = await this.checkConstraintViolations(solution, constraints);
    }

    // Sort by quality (lowest impact score = best)
    return solutions.sort((a, b) => a.impactScore - b.impactScore);
  }

  /**
   * Find direct 1:1 replacement options
   */
  async findDirectReplacements(unavailableGuideId, date, shiftType, guides, constraints) {
    const solutions = [];
    const weekday = new Date(date).getDay();

    for (const guide of guides) {
      if (guide.id === unavailableGuideId) continue;

      // Check if guide is available on this date
      const isAvailable = await this.checkGuideAvailability(
        guide.id, date, weekday, constraints
      );

      if (isAvailable.available) {
        solutions.push({
          type: 'direct',
          swapType: 'direct',
          primaryGuide: guide,
          affectedGuides: [guide],
          originalGuide: { id: unavailableGuideId },
          date,
          shiftType,
          complexity: 1,
          description: `${guide.name} יחליף את המדריך הנעדר`
        });
      }
    }

    return solutions;
  }

  /**
   * Find chain swap solutions (multi-guide rotations)
   */
  async findChainSwaps(unavailableGuideId, date, shiftType, guides, constraints, existingSchedule) {
    const solutions = [];
    const maxChainLength = 3; // Limit complexity

    // Find guides who could potentially take the shift but have conflicts
    const potentialGuides = [];
    
    for (const guide of guides) {
      if (guide.id === unavailableGuideId) continue;
      
      const availability = await this.checkGuideAvailability(
        guide.id, date, new Date(date).getDay(), constraints
      );
      
      if (!availability.available && availability.reasons.includes('scheduled_shift')) {
        // This guide has a scheduled shift that day - potential for chain swap
        potentialGuides.push({
          guide,
          conflictDate: date,
          currentShift: await this.getGuideShiftOnDate(guide.id, date)
        });
      }
    }

    // Try to build chains
    for (const potentialGuide of potentialGuides) {
      const chain = await this.buildSwapChain(
        potentialGuide, unavailableGuideId, date, guides, constraints, maxChainLength
      );
      
      if (chain && chain.length > 1) {
        solutions.push({
          type: 'chain',
          swapType: 'chain',
          primaryGuide: potentialGuide.guide,
          affectedGuides: chain.map(c => c.guide),
          chain,
          date,
          shiftType,
          complexity: chain.length,
          description: this.generateChainDescription(chain)
        });
      }
    }

    return solutions;
  }

  /**
   * Build a chain swap solution recursively
   */
  async buildSwapChain(startGuide, unavailableGuideId, targetDate, guides, constraints, maxDepth, currentChain = []) {
    if (currentChain.length >= maxDepth) return null;

    currentChain.push(startGuide);

    // Find someone who can cover startGuide's current shift
    const startGuideShift = startGuide.currentShift;
    
    for (const replacementGuide of guides) {
      if (replacementGuide.id === unavailableGuideId) continue;
      if (currentChain.find(c => c.guide.id === replacementGuide.id)) continue;

      const canCoverShift = await this.checkGuideAvailability(
        replacementGuide.id, 
        startGuideShift.date, 
        new Date(startGuideShift.date).getDay(), 
        constraints
      );

      if (canCoverShift.available) {
        // Found complete chain
        currentChain.push({
          guide: replacementGuide,
          takesShiftFrom: startGuide.guide.id,
          shiftDate: startGuideShift.date
        });
        return currentChain;
      } else if (canCoverShift.reasons.includes('scheduled_shift')) {
        // Need to go deeper in the chain
        const deeperChain = await this.buildSwapChain(
          { 
            guide: replacementGuide, 
            currentShift: await this.getGuideShiftOnDate(replacementGuide.id, startGuideShift.date)
          },
          unavailableGuideId,
          targetDate,
          guides,
          constraints,
          maxDepth,
          [...currentChain]
        );
        
        if (deeperChain) {
          return deeperChain;
        }
      }
    }

    return null;
  }

  /**
   * Find split shift options (divide the problematic shift)
   */
  async findSplitShiftOptions(unavailableGuideId, date, shiftType, guides, constraints) {
    // Only applicable for longer shifts that can be meaningfully split
    if (shiftType !== 'night' && shiftType !== 'weekend') {
      return [];
    }

    const solutions = [];
    const availableGuides = [];

    // Find guides available for partial coverage
    for (const guide of guides) {
      if (guide.id === unavailableGuideId) continue;
      
      const availability = await this.checkGuideAvailability(
        guide.id, date, new Date(date).getDay(), constraints
      );
      
      if (availability.partiallyAvailable) {
        availableGuides.push({
          guide,
          availableHours: availability.availableHours
        });
      }
    }

    // Try to combine guides to cover the full shift
    if (availableGuides.length >= 2) {
      const combinations = this.findCoverageCombinations(availableGuides, shiftType);
      
      for (const combo of combinations) {
        solutions.push({
          type: 'split',
          swapType: 'split',
          primaryGuide: combo[0].guide,
          affectedGuides: combo.map(c => c.guide),
          splitSchedule: combo,
          date,
          shiftType,
          complexity: combo.length,
          description: `משמרת מחולקת: ${combo.map(c => `${c.guide.name} (${c.hours})`).join(', ')}`
        });
      }
    }

    return solutions;
  }

  /**
   * Check guide availability considering all constraints
   */
  async checkGuideAvailability(guideId, date, weekday, constraints) {
    const result = {
      available: true,
      reasons: [],
      partiallyAvailable: false,
      availableHours: null
    };

    // Check regular constraints (specific date)
    const dateConstraints = constraints.filter(c => 
      c.user_id === guideId && c.date === date
    );
    
    if (dateConstraints.length > 0) {
      result.available = false;
      result.reasons.push('date_constraint');
    }

    // Check fixed constraints (weekly recurring)
    const fixedConstraints = constraints.filter(c => 
      c.user_id === guideId && c.weekday === weekday
    );
    
    if (fixedConstraints.length > 0) {
      result.available = false;
      result.reasons.push('fixed_constraint');
    }

    // Check if already scheduled on this date
    const existingShift = await this.getGuideShiftOnDate(guideId, date);
    if (existingShift) {
      result.available = false;
      result.reasons.push('scheduled_shift');
    }

    // Check vacations
    const onVacation = await this.checkGuideVacation(guideId, date);
    if (onVacation) {
      result.available = false;
      result.reasons.push('vacation');
    }

    return result;
  }

  /**
   * Calculate impact score for a swap solution (lower is better)
   */
  async calculateImpactScore(solution, existingSchedule) {
    let score = 0;

    // Complexity penalty
    score += solution.complexity * 10;

    // Constraint violation penalty
    score += solution.constraintViolations * 50;

    // Workload imbalance penalty
    score += solution.workloadImpact * 20;

    // Type-specific scoring
    switch (solution.swapType) {
      case 'direct':
        score += 0; // Best case
        break;
      case 'chain':
        score += solution.chain.length * 15;
        break;
      case 'split':
        score += 25; // Split shifts are complex
        break;
    }

    return score;
  }

  /**
   * Calculate workload impact of proposed solution
   */
  async calculateWorkloadImpact(solution, existingSchedule) {
    // Calculate how much this solution affects workload distribution
    const currentWorkload = await this.calculateCurrentWorkload(existingSchedule);
    const projectedWorkload = await this.calculateWorkloadAfterSwap(solution, currentWorkload);
    
    // Return standard deviation change (lower is better)
    const currentStdDev = this.calculateStandardDeviation(Object.values(currentWorkload));
    const projectedStdDev = this.calculateStandardDeviation(Object.values(projectedWorkload));
    
    return projectedStdDev - currentStdDev;
  }

  /**
   * Execute confirmed swap in the database
   */
  async executeSwap(emergencyId, swapSolution, coordinatorId) {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Update the original shift
      await this.updateScheduleAssignment(
        swapSolution.date,
        swapSolution.originalGuide.id,
        swapSolution.primaryGuide.id,
        client
      );

      // Handle chain swaps
      if (swapSolution.type === 'chain') {
        for (let i = 0; i < swapSolution.chain.length - 1; i++) {
          const current = swapSolution.chain[i];
          const next = swapSolution.chain[i + 1];
          
          await this.updateScheduleAssignment(
            current.shiftDate,
            current.guide.id,
            next.guide.id,
            client
          );
        }
      }

      // Log the executed swap
      await client.query(`
        INSERT INTO executed_swaps 
        (emergency_id, final_solution, affected_guides, executed_at, coordinator_id)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
      `, [
        emergencyId,
        JSON.stringify(swapSolution),
        JSON.stringify(swapSolution.affectedGuides.map(g => g.id)),
        coordinatorId
      ]);

      // Mark emergency as resolved
      await client.query(`
        UPDATE emergency_swap_requests 
        SET resolved_at = CURRENT_TIMESTAMP, resolution_type = 'internal_swap'
        WHERE id = $1
      `, [emergencyId]);

      await client.query('COMMIT');
      return { success: true, message: 'החלפה בוצעה בהצלחה' };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Helper methods
  async getActiveGuides() {
    const query = "SELECT id, name, role, phone, email FROM users WHERE role = 'מדריך' AND is_active = true";
    const result = await this.db.query(query);
    return result.rows;
  }

  async getConstraintsForDate(date) {
    const weekday = new Date(date).getDay();
    const query = `
      SELECT id, user_id, type, date, details, house_id, created_at, null as weekday, null as hour_start, null as hour_end
      FROM constraints WHERE date = $1
      UNION ALL
      SELECT id, user_id, 'fixed' as type, $1 as date, details, 'dror' as house_id, created_at, weekday, hour_start, hour_end
      FROM fixed_constraints WHERE weekday = $2
    `;
    const result = await this.db.query(query, [date, weekday]);
    return result.rows;
  }

  async getMonthlySchedule(date) {
    const yearMonth = date.substring(0, 7); // YYYY-MM
    const query = "SELECT * FROM schedule WHERE date::text LIKE $1 || '%' ORDER BY date";
    const result = await this.db.query(query, [yearMonth]);
    return result.rows;
  }

  async getGuideShiftOnDate(guideId, date) {
    const query = `
      SELECT * FROM schedule 
      WHERE (guide1_id = $1 OR guide2_id = $1) AND date = $2
    `;
    const result = await this.db.query(query, [guideId, date]);
    return result.rows[0] || null;
  }

  async checkGuideVacation(guideId, date) {
    const query = `
      SELECT * FROM vacations 
      WHERE user_id = $1 AND status = 'approved' 
        AND date_start <= $2 AND date_end >= $2
    `;
    const result = await this.db.query(query, [guideId, date]);
    return result.rows.length > 0;
  }

  calculateStandardDeviation(values) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  generateChainDescription(chain) {
    const steps = chain.map((step, index) => {
      if (index === 0) {
        return `${step.guide.name} יקח את המשמרת`;
      } else {
        return `${step.guide.name} יחליף את ${chain[index-1].guide.name}`;
      }
    });
    
    return steps.join(' ← ');
  }

  findCoverageCombinations(availableGuides, shiftType) {
    // Simplified: just return pairs for now
    const combinations = [];
    
    for (let i = 0; i < availableGuides.length - 1; i++) {
      for (let j = i + 1; j < availableGuides.length; j++) {
        const guide1 = availableGuides[i];
        const guide2 = availableGuides[j];
        
        combinations.push([
          { ...guide1, hours: '22:00-02:00' },
          { ...guide2, hours: '02:00-06:00' }
        ]);
      }
    }
    
    return combinations;
  }

  async updateScheduleAssignment(date, oldGuideId, newGuideId, client) {
    const updateQuery = `
      UPDATE schedule 
      SET guide1_id = CASE WHEN guide1_id = $1 THEN $2 ELSE guide1_id END,
          guide2_id = CASE WHEN guide2_id = $1 THEN $2 ELSE guide2_id END,
          updated_at = CURRENT_TIMESTAMP
      WHERE date = $3 AND (guide1_id = $1 OR guide2_id = $1)
    `;
    
    await client.query(updateQuery, [oldGuideId, newGuideId, date]);
  }

  async calculateCurrentWorkload(existingSchedule) {
    const workload = {};
    
    for (const shift of existingSchedule) {
      if (shift.guide1_id) {
        workload[shift.guide1_id] = (workload[shift.guide1_id] || 0) + 1;
      }
      if (shift.guide2_id) {
        workload[shift.guide2_id] = (workload[shift.guide2_id] || 0) + 1;
      }
    }
    
    return workload;
  }

  async calculateWorkloadAfterSwap(solution, currentWorkload) {
    const newWorkload = { ...currentWorkload };
    
    // Apply the swap changes
    for (const guide of solution.affectedGuides) {
      newWorkload[guide.id] = (newWorkload[guide.id] || 0) + 1;
    }
    
    return newWorkload;
  }

  async checkConstraintViolations(solution, constraints) {
    let violations = 0;
    
    for (const guide of solution.affectedGuides) {
      const guideConstraints = constraints.filter(c => c.user_id === guide.id);
      // Check if this solution violates any constraints
      // Simplified for now
      violations += guideConstraints.length * 0.1; // Soft penalty
    }
    
    return violations;
  }

  async findOptimizationOpportunities(year, month) {
    // Future feature: proactive optimization suggestions
    return [];
  }
}

module.exports = SwapEngine;