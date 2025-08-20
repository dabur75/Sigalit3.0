/**
 * Salary Calculator Service
 * 
 * Handles all salary factor calculations for the enhanced manual scheduler.
 * Uses the correct multipliers from reports.html:
 * - Regular: ×1.0
 * - Night: ×1.5  
 * - Shabbat: ×2.0
 * - On-call (כונן): ×0.3
 * - On-call Shabbat: ×0.6
 * - Motzash: ×1.0
 */

class SalaryCalculator {
  
  constructor() {
    // Official salary factor multipliers
    this.MULTIPLIERS = {
      regular: 1.0,
      night: 1.5,
      shabbat: 2.0,
      conan: 0.3,          // כונן
      conan_shabbat: 0.6,  // כונן שבת
      motzash: 1.0         // מוצ״ש
    };
  }
  
  /**
   * Calculate comprehensive statistics for a guide in a given month
   * @param {Array} schedule - Schedule data for the month
   * @param {number} guideId - Guide user ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @param {Object} weekendTypes - Weekend type mapping {date: is_closed}
   * @returns {Object} Complete statistics object
   */
  calculateGuideStatistics(schedule, guideId, year, month, weekendTypes = {}) {
    const stats = {
      // Shift counts
      total_shifts: 0,
      manual_shifts: 0,
      auto_shifts: 0,
      regular_shifts: 0,
      overlap_shifts: 0,
      conan_shifts: 0,
      motzash_shifts: 0,
      weekend_shifts: 0,
      
      // Hour breakdowns
      regular_hours: 0,
      night_hours: 0,
      shabbat_hours: 0,
      conan_hours: 0,
      conan_shabbat_hours: 0,
      motzash_hours: 0,
      total_hours: 0,
      
      // Salary calculation
      salary_factor: 0,
      
      // Additional metrics
      average_hours_per_shift: 0,
      efficiency_ratio: 0
    };
    
    // Process each day in the schedule
    schedule.forEach((day, index) => {
      const isGuide1 = day.guide1_id === guideId;
      const isGuide2 = day.guide2_id === guideId;
      
      if (isGuide1 || isGuide2) {
        const role = isGuide1 ? day.guide1_role : day.guide2_role;
        
        // Count shifts
        this._countShift(stats, day, role);
        
        // Calculate hours for this shift
        const hours = this.calculateHoursForShift(day, role, weekendTypes, schedule, index);
        
        // Add hours to totals
        this._addHours(stats, hours);
      }
    });
    
    // Calculate derived metrics
    this._calculateDerivedMetrics(stats);
    
    return stats;
  }
  
  /**
   * Calculate hours for a specific shift
   * @param {Object} day - Schedule day object
   * @param {string} role - Guide role (רגיל, כונן, חפיפה, מוצ״ש)
   * @param {Object} weekendTypes - Weekend type mapping
   * @param {Array} schedule - Full schedule for context
   * @param {number} dayIndex - Index of day in schedule
   * @returns {Object} Hours breakdown
   */
  calculateHoursForShift(day, role, weekendTypes = {}, schedule = [], dayIndex = 0) {
    const hours = {
      regular: 0,
      night: 0,
      shabbat: 0,
      conan: 0,
      conan_shabbat: 0,
      motzash: 0
    };
    
    const dayOfWeek = new Date(day.date).getDay();
    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isClosedSaturday = weekendTypes[day.date] === true;
    
    // Complex hour calculation logic based on role and day type
    switch (role) {
      case 'כונן':
        this._calculateConanHours(hours, isFriday, isSaturday, isClosedSaturday);
        break;
        
      case 'מוצ״ש':
        this._calculateMotzashHours(hours, isSaturday, isClosedSaturday);
        break;
        
      case 'רגיל':
        this._calculateRegularHours(hours, dayOfWeek, isFriday, isSaturday, isClosedSaturday);
        break;
        
      case 'חפיפה':
        this._calculateOverlapHours(hours, dayOfWeek, isFriday, isSaturday);
        break;
        
      default:
        // Default fallback
        hours.regular = 8;
    }
    
    return hours;
  }
  
  /**
   * Calculate salary factor from hours breakdown
   * @param {Object} hours - Hours object with all hour types
   * @returns {number} Salary factor
   */
  calculateSalaryFactor(hours) {
    return (hours.regular * this.MULTIPLIERS.regular) +
           (hours.night * this.MULTIPLIERS.night) +
           (hours.shabbat * this.MULTIPLIERS.shabbat) +
           (hours.conan * this.MULTIPLIERS.conan) +
           (hours.conan_shabbat * this.MULTIPLIERS.conan_shabbat) +
           (hours.motzash * this.MULTIPLIERS.motzash);
  }
  
  /**
   * Calculate total hours from hours breakdown
   * @param {Object} hours - Hours object
   * @returns {number} Total hours
   */
  calculateTotalHours(hours) {
    return hours.regular + hours.night + hours.shabbat + 
           hours.conan + hours.conan_shabbat + hours.motzash;
  }
  
  /**
   * Get display-friendly salary factor for guide cards
   * @param {number} salaryFactor - Raw salary factor
   * @returns {string} Formatted salary factor (e.g., "123.5")
   */
  formatSalaryFactor(salaryFactor) {
    return salaryFactor.toFixed(1);
  }
  
  /**
   * Get efficiency ratio (salary factor / total hours)
   * Higher ratio means more valuable shifts
   * @param {number} salaryFactor - Salary factor
   * @param {number} totalHours - Total hours
   * @returns {number} Efficiency ratio
   */
  calculateEfficiencyRatio(salaryFactor, totalHours) {
    return totalHours > 0 ? salaryFactor / totalHours : 0;
  }
  
  // Private helper methods
  
  _countShift(stats, day, role) {
    const dayOfWeek = new Date(day.date).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    
    stats.total_shifts++;
    
    if (day.is_manual) {
      stats.manual_shifts++;
    } else {
      stats.auto_shifts++;
    }
    
    if (isWeekend) {
      stats.weekend_shifts++;
    }
    
    // Count by role type
    switch (role) {
      case 'רגיל':
        stats.regular_shifts++;
        break;
      case 'חפיפה':
        stats.overlap_shifts++;
        break;
      case 'כונן':
        stats.conan_shifts++;
        break;
      case 'מוצ״ש':
        stats.motzash_shifts++;
        break;
    }
  }
  
  _addHours(stats, hours) {
    stats.regular_hours += hours.regular;
    stats.night_hours += hours.night;
    stats.shabbat_hours += hours.shabbat;
    stats.conan_hours += hours.conan;
    stats.conan_shabbat_hours += hours.conan_shabbat;
    stats.motzash_hours += hours.motzash;
  }
  
  _calculateDerivedMetrics(stats) {
    // Calculate total hours
    stats.total_hours = this.calculateTotalHours(stats);
    
    // Calculate salary factor
    stats.salary_factor = this.calculateSalaryFactor(stats);
    
    // Calculate average hours per shift
    stats.average_hours_per_shift = stats.total_shifts > 0 ? 
      stats.total_hours / stats.total_shifts : 0;
    
    // Calculate efficiency ratio
    stats.efficiency_ratio = this.calculateEfficiencyRatio(stats.salary_factor, stats.total_hours);
  }
  
  _calculateConanHours(hours, isFriday, isSaturday, isClosedSaturday) {
    if (isFriday && isClosedSaturday) {
      // Friday conan for closed Saturday: Friday 09:00 - Saturday 17:00
      hours.conan = 10;           // Friday 09:00-19:00 (10 hours weekday conan)
      hours.conan_shabbat = 22;   // Friday 19:00 - Saturday 17:00 (22 hours Shabbat conan)
    } else if (isSaturday && isClosedSaturday) {
      // Continuing Saturday conan (should already be counted on Friday)
      // This prevents double counting
      hours.conan_shabbat = 0;
    } else {
      // Regular conan (shouldn't happen on weekdays but fallback)
      hours.conan = 24;
    }
  }
  
  _calculateMotzashHours(hours, isSaturday, isClosedSaturday) {
    if (isSaturday && isClosedSaturday) {
      // Motzash for closed Saturday: Saturday 17:00 - Sunday 08:00
      hours.shabbat = 2;     // Saturday 17:00-19:00 (2 hours Shabbat)
      hours.regular = 5;     // Saturday 19:00-24:00 (5 hours regular)
      hours.night = 8;       // Sunday 00:00-08:00 (8 hours night)
      hours.motzash = 15;    // Total motzash hours for salary calculation
    } else if (isSaturday && !isClosedSaturday) {
      // Regular Saturday (open Shabbat) - shouldn't be motzash but fallback
      hours.shabbat = 16;
    } else {
      // Shouldn't happen on other days
      hours.regular = 8;
    }
  }
  
  _calculateRegularHours(hours, dayOfWeek, isFriday, isSaturday, isClosedSaturday) {
    if (isFriday && !isClosedSaturday) {
      // Regular Friday (open Shabbat)
      hours.regular = 10;   // Friday 09:00-19:00
      hours.shabbat = 14;   // Friday 19:00 - Saturday 09:00
    } else if (isSaturday && !isClosedSaturday) {
      // Regular Saturday (open Shabbat)
      hours.shabbat = 24;   // Full Saturday shift
    } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
      // Weekday (Sunday-Thursday)
      hours.regular = 16;   // Day shift 09:00 - next day 01:00 (16 hours)
      hours.night = 8;      // Night shift 01:00 - 09:00 (8 hours)
    } else {
      // Fallback
      hours.regular = 8;
    }
  }
  
  _calculateOverlapHours(hours, dayOfWeek, isFriday, isSaturday) {
    // Overlap/חפיפה typically adds extra hours
    if (isFriday || isSaturday) {
      // Weekend overlap - usually 1-2 hours
      hours.shabbat = 1;
    } else {
      // Weekday overlap - usually 1 hour
      hours.regular = 1;
    }
  }
  
  /**
   * Get multipliers for display/reference
   * @returns {Object} Salary factor multipliers
   */
  getMultipliers() {
    return { ...this.MULTIPLIERS };
  }
  
  /**
   * Validate and fix hours object
   * @param {Object} hours - Hours object to validate
   * @returns {Object} Validated hours object
   */
  validateHours(hours) {
    const validatedHours = {
      regular: Math.max(0, hours.regular || 0),
      night: Math.max(0, hours.night || 0),
      shabbat: Math.max(0, hours.shabbat || 0),
      conan: Math.max(0, hours.conan || 0),
      conan_shabbat: Math.max(0, hours.conan_shabbat || 0),
      motzash: Math.max(0, hours.motzash || 0)
    };
    
    // Sanity check: total hours shouldn't exceed reasonable limits
    const total = this.calculateTotalHours(validatedHours);
    if (total > 48) { // Max 48 hours for any single shift
      console.warn(`Warning: Calculated ${total} hours for single shift - may be error`);
    }
    
    return validatedHours;
  }
  
  /**
   * Compare two salary factors and return percentage difference
   * @param {number} factor1 - First salary factor
   * @param {number} factor2 - Second salary factor (baseline)
   * @returns {number} Percentage difference
   */
  compareFactors(factor1, factor2) {
    if (factor2 === 0) return factor1 > 0 ? 100 : 0;
    return ((factor1 - factor2) / factor2) * 100;
  }
  
  /**
   * Get fairness assessment between guides
   * @param {Array} guideStats - Array of guide statistics
   * @returns {Object} Fairness analysis
   */
  assessFairness(guideStats) {
    if (guideStats.length === 0) {
      return { is_fair: true, variance: 0, recommendations: [] };
    }
    
    const salaryFactors = guideStats.map(g => g.salary_factor);
    const mean = salaryFactors.reduce((sum, f) => sum + f, 0) / salaryFactors.length;
    const variance = salaryFactors.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / salaryFactors.length;
    const standardDeviation = Math.sqrt(variance);
    
    const recommendations = [];
    
    // Check for significant imbalances (more than 15% deviation)
    const threshold = mean * 0.15;
    guideStats.forEach(guide => {
      const deviation = Math.abs(guide.salary_factor - mean);
      if (deviation > threshold) {
        const type = guide.salary_factor > mean ? 'overworked' : 'underworked';
        recommendations.push({
          guide_id: guide.id,
          guide_name: guide.name,
          type: type,
          deviation: this.compareFactors(guide.salary_factor, mean),
          suggestion: type === 'overworked' ? 
            'שקול להפחית משמרות או לתת משמרות קלות יותר' :
            'שקול להוסיף משמרות או לתת משמרות עם ערך שכר גבוה יותר'
        });
      }
    });
    
    return {
      is_fair: standardDeviation <= (mean * 0.1), // Within 10% is considered fair
      variance: variance,
      standard_deviation: standardDeviation,
      mean_salary_factor: mean,
      recommendations: recommendations
    };
  }
}

// Export singleton instance
module.exports = new SalaryCalculator();