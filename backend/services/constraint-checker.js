const { pool } = require('../database/postgresql');

/**
 * Centralized Constraint Checking Service
 * 
 * Handles all types of constraints for the enhanced manual scheduler:
 * - Regular constraints (specific dates)
 * - Fixed constraints (weekly recurring)
 * - Vacation constraints (date ranges)
 * - Dynamic constraints (consecutive days, etc.)
 * - Business logic constraints (weekend rules, etc.)
 */

class ConstraintChecker {
  
  /**
   * Check all constraints for a guide on a specific date
   * @param {number} guideId - Guide user ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} slotType - 'normal' or 'overlap'
   * @param {string} assignmentType - Type of assignment (רגיל, כונן, etc.)
   * @param {Object} options - Additional validation options
   * @returns {Object} Validation result with isValid, reasons, warnings
   */
  async validateAssignment(guideId, date, slotType = 'normal', assignmentType = 'רגיל', options = {}) {
    const validation = {
      isValid: true,
      reasons: [],
      warnings: [],
      constraint_details: {}
    };
    
    try {
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      // Check all constraint types in parallel for performance
      const [
        regularConstraints,
        fixedConstraints,
        vacationConstraints,
        consecutiveConstraints,
        existingAssignments,
        weekendTypeInfo
      ] = await Promise.all([
        this.checkRegularConstraints(guideId, date),
        this.checkFixedConstraints(guideId, dayOfWeek),
        this.checkVacationConstraints(guideId, date),
        this.checkConsecutiveDayConstraints(guideId, date),
        this.checkExistingAssignments(date),
        this.getWeekendTypeInfo(date)
      ]);
      
      // Store constraint details for debugging
      validation.constraint_details = {
        regular: regularConstraints,
        fixed: fixedConstraints,
        vacations: vacationConstraints,
        consecutive: consecutiveConstraints,
        existing: existingAssignments,
        weekend_info: weekendTypeInfo
      };
      
      // Process regular constraints
      if (regularConstraints.length > 0) {
        validation.isValid = false;
        regularConstraints.forEach(constraint => {
          validation.reasons.push(`אילוץ ספציפי: ${constraint.details || 'חסום בתאריך זה'}`);
        });
      }
      
      // Process fixed constraints
      if (fixedConstraints.length > 0) {
        validation.isValid = false;
        const dayNames = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
        fixedConstraints.forEach(constraint => {
          let timeInfo = '';
          if (constraint.hour_start || constraint.hour_end) {
            timeInfo = ` (${constraint.hour_start || '00:00'}-${constraint.hour_end || '23:59'})`;
          }
          validation.reasons.push(`אילוץ קבוע: חסום בימי ${dayNames[constraint.weekday]}${timeInfo} - ${constraint.details || ''}`);
        });
      }
      
      // Process vacation constraints
      if (vacationConstraints.length > 0) {
        validation.isValid = false;
        vacationConstraints.forEach(vacation => {
          validation.reasons.push(`חופשה מאושרת: ${vacation.date_start} עד ${vacation.date_end} - ${vacation.note || 'חופשה'}`);
        });
      }
      
      // Process consecutive day constraints
      if (consecutiveConstraints.length > 0) {
        validation.isValid = false;
        consecutiveConstraints.forEach(consecutive => {
          validation.reasons.push(`אילוץ ימים עוקבים: משובץ ב-${consecutive.date} (${consecutive.role})`);
        });
      }
      
      // Check slot availability and add warnings
      if (existingAssignments.length > 0) {
        const existing = existingAssignments[0];
        
        if (slotType === 'normal' && existing.guide1_id) {
          if (existing.guide1_id === guideId) {
            validation.warnings.push('מדריך כבר משובץ במשמרת הרגילה');
          } else {
            validation.warnings.push(`המשמרת הרגילה תוחלף (נוכחי: ${existing.guide1_name || existing.guide1_id})`);
          }
        }
        
        if (slotType === 'overlap' && existing.guide2_id) {
          if (existing.guide2_id === guideId) {
            validation.warnings.push('מדריך כבר משובץ בחפיפה');
          } else {
            validation.warnings.push(`החפיפה תוחלף (נוכחי: ${existing.guide2_name || existing.guide2_id})`);
          }
        }
      }
      
      // Business logic validations
      const businessValidation = await this.validateBusinessLogic(
        guideId, date, slotType, assignmentType, weekendTypeInfo, existingAssignments[0]
      );
      
      if (!businessValidation.isValid) {
        validation.isValid = false;
        validation.reasons.push(...businessValidation.reasons);
      }
      validation.warnings.push(...businessValidation.warnings);
      
      // Add success message if valid
      if (validation.isValid) {
        validation.reasons.push('כל האילוצים נבדקו - שיבוץ מותר');
      }
      
    } catch (error) {
      console.error('Error in constraint validation:', error);
      validation.isValid = false;
      validation.reasons.push('שגיאה בבדיקת אילוצים - נסה שוב');
    }
    
    return validation;
  }
  
  /**
   * Get all constraints for a guide in a specific month
   * @param {number} guideId - Guide user ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Object} All constraints organized by type
   */
  async getMonthlyConstraints(guideId, year, month) {
    try {
      const [
        regularConstraints,
        fixedConstraints,
        vacationConstraints,
        dynamicConstraints
      ] = await Promise.all([
        this.getRegularConstraintsForMonth(guideId, year, month),
        this.getFixedConstraints(guideId),
        this.getVacationConstraintsForMonth(guideId, year, month),
        this.getDynamicConstraintsForMonth(guideId, year, month)
      ]);
      
      return {
        regular: regularConstraints,
        fixed: fixedConstraints,
        vacations: vacationConstraints,
        dynamic: dynamicConstraints,
        total_count: regularConstraints.length + fixedConstraints.length + 
                    vacationConstraints.length + dynamicConstraints.length
      };
      
    } catch (error) {
      console.error('Error fetching monthly constraints:', error);
      throw new Error('Failed to fetch constraints for month');
    }
  }
  
  // Private methods for specific constraint checks
  
  async checkRegularConstraints(guideId, date) {
    const result = await pool.query(`
      SELECT id, user_id, type, date::text as date, details, created_at
      FROM constraints 
      WHERE user_id = $1 AND date = $2::date
    `, [guideId, date]);
    
    return result.rows;
  }
  
  async checkFixedConstraints(guideId, dayOfWeek) {
    const result = await pool.query(`
      SELECT id, user_id, weekday, hour_start, hour_end, details, created_at
      FROM fixed_constraints 
      WHERE user_id = $1 AND weekday = $2
    `, [guideId, dayOfWeek]);
    
    return result.rows;
  }
  
  async checkVacationConstraints(guideId, date) {
    const result = await pool.query(`
      SELECT id, user_id, date_start::text, date_end::text, note, status, created_at
      FROM vacations 
      WHERE user_id = $1 
        AND status = 'approved'
        AND date_start <= $2::date 
        AND date_end >= $2::date
    `, [guideId, date]);
    
    return result.rows;
  }
  
  async checkConsecutiveDayConstraints(guideId, date) {
    const dateObj = new Date(date);
    
    // Check day before
    const dayBefore = new Date(dateObj);
    dayBefore.setDate(dayBefore.getDate() - 1);
    
    // Check day after
    const dayAfter = new Date(dateObj);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const result = await pool.query(`
      SELECT 
        date::text as date,
        CASE 
          WHEN guide1_id = $1 THEN guide1_role
          WHEN guide2_id = $1 THEN guide2_role
        END as role,
        CASE 
          WHEN guide1_id = $1 THEN 'guide1'
          WHEN guide2_id = $1 THEN 'guide2'
        END as position
      FROM schedule 
      WHERE (guide1_id = $1 OR guide2_id = $1)
        AND (date = $2::date OR date = $3::date)
        AND is_manual = true
    `, [guideId, dayBefore.toISOString().split('T')[0], dayAfter.toISOString().split('T')[0]]);
    
    return result.rows;
  }
  
  async checkExistingAssignments(date) {
    const result = await pool.query(`
      SELECT 
        s.guide1_id, s.guide2_id, s.guide1_role, s.guide2_role, s.is_manual,
        u1.name as guide1_name, u2.name as guide2_name
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      WHERE s.date::date = $1::date
    `, [date]);
    
    return result.rows;
  }
  
  async getWeekendTypeInfo(date) {
    // Get Friday's weekend type to determine if Saturday is closed
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    
    let checkDate = date;
    if (dayOfWeek === 6) { // Saturday - check Friday
      const friday = new Date(dateObj);
      friday.setDate(friday.getDate() - 1);
      checkDate = friday.toISOString().split('T')[0];
    }
    
    const result = await pool.query(`
      SELECT date::text as date, is_closed
      FROM weekend_types 
      WHERE date = $1::date
    `, [checkDate]);
    
    return {
      date: checkDate,
      is_closed: result.rows[0]?.is_closed || false,
      day_of_week: dayOfWeek,
      is_weekend: dayOfWeek === 5 || dayOfWeek === 6
    };
  }
  
  async validateBusinessLogic(guideId, date, slotType, assignmentType, weekendInfo, existingAssignment) {
    const validation = {
      isValid: true,
      reasons: [],
      warnings: []
    };
    
    const dayOfWeek = weekendInfo.day_of_week;
    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isClosedWeekend = weekendInfo.is_closed;
    
    // Special rules for closed weekends
    if (isSaturday && isClosedWeekend) {
      // Saturday on closed weekend: only allow כונן (continuing from Friday) or מוצ״ש
      if (assignmentType !== 'כונן' && assignmentType !== 'מוצ״ש') {
        validation.warnings.push('שבת סגורה - רק כונן ומוצ״ש מותרים');
      }
      
      // If placing מוצ״ש, check that כונן is already assigned
      if (assignmentType === 'מוצ״ש' && slotType === 'overlap') {
        if (!existingAssignment || existingAssignment.guide1_role !== 'כונן') {
          validation.warnings.push('מוצ״ש בשבת סגורה - מומלץ שכונן יהיה משובץ קודם');
        }
      }
    }
    
    // Friday on closed weekend - should be כונן
    if (isFriday && isClosedWeekend && assignmentType !== 'כונן') {
      validation.warnings.push('שישי לשבת סגורה - מומלץ לשבץ כונן');
    }
    
    // Overlap assignment validation
    if (slotType === 'overlap') {
      if (!existingAssignment || !existingAssignment.guide1_id) {
        validation.warnings.push('אין משמרת רגילה - חפיפה דורשת משמרת בסיס');
      }
      
      if (assignmentType !== 'חפיפה' && assignmentType !== 'מוצ״ש') {
        validation.warnings.push('משמרת חפיפה - מומלץ לבחור סוג חפיפה או מוצ״ש');
      }
    }
    
    // Weekend assignment warnings
    if ((isFriday || isSaturday) && assignmentType === 'רגיל') {
      validation.warnings.push('משמרת רגילה בסוף שבוע - בדוק אם זה נכון');
    }
    
    return validation;
  }
  
  // Methods for getting constraints for display
  
  async getRegularConstraintsForMonth(guideId, year, month) {
    const result = await pool.query(`
      SELECT 
        id, user_id, type, date::text as date, details,
        'constraint' as constraint_type, created_at
      FROM constraints 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
      ORDER BY date
    `, [guideId, year, month]);
    
    return result.rows;
  }
  
  async getFixedConstraints(guideId) {
    const result = await pool.query(`
      SELECT 
        id, user_id, weekday, hour_start, hour_end, details,
        'fixed' as constraint_type, created_at
      FROM fixed_constraints 
      WHERE user_id = $1
      ORDER BY weekday
    `, [guideId]);
    
    return result.rows;
  }
  
  async getVacationConstraintsForMonth(guideId, year, month) {
    const result = await pool.query(`
      SELECT 
        id, user_id, date_start::text, date_end::text, note as details, status,
        'vacation' as constraint_type, created_at
      FROM vacations 
      WHERE user_id = $1 
        AND status = 'approved'
        AND (
          (EXTRACT(YEAR FROM date_start) = $2 AND EXTRACT(MONTH FROM date_start) = $3) OR
          (EXTRACT(YEAR FROM date_end) = $2 AND EXTRACT(MONTH FROM date_end) = $3) OR
          (date_start <= DATE($2 || '-' || $3 || '-01') AND 
           date_end >= (DATE($2 || '-' || $3 || '-01') + INTERVAL '1 month - 1 day'))
        )
      ORDER BY date_start
    `, [guideId, year, month]);
    
    return result.rows;
  }
  
  async getDynamicConstraintsForMonth(guideId, year, month) {
    // Get all manual assignments for the guide in the month
    const assignmentsResult = await pool.query(`
      SELECT 
        date::text as date, 
        CASE 
          WHEN guide1_id = $1 THEN guide1_role
          WHEN guide2_id = $1 THEN guide2_role
        END as role
      FROM schedule 
      WHERE (guide1_id = $1 OR guide2_id = $1)
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
        AND is_manual = true
      ORDER BY date
    `, [guideId, year, month]);
    
    const dynamicConstraints = [];
    
    // Generate consecutive day constraints
    assignmentsResult.rows.forEach(assignment => {
      const assignmentDate = new Date(assignment.date);
      
      // Block day before
      const dayBefore = new Date(assignmentDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      // Block day after
      const dayAfter = new Date(assignmentDate);
      dayAfter.setDate(dayAfter.getDate() + 1);
      
      // Add constraint for day before if in same month
      if (dayBefore.getMonth() === assignmentDate.getMonth()) {
        dynamicConstraints.push({
          id: `dynamic_before_${assignment.date}`,
          user_id: guideId,
          date: dayBefore.toISOString().split('T')[0],
          details: `חסום - יום לפני משמרת ב-${assignment.date} (${assignment.role})`,
          constraint_type: 'dynamic_consecutive',
          source_assignment: assignment.date,
          source_role: assignment.role,
          created_at: new Date().toISOString()
        });
      }
      
      // Add constraint for day after if in same month
      if (dayAfter.getMonth() === assignmentDate.getMonth()) {
        dynamicConstraints.push({
          id: `dynamic_after_${assignment.date}`,
          user_id: guideId,
          date: dayAfter.toISOString().split('T')[0],
          details: `חסום - יום אחרי משמרת ב-${assignment.date} (${assignment.role})`,
          constraint_type: 'dynamic_consecutive',
          source_assignment: assignment.date,
          source_role: assignment.role,
          created_at: new Date().toISOString()
        });
      }
    });
    
    return dynamicConstraints;
  }
}

// Export singleton instance
module.exports = new ConstraintChecker();