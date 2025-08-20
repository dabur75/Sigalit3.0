/**
 * Constraint Engine for Advanced Scheduler
 * Handles all constraint validation and enforcement per SCHEDULING_BIBLE.md
 */

class SchedulerConstraints {
  constructor(constraints, weekendTypes) {
    this.constraints = constraints;
    this.weekendTypes = weekendTypes;
  }

  /**
   * Get Hebrew day name
   */
  getDayName(dayOfWeek) {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayOfWeek];
  }

  /**
   * Check if guide is available for specific date and role
   * Returns { available: boolean, reason: string, severity: 'hard'|'soft' }
   */
  checkGuideAvailability(guide, date, role = null, dayOfWeek = null) {
    if (!dayOfWeek) {
      dayOfWeek = new Date(date).getDay();
    }

    // Hard constraints - absolute vetoes
    const hardCheck = this.checkHardConstraints(guide, date, role, dayOfWeek);
    if (!hardCheck.available) {
      return hardCheck;
    }

    // Soft constraints - preferences that can be overridden if necessary
    const softCheck = this.checkSoftConstraints(guide, date, role, dayOfWeek);
    
    return {
      available: true,
      reason: softCheck.warnings.length > 0 ? softCheck.warnings.join(', ') : 'זמין',
      severity: softCheck.warnings.length > 0 ? 'soft' : 'clear',
      warnings: softCheck.warnings
    };
  }

  /**
   * Check hard constraints that must never be violated
   */
  checkHardConstraints(guide, date, role, dayOfWeek) {
    // 1. Personal constraints (specific dates)
    const personalConstraint = this.constraints.personal.find(
      c => c.user_id === guide.id && c.date === date
    );
    if (personalConstraint) {
      return {
        available: false,
        reason: `אילוץ אישי - לא זמין ביום זה`,
        severity: 'hard'
      };
    }

    // 2. Fixed weekly constraints
    const fixedConstraint = this.constraints.fixed.find(
      c => c.user_id === guide.id && c.weekday === dayOfWeek
    );
    if (fixedConstraint) {
      return {
        available: false,
        reason: `אילוץ שבועי - לא זמין ביום ${this.getDayName(dayOfWeek)}`,
        severity: 'hard'
      };
    }

    // 3. Vacation periods
    const onVacation = this.constraints.vacations.find(
      v => v.user_id === guide.id && 
          date >= v.date_start && 
          date <= v.date_end
    );
    if (onVacation) {
      return {
        available: false,
        reason: 'בחופשה מאושרת',
        severity: 'hard'
      };
    }

    // 4. Coordinator rules - hard restrictions
    const coordinatorRules = this.constraints.coordinator.filter(
      rule => rule.guide1_id === guide.id || rule.guide2_id === guide.id
    );

    for (const rule of coordinatorRules) {
      switch (rule.rule_type) {
        case 'no_auto_scheduling':
        case 'manual_only':
          return {
            available: false,
            reason: 'שיבוץ ידני בלבד - לא זמין לשיבוץ אוטומטי',
            severity: 'hard'
          };

        case 'no_weekends':
          if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
            return {
              available: false,
              reason: 'לא עובד בסופי שבוע',
              severity: 'hard'
            };
          }
          break;

        case 'no_conan':
          if (role === 'כונן') {
            return {
              available: false,
              reason: 'לא עובד כונן',
              severity: 'hard'
            };
          }
          break;
      }
    }

    return { available: true, reason: 'עובר בדיקות אילוצים קשים', severity: 'clear' };
  }

  /**
   * Check soft constraints - warnings but not blockers
   */
  checkSoftConstraints(guide, date, role, dayOfWeek) {
    const warnings = [];

    // Check prevent_pair warnings
    const preventPairRules = this.constraints.coordinator.filter(
      rule => rule.rule_type === 'prevent_pair' && rule.user_id === guide.id
    );
    
    if (preventPairRules.length > 0) {
      warnings.push('עדיף להימנע מזיווג מסוים');
    }

    return { warnings };
  }

  /**
   * Check if two guides can work together on the same day
   */
  checkGuideCompatibility(guide1, guide2) {
    if (!guide1 || !guide2) return { compatible: true, reason: 'אחד מהמדריכים לא קיים' };

    // Check no_together rule (hard constraint)
    const noTogetherRule = this.constraints.coordinator.find(
      rule => rule.rule_type === 'no_together' && 
             ((rule.guide1_id === guide1.id && rule.guide2_id === guide2.id) ||
              (rule.guide1_id === guide2.id && rule.guide2_id === guide1.id))
    );

    if (noTogetherRule) {
      return {
        compatible: false,
        reason: 'אסור לעבוד יחד באותו יום',
        severity: 'hard'
      };
    }

    // Check prevent_pair rule (soft constraint)
    const preventPairRule = this.constraints.coordinator.find(
      rule => rule.rule_type === 'prevent_pair' && 
             ((rule.guide1_id === guide1.id && rule.guide2_id === guide2.id) ||
              (rule.guide1_id === guide2.id && rule.guide2_id === guide1.id))
    );

    if (preventPairRule) {
      return {
        compatible: true,
        reason: 'עדיף להימנע מעבודה יחד',
        severity: 'soft',
        warning: true
      };
    }

    return { compatible: true, reason: 'יכולים לעבוד יחד', severity: 'clear' };
  }

  /**
   * Validate consecutive day rule
   */
  checkConsecutiveDays(guide, date, previousDaySchedule) {
    if (!previousDaySchedule) return { allowed: true, reason: 'אין יום קודם' };

    // Check if guide worked previous day
    const workedYesterday = previousDaySchedule.guide1_id === guide.id || 
                           previousDaySchedule.guide2_id === guide.id;

    if (!workedYesterday) {
      return { allowed: true, reason: 'לא עבד אתמול' };
    }

    // Check for Friday→Saturday closed weekend exception
    const today = new Date(date);
    const yesterday = new Date(previousDaySchedule.date);
    
    if (yesterday.getDay() === 5 && today.getDay() === 6) { // Friday → Saturday
      const fridayWeekendType = this.weekendTypes[previousDaySchedule.date];
      
      if (fridayWeekendType === true) { // Closed weekend
        // Allow if both days are כונן role
        if (previousDaySchedule.guide1_role === 'כונן' && 
            previousDaySchedule.guide1_id === guide.id) {
          return { 
            allowed: true, 
            reason: 'המשך כונן מיום שישי לשבת בסופ״ש סגור (יוצא מהכלל)',
            exception: true 
          };
        }
      }
    }

    return {
      allowed: false,
      reason: 'עובד ימים עוקבים - אסור לפי הכללים',
      severity: 'hard'
    };
  }

  /**
   * Validate weekend assignment rules
   */
  validateWeekendAssignment(date, guide1, role1, guide2, role2) {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    
    if (!isWeekend) {
      return { valid: true, reason: 'יום חול רגיל' };
    }

    const weekendType = this.weekendTypes[date]; // true = closed, false = open
    
    if (weekendType === true) { // Closed weekend
      if (dayOfWeek === 5) { // Friday
        // Must have exactly 1 כונן, no other guides
        if (guide1 && role1 === 'כונן' && !guide2) {
          return { valid: true, reason: 'שישי סגור - כונן אחד בלבד' };
        }
        return { 
          valid: false, 
          reason: 'שישי סגור צריך בדיוק מדריך אחד בתפקיד כונן',
          severity: 'hard'
        };
      } else if (dayOfWeek === 6) { // Saturday
        // Must have same כונן from Friday
        return { valid: true, reason: 'שבת סגורה - בדיקה נדרשת מול יום שישי' };
      }
    } else if (weekendType === false) { // Open weekend
      // Should have 2 regular guides
      if (guide1 && guide2 && role1 === 'רגיל' && role2 === 'רגיל') {
        return { valid: true, reason: 'סופ״ש פתוח - שני מדריכים רגילים' };
      }
      return { 
        valid: false, 
        reason: 'סופ״ש פתוח צריך שני מדריכים רגילים',
        severity: 'soft' // Can be overridden if needed
      };
    }

    return { valid: true, reason: 'כללי סופ״ש לא זוהו' };
  }

  /**
   * Generate comprehensive constraint report for a proposed schedule
   */
  generateConstraintReport(schedule) {
    const report = {
      totalViolations: 0,
      hardViolations: [],
      softViolations: [],
      warnings: [],
      summary: {}
    };

    // Check each day in schedule
    schedule.forEach((day, index) => {
      const dayReport = this.validateDayConstraints(day, index > 0 ? schedule[index - 1] : null);
      
      report.hardViolations.push(...dayReport.hardViolations);
      report.softViolations.push(...dayReport.softViolations);
      report.warnings.push(...dayReport.warnings);
    });

    report.totalViolations = report.hardViolations.length + report.softViolations.length;
    
    // Generate summary
    report.summary = {
      constraintCompliance: report.hardViolations.length === 0 ? 'מלא' : 'חסר',
      recommendationLevel: this.getRecommendationLevel(report),
      majorIssues: report.hardViolations.length,
      minorIssues: report.softViolations.length,
      totalWarnings: report.warnings.length
    };

    return report;
  }

  /**
   * Validate constraints for a single day
   */
  validateDayConstraints(day, previousDay) {
    const violations = {
      hardViolations: [],
      softViolations: [],
      warnings: []
    };

    const guides = [
      { id: day.guide1_id, role: day.guide1_role },
      { id: day.guide2_id, role: day.guide2_role }
    ].filter(g => g.id);

    // Check each guide
    guides.forEach(({ id, role }) => {
      const guide = { id }; // Simplified guide object
      const availability = this.checkGuideAvailability(guide, day.date, role);
      
      if (!availability.available) {
        if (availability.severity === 'hard') {
          violations.hardViolations.push({
            date: day.date,
            guideId: id,
            violation: 'availability',
            message: availability.reason
          });
        } else {
          violations.softViolations.push({
            date: day.date,
            guideId: id,
            violation: 'availability',
            message: availability.reason
          });
        }
      }

      // Check consecutive days
      if (previousDay) {
        const consecutiveCheck = this.checkConsecutiveDays(guide, day.date, previousDay);
        if (!consecutiveCheck.allowed && !consecutiveCheck.exception) {
          violations.hardViolations.push({
            date: day.date,
            guideId: id,
            violation: 'consecutive_days',
            message: consecutiveCheck.reason
          });
        }
      }
    });

    // Check guide compatibility
    if (guides.length === 2) {
      const compatibility = this.checkGuideCompatibility(
        { id: guides[0].id }, 
        { id: guides[1].id }
      );
      
      if (!compatibility.compatible) {
        violations.hardViolations.push({
          date: day.date,
          guideId: `${guides[0].id}, ${guides[1].id}`,
          violation: 'compatibility',
          message: compatibility.reason
        });
      } else if (compatibility.warning) {
        violations.warnings.push({
          date: day.date,
          guideId: `${guides[0].id}, ${guides[1].id}`,
          type: 'compatibility_warning',
          message: compatibility.reason
        });
      }
    }

    // Check weekend rules
    const weekendValidation = this.validateWeekendAssignment(
      day.date, 
      guides[0]?.id, guides[0]?.role,
      guides[1]?.id, guides[1]?.role
    );
    
    if (!weekendValidation.valid) {
      const violation = {
        date: day.date,
        guideId: 'weekend_rule',
        violation: 'weekend_logic',
        message: weekendValidation.reason
      };
      
      if (weekendValidation.severity === 'hard') {
        violations.hardViolations.push(violation);
      } else {
        violations.softViolations.push(violation);
      }
    }

    return violations;
  }

  /**
   * Get recommendation level based on violations
   */
  getRecommendationLevel(report) {
    if (report.hardViolations.length > 0) {
      return 'דחוף - יש הפרות חמורות';
    } else if (report.softViolations.length > 3) {
      return 'זהירות - יש מספר בעיות קלות';
    } else if (report.warnings.length > 0) {
      return 'טוב - רק אזהרות קלות';
    }
    return 'מעולה - ללא בעיות';
  }

  /**
   * Get available guides for specific date and role
   */
  getAvailableGuidesForDate(allGuides, date, role = null) {
    const dayOfWeek = new Date(date).getDay();
    
    return allGuides.filter(guide => {
      const availability = this.checkGuideAvailability(guide, date, role, dayOfWeek);
      return availability.available;
    });
  }

  /**
   * Calculate constraint pressure for date (how many guides are unavailable)
   */
  calculateConstraintPressure(allGuides, date) {
    const available = this.getAvailableGuidesForDate(allGuides, date);
    const pressure = (allGuides.length - available.length) / allGuides.length;
    
    return {
      pressure: pressure,
      availableCount: available.length,
      totalCount: allGuides.length,
      level: pressure > 0.7 ? 'high' : pressure > 0.4 ? 'medium' : 'low',
      description: pressure > 0.7 ? 'לחץ גבוה - מעט מדריכים זמינים' :
                   pressure > 0.4 ? 'לחץ בינוני' : 'לחץ נמוך'
    };
  }
}

module.exports = SchedulerConstraints;