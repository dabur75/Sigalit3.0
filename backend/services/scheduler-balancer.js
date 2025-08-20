/**
 * Scheduler Balancer - Fair Distribution Engine
 * Ensures equal salary factors and balanced weekly distribution
 */

class SchedulerBalancer {
  constructor() {
    this.salaryFactors = {
      regular: 1.0,
      night: 1.5,
      shabbat: 2.0,
      conan: 0.3,
      conan_shabbat: 0.6,
      motzash: 1.0
    };
  }

  /**
   * Calculate salary factor for a specific shift
   */
  calculateShiftSalaryFactor(role, dayOfWeek, weekendType, isNight = false) {
    let factor = 0;

    switch (role) {
      case 'רגיל':
        if (dayOfWeek === 6) { // Saturday
          factor = this.salaryFactors.shabbat; // ×2.0
        } else if (isNight) {
          factor = this.salaryFactors.night; // ×1.5
        } else {
          factor = this.salaryFactors.regular; // ×1.0
        }
        break;

      case 'חפיפה':
        // Same as regular for salary calculation
        if (dayOfWeek === 6) {
          factor = this.salaryFactors.shabbat;
        } else if (isNight) {
          factor = this.salaryFactors.night;
        } else {
          factor = this.salaryFactors.regular;
        }
        break;

      case 'כונן':
        if (dayOfWeek === 6) {
          factor = this.salaryFactors.conan_shabbat; // ×0.6
        } else {
          factor = this.salaryFactors.conan; // ×0.3
        }
        break;

      case 'מוצ״ש':
        factor = this.salaryFactors.motzash; // ×1.0
        break;

      default:
        factor = this.salaryFactors.regular;
    }

    return factor;
  }

  /**
   * Calculate total salary factors for a guide across entire schedule
   */
  calculateGuideSalaryFactors(guideId, schedule, weekendTypes) {
    let totalFactor = 0;
    let shiftCount = 0;
    const shiftDetails = [];

    schedule.forEach(day => {
      const date = day.date;
      const dayOfWeek = new Date(date).getDay();
      const weekendType = weekendTypes[date];

      // Check if guide works this day and in what role
      let role = null;
      if (day.guide1_id === guideId) {
        role = day.guide1_role;
      } else if (day.guide2_id === guideId) {
        role = day.guide2_role;
      }

      if (role) {
        const shiftFactor = this.calculateShiftSalaryFactor(role, dayOfWeek, weekendType);
        totalFactor += shiftFactor;
        shiftCount++;
        
        shiftDetails.push({
          date: date,
          role: role,
          dayOfWeek: dayOfWeek,
          factor: shiftFactor,
          isWeekend: dayOfWeek === 5 || dayOfWeek === 6
        });
      }
    });

    return {
      guideId: guideId,
      totalFactor: totalFactor,
      shiftCount: shiftCount,
      averageFactorPerShift: shiftCount > 0 ? totalFactor / shiftCount : 0,
      shifts: shiftDetails
    };
  }

  /**
   * Calculate fairness metrics for all guides
   */
  calculateFairnessMetrics(allGuides, schedule, weekendTypes, excludeManualOnly = true) {
    const metrics = {
      guides: {},
      overall: {},
      recommendations: []
    };

    // Calculate salary factors for each guide
    allGuides.forEach(guide => {
      // Skip manual_only guides if requested
      if (excludeManualOnly && this.isManualOnlyGuide(guide)) {
        return;
      }

      const guideSalary = this.calculateGuideSalaryFactors(guide.id, schedule, weekendTypes);
      metrics.guides[guide.id] = {
        ...guideSalary,
        name: guide.name
      };
    });

    // Calculate overall metrics
    const guideIds = Object.keys(metrics.guides);
    const totalFactors = guideIds.map(id => metrics.guides[id].totalFactor);
    const shiftCounts = guideIds.map(id => metrics.guides[id].shiftCount);

    if (guideIds.length > 0) {
      metrics.overall = {
        averageSalaryFactor: totalFactors.reduce((a, b) => a + b, 0) / guideIds.length,
        averageShiftCount: shiftCounts.reduce((a, b) => a + b, 0) / guideIds.length,
        maxSalaryFactor: Math.max(...totalFactors),
        minSalaryFactor: Math.min(...totalFactors),
        salaryFactorRange: Math.max(...totalFactors) - Math.min(...totalFactors),
        fairnessScore: this.calculateFairnessScore(totalFactors)
      };

      // Generate recommendations
      metrics.recommendations = this.generateFairnessRecommendations(metrics);
    }

    return metrics;
  }

  /**
   * Calculate fairness score (0-100, higher is better)
   */
  calculateFairnessScore(salaryFactors) {
    if (salaryFactors.length === 0) return 100;

    const mean = salaryFactors.reduce((a, b) => a + b, 0) / salaryFactors.length;
    const variance = salaryFactors.reduce((sum, factor) => sum + Math.pow(factor - mean, 2), 0) / salaryFactors.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 0;

    // Convert to 0-100 score (lower variation = higher score)
    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  /**
   * Generate recommendations for improving fairness
   */
  generateFairnessRecommendations(metrics) {
    const recommendations = [];
    const { overall, guides } = metrics;

    if (!overall.averageSalaryFactor) return recommendations;

    // Find guides who are significantly over/under average
    const threshold = overall.averageSalaryFactor * 0.15; // 15% threshold
    
    const overworked = Object.values(guides).filter(
      g => g.totalFactor > overall.averageSalaryFactor + threshold
    );
    const underworked = Object.values(guides).filter(
      g => g.totalFactor < overall.averageSalaryFactor - threshold
    );

    if (overworked.length > 0) {
      recommendations.push({
        type: 'reduce_load',
        title: 'הפחת עומס מיתר',
        message: `${overworked.length} מדריכים עם עומס שכר גבוה מדי`,
        guides: overworked.map(g => ({
          name: g.name,
          currentFactor: g.totalFactor,
          excess: (g.totalFactor - overall.averageSalaryFactor).toFixed(2)
        })),
        priority: 'high'
      });
    }

    if (underworked.length > 0) {
      recommendations.push({
        type: 'increase_load',
        title: 'הגדל עומס מחוסרי שעות',
        message: `${underworked.length} מדריכים עם עומס שכר נמוך מדי`,
        guides: underworked.map(g => ({
          name: g.name,
          currentFactor: g.totalFactor,
          deficit: (overall.averageSalaryFactor - g.totalFactor).toFixed(2)
        })),
        priority: 'high'
      });
    }

    // Check for weekend imbalance
    const weekendImbalance = this.checkWeekendBalance(guides);
    if (weekendImbalance.length > 0) {
      recommendations.push({
        type: 'weekend_balance',
        title: 'איזון משמרות סופ״ש',
        message: 'חלוקה לא מאוזנת של משמרות סופי שבוע',
        details: weekendImbalance,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Check weekend balance among guides
   */
  checkWeekendBalance(guides) {
    const weekendCounts = Object.values(guides).map(guide => ({
      name: guide.name,
      weekendShifts: guide.shifts.filter(s => s.isWeekend).length,
      totalShifts: guide.shiftCount
    }));

    const averageWeekendShifts = weekendCounts.reduce((sum, g) => sum + g.weekendShifts, 0) / weekendCounts.length;
    
    return weekendCounts.filter(g => 
      Math.abs(g.weekendShifts - averageWeekendShifts) > 2 // More than 2 shifts difference
    );
  }

  /**
   * Calculate weekly distribution for a guide
   */
  calculateWeeklyDistribution(guideId, schedule) {
    const weeks = {};
    
    schedule.forEach(day => {
      const date = new Date(day.date);
      const weekStart = this.getWeekStart(date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { shifts: 0, dates: [] };
      }

      // Check if guide works this day
      if (day.guide1_id === guideId || day.guide2_id === guideId) {
        weeks[weekKey].shifts++;
        weeks[weekKey].dates.push(day.date);
      }
    });

    return weeks;
  }

  /**
   * Get start of week (Sunday in Israeli calendar)
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday is 0
    return new Date(d.setDate(diff));
  }

  /**
   * Check if weekly distribution is balanced
   */
  checkWeeklyBalance(guideId, schedule) {
    const weeklyDist = this.calculateWeeklyDistribution(guideId, schedule);
    const shiftCounts = Object.values(weeklyDist).map(w => w.shifts);
    
    const issues = [];
    
    // Check for weeks with too many shifts (>3)
    const overloadedWeeks = Object.entries(weeklyDist)
      .filter(([week, data]) => data.shifts > 3)
      .map(([week, data]) => ({ week, shifts: data.shifts }));
    
    if (overloadedWeeks.length > 0) {
      issues.push({
        type: 'overloaded_weeks',
        message: `${overloadedWeeks.length} שבועות עם יותר מ-3 משמרות`,
        weeks: overloadedWeeks
      });
    }

    // Check for uneven distribution
    const maxShifts = Math.max(...shiftCounts);
    const minShifts = Math.min(...shiftCounts);
    
    if (maxShifts - minShifts > 2) {
      issues.push({
        type: 'uneven_distribution',
        message: `חלוקה לא מאוזנת: ${minShifts}-${maxShifts} משמרות לשבוע`,
        maxShifts,
        minShifts,
        range: maxShifts - minShifts
      });
    }

    return {
      balanced: issues.length === 0,
      issues: issues,
      weeklyData: weeklyDist
    };
  }

  /**
   * Score guides for assignment based on fairness
   */
  scoreGuidesForFairness(availableGuides, currentSchedule, weekendTypes, targetRole, targetDate) {
    return availableGuides.map(guide => {
      const currentMetrics = this.calculateGuideSalaryFactors(guide.id, currentSchedule, weekendTypes);
      const weeklyBalance = this.checkWeeklyBalance(guide.id, currentSchedule);
      
      // Calculate what salary factor this assignment would add
      const dayOfWeek = new Date(targetDate).getDay();
      const weekendType = weekendTypes[targetDate];
      const additionalFactor = this.calculateShiftSalaryFactor(targetRole, dayOfWeek, weekendType);
      
      let score = 0;
      
      // Fairness score: prefer guides with lower current salary factors
      const avgFactor = 10; // Rough average, could be calculated dynamically
      const factorDeficit = avgFactor - currentMetrics.totalFactor;
      score += factorDeficit * 100; // High weight for salary equality
      
      // Weekly balance score: prefer guides with fewer shifts this week
      const thisWeekShifts = this.getShiftsThisWeek(guide.id, targetDate, currentSchedule);
      score += Math.max(0, 3 - thisWeekShifts) * 50; // Prefer guides with <3 shifts this week
      
      // High-value shift bonus: prefer underworked guides for high-factor shifts
      if (additionalFactor > 1.5 && currentMetrics.totalFactor < avgFactor) {
        score += 75; // Bonus for giving high-value shifts to underworked guides
      }
      
      // Consecutive shift penalty
      if (this.workedPreviousDay(guide.id, targetDate, currentSchedule)) {
        score -= 1000; // Heavy penalty - should be caught by constraints but double-check
      }

      return {
        guide: guide,
        score: score,
        currentFactor: currentMetrics.totalFactor,
        additionalFactor: additionalFactor,
        projectedTotal: currentMetrics.totalFactor + additionalFactor,
        thisWeekShifts: thisWeekShifts,
        weeklyBalanced: weeklyBalance.balanced
      };
    });
  }

  /**
   * Get number of shifts this week for guide
   */
  getShiftsThisWeek(guideId, targetDate, schedule) {
    const targetWeekStart = this.getWeekStart(new Date(targetDate));
    const targetWeekEnd = new Date(targetWeekStart);
    targetWeekEnd.setDate(targetWeekEnd.getDate() + 6);
    
    return schedule.filter(day => {
      const dayDate = new Date(day.date);
      const inThisWeek = dayDate >= targetWeekStart && dayDate <= targetWeekEnd;
      const guideWorks = day.guide1_id === guideId || day.guide2_id === guideId;
      return inThisWeek && guideWorks;
    }).length;
  }

  /**
   * Check if guide worked previous day
   */
  workedPreviousDay(guideId, targetDate, schedule) {
    const target = new Date(targetDate);
    const yesterday = new Date(target);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdaySchedule = schedule.find(day => day.date === yesterdayStr);
    if (!yesterdaySchedule) return false;
    
    return yesterdaySchedule.guide1_id === guideId || yesterdaySchedule.guide2_id === guideId;
  }

  /**
   * Check if guide has manual_only restriction
   */
  isManualOnlyGuide(guide) {
    // This would check coordinator rules - simplified for now
    return false;
  }

  /**
   * Generate balancing suggestions for improving schedule fairness
   */
  generateBalancingSuggestions(currentSchedule, weekendTypes, allGuides) {
    const metrics = this.calculateFairnessMetrics(allGuides, currentSchedule, weekendTypes);
    const suggestions = [];

    // Find potential swaps to improve balance
    const overworked = Object.values(metrics.guides)
      .filter(g => g.totalFactor > metrics.overall.averageSalaryFactor * 1.15)
      .sort((a, b) => b.totalFactor - a.totalFactor);

    const underworked = Object.values(metrics.guides)
      .filter(g => g.totalFactor < metrics.overall.averageSalaryFactor * 0.85)
      .sort((a, b) => a.totalFactor - b.totalFactor);

    // Suggest swaps between overworked and underworked guides
    overworked.forEach(overGuide => {
      underworked.forEach(underGuide => {
        const swapOpportunities = this.findSwapOpportunities(
          overGuide, underGuide, currentSchedule, weekendTypes
        );
        
        swapOpportunities.forEach(swap => {
          suggestions.push({
            type: 'swap_suggestion',
            fromGuide: overGuide.name,
            toGuide: underGuide.name,
            date: swap.date,
            expectedImprovement: swap.improvement,
            reason: `הפחת עומס מ-${overGuide.name} והגדל עומס ל-${underGuide.name}`
          });
        });
      });
    });

    return {
      currentFairnessScore: metrics.overall.fairnessScore,
      suggestions: suggestions.slice(0, 10), // Top 10 suggestions
      metrics: metrics
    };
  }

  /**
   * Find swap opportunities between two guides
   */
  findSwapOpportunities(overGuide, underGuide, schedule, weekendTypes) {
    const opportunities = [];
    
    // Find days where overworked guide is scheduled
    const overGuideShifts = schedule.filter(day => 
      day.guide1_id === overGuide.guideId || day.guide2_id === overGuide.guideId
    );

    overGuideShifts.forEach(day => {
      // Check if underworked guide could take this shift
      // This would need full constraint checking - simplified for now
      
      const dayOfWeek = new Date(day.date).getDay();
      const currentFactor = this.calculateShiftSalaryFactor(
        day.guide1_id === overGuide.guideId ? day.guide1_role : day.guide2_role,
        dayOfWeek,
        weekendTypes[day.date]
      );
      
      opportunities.push({
        date: day.date,
        shiftFactor: currentFactor,
        improvement: currentFactor * 2 // Factor moves from over to under
      });
    });

    return opportunities.slice(0, 3); // Top 3 opportunities
  }

  /**
   * Calculate optimal target salary factors for all guides
   */
  calculateOptimalTargets(totalSlotsNeeded, eligibleGuides, monthlyShiftBreakdown) {
    const targets = {};
    const avgSlotsPerGuide = totalSlotsNeeded / eligibleGuides.length;
    
    // Estimate average salary factor based on shift type distribution
    const estimatedAvgFactor = this.estimateAverageSalaryFactor(monthlyShiftBreakdown);
    
    eligibleGuides.forEach(guide => {
      targets[guide.id] = {
        targetShifts: Math.round(avgSlotsPerGuide),
        targetSalaryFactor: estimatedAvgFactor,
        tolerance: estimatedAvgFactor * 0.1, // 10% tolerance
        priority: 'normal'
      };
    });
    
    return targets;
  }

  /**
   * Estimate average salary factor based on expected shift distribution
   */
  estimateAverageSalaryFactor(shiftBreakdown) {
    let totalFactor = 0;
    let totalShifts = 0;
    
    Object.entries(shiftBreakdown).forEach(([shiftType, count]) => {
      const factor = this.salaryFactors[shiftType] || 1.0;
      totalFactor += factor * count;
      totalShifts += count;
    });
    
    return totalShifts > 0 ? totalFactor / totalShifts : 1.0;
  }
}

module.exports = SchedulerBalancer;