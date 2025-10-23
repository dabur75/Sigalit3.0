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
    // Official salary factor multipliers (from SCHEDULING_BIBLE.md)
    this.MULTIPLIERS = {
      regular: 1.0,         // רגיל - Standard weekday shifts
      night: 1.5,           // לילה - Night shift hours (00:00-08:00)
      shabbat: 2.0,         // שבת - Saturday/Shabbat hours
      standby: 0.3,         // כונן - Weekday standby duty
      standby_shabbat: 0.6  // כונן שבת - Saturday standby duty
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
      standby_hours: 0,
      standby_shabbat_hours: 0,
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
  calculateHoursForShift(day, role, weekendTypes = {}, schedule = [], dayIndex = 0, isHoliday = false) {
    const hours = {
      regular: 0,
      night: 0,
      shabbat: 0,
      standby: 0,
      standby_shabbat: 0
    };
    
    const dayOfWeek = new Date(day.date).getDay();
    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isClosedWeekend = weekendTypes[day.date] === true;
    
    // Hour calculation based on Scheduling Bible rules
    if (isHoliday) {
      // Holiday days - always 2 guides (1 רגיל + 1 חפיפה) with ×2.0 multiplier
      this._calculateHolidayHours(hours, role);
    } else if (isFriday && isClosedWeekend) {
      // Closed Weekend Friday - only כונן role
      this._calculateClosedFridayHours(hours, role);
    } else if (isSaturday && isClosedWeekend) {
      // Closed Weekend Saturday - former כונן + מוצ״ש
      this._calculateClosedSaturdayHours(hours, role);
    } else if (isFriday && !isClosedWeekend) {
      // Open Weekend Friday
      this._calculateOpenFridayHours(hours, role);
    } else if (isSaturday && !isClosedWeekend) {
      // Open Weekend Saturday
      this._calculateOpenSaturdayHours(hours, role);
    } else {
      // Standard Weekdays (Sunday-Thursday)
      this._calculateWeekdayHours(hours, role);
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
           (hours.standby * this.MULTIPLIERS.standby) +
           (hours.standby_shabbat * this.MULTIPLIERS.standby_shabbat);
  }
  
  /**
   * Calculate total hours from hours breakdown
   * @param {Object} hours - Hours object
   * @returns {number} Total hours
   */
  calculateTotalHours(hours) {
    return hours.regular + hours.night + hours.shabbat + 
           hours.standby + hours.standby_shabbat;
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
    stats.standby_hours += (hours.standby || 0);
    stats.standby_shabbat_hours += (hours.standby_shabbat || 0);
  }
  
  _calculateDerivedMetrics(stats) {
    // Calculate total hours from the stats object
    stats.total_hours = stats.regular_hours + stats.night_hours + stats.shabbat_hours + 
                        stats.standby_hours + stats.standby_shabbat_hours;
    
    // Calculate salary factor with correct multipliers
    stats.salary_factor = (stats.regular_hours * this.MULTIPLIERS.regular) + 
                          (stats.night_hours * this.MULTIPLIERS.night) + 
                          (stats.shabbat_hours * this.MULTIPLIERS.shabbat) + 
                          (stats.standby_hours * this.MULTIPLIERS.standby) + 
                          (stats.standby_shabbat_hours * this.MULTIPLIERS.standby_shabbat);
    
    // Calculate average hours per shift
    stats.average_hours_per_shift = stats.total_shifts > 0 ? 
      stats.total_hours / stats.total_shifts : 0;
    
    // Calculate efficiency ratio
    stats.efficiency_ratio = this.calculateEfficiencyRatio(stats.salary_factor, stats.total_hours);
  }
  
  // New calculation methods based on Scheduling Bible
  
  _calculateWeekdayHours(hours, role) {
    // Standard Weekdays (Sunday-Thursday): Always 1 רגיל (24h) + 1 חפיפה (25h)
    if (role === 'רגיל') {
      hours.regular = 16;  // 09:00 - 01:00 next day (16 hours)
      hours.night = 8;     // 01:00 - 09:00 next day (8 hours)
    } else if (role === 'חפיפה') {
      hours.regular = 17;  // 09:00 - 02:00 next day (17 hours, +1 for handover)
      hours.night = 8;     // 02:00 - 10:00 next day (8 hours)
    }
  }
  
  _calculateOpenFridayHours(hours, role) {
    // Open Weekend Friday: 2 guides (1 רגיל + 1 חפיפה) 09:00 Friday - 10:00 Saturday
    if (role === 'רגיל') {
      hours.regular = 10;  // Friday 09:00-19:00
      hours.shabbat = 14;  // Friday 19:00 - Saturday 09:00
    } else if (role === 'חפיפה') {
      hours.regular = 10;  // Friday 09:00-19:00
      hours.shabbat = 15;  // Friday 19:00 - Saturday 10:00 (+1 handover)
    }
  }
  
  _calculateOpenSaturdayHours(hours, role) {
    // Open Weekend Saturday: 2 guides (1 רגיל + 1 חפיפה) 09:00 Saturday - 10:00 Sunday
    if (role === 'רגיל') {
      hours.shabbat = 24;  // Full Saturday 09:00 - 09:00 Sunday
    } else if (role === 'חפיפה') {
      hours.shabbat = 25;  // Saturday 09:00 - 10:00 Sunday (+1 handover)
    }
  }
  
  _calculateClosedFridayHours(hours, role) {
    // Closed Weekend Friday: 1 כונן guide ONLY, 09:00 Friday - 17:00 Saturday (32h)
    if (role === 'כונן') {
      hours.standby = 10;           // Friday 09:00-19:00 (10 hours weekday standby)
      hours.standby_shabbat = 22;   // Friday 19:00 - Saturday 17:00 (22 hours Shabbat standby)
    }
  }
  
  _calculateClosedSaturdayHours(hours, role) {
    // Closed Weekend Saturday: former כונן (17h) + מוצ״ש (16h)
    if (role === 'כונן') {
      // Former standby continues from 17:00 Saturday - 10:00 Sunday (17h)
      hours.shabbat = 2;    // Saturday 17:00-19:00
      hours.regular = 7;    // Saturday 19:00 - Sunday 02:00
      hours.night = 8;      // Sunday 02:00-10:00 (+1 handover)
    } else if (role === 'מוצ״ש') {
      // New motzash guide: 17:00 Saturday - 09:00 Sunday (16h)
      // Note: מוצ״ש is NOT a separate hour type - it's a combination of existing types
      hours.shabbat = 2;    // Saturday 17:00-19:00 (×2.0 multiplier)
      hours.regular = 6;    // Saturday 19:00 - Sunday 01:00 (×1.0 multiplier)
      hours.night = 8;      // Sunday 01:00-09:00 (×1.5 multiplier)
      // No separate motzash_hours field - it's calculated from the combination above
    }
  }
  
  _calculateHolidayHours(hours, role) {
    // Holiday days: Always 2 guides (1 רגיל + 1 חפיפה) with ×2.0 multiplier
    if (role === 'רגיל') {
      hours.shabbat = 24;   // Full 24 hours at ×2.0 multiplier
    } else if (role === 'חפיפה') {
      hours.shabbat = 25;   // 25 hours at ×2.0 multiplier (+1 handover)
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
      standby: Math.max(0, hours.standby || 0),
      standby_shabbat: Math.max(0, hours.standby_shabbat || 0)
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