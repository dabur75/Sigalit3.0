const express = require('express');
const router = express.Router();
const { pool } = require('../database/postgresql');

/**
 * Enhanced Manual Scheduler API Routes
 * 
 * These routes provide drag-and-drop manual scheduling functionality with:
 * - Real-time guide statistics and salary calculations
 * - Comprehensive constraint checking (regular, fixed, vacations)
 * - Dual-slot calendar support (normal + overlap)
 * - Israeli localization and weekend logic
 */

// GET /api/enhanced-manual/guides/:year/:month
// Get all guides with their monthly statistics for guide cards
router.get('/guides/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const { house_id = 'dror' } = req.query;
    
    console.log(`🔍 Fetching guides with stats for ${year}-${month}, house: ${house_id}`);
    
    // Get all active guides
    const guidesResult = await pool.query(`
      SELECT id, name, role, house_id, email, phone, is_active
      FROM users 
      WHERE role = 'מדריך' AND is_active = true
      ORDER BY name
    `);
    
    // Get schedule data for the month to calculate statistics
    const scheduleResult = await pool.query(`
      SELECT 
        s.*,
        u1.name as guide1_name,
        u2.name as guide2_name,
        wt.is_closed
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      LEFT JOIN weekend_types wt ON s.date = wt.date
      WHERE EXTRACT(YEAR FROM s.date) = $1 
        AND EXTRACT(MONTH FROM s.date) = $2
      ORDER BY s.date
    `, [year, month]);
    
    // Get weekend types for proper hour calculations
    const weekendTypesResult = await pool.query(`
      SELECT date::text as date, is_closed 
      FROM weekend_types 
      WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
    `, [year, month]);
    
    const weekendTypes = {};
    weekendTypesResult.rows.forEach(row => {
      weekendTypes[row.date] = row.is_closed;
    });
    
    // Calculate statistics for each guide using existing logic
    const guidesWithStats = guidesResult.rows.map(guide => {
      const stats = calculateGuideStatistics(scheduleResult.rows, guide.id, year, month, weekendTypes);
      return {
        id: guide.id,
        name: guide.name,
        role: guide.role,
        house_id: guide.house_id,
        email: guide.email,
        phone: guide.phone,
        is_active: guide.is_active,
        // Statistics for guide cards
        total_shifts: stats.total_shifts,
        manual_shifts: stats.manual_shifts,
        auto_shifts: stats.auto_shifts,
        regular_shifts: stats.regular_shifts,
        overlap_shifts: stats.overlap_shifts,
        conan_shifts: stats.conan_shifts,
        motzash_shifts: stats.motzash_shifts,
        weekend_shifts: stats.weekend_shifts,
        // Hours breakdown
        regular_hours: stats.regular_hours,
        night_hours: stats.night_hours,
        shabbat_hours: stats.shabbat_hours,
        conan_hours: stats.conan_hours,
        conan_shabbat_hours: stats.conan_shabbat_hours,
        motzash_hours: stats.motzash_hours,
        total_hours: stats.total_hours,
        // Key display values
        salary_factor: stats.salary_factor
      };
    });
    
    res.json({
      success: true,
      guides: guidesWithStats,
      month: `${year}-${String(month).padStart(2, '0')}`,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching guides with statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guides with statistics',
      details: error.message
    });
  }
});

// GET /api/enhanced-manual/constraints/:guideId/:year/:month
// Get all constraints for a specific guide in a given month
router.get('/constraints/:guideId/:year/:month', async (req, res) => {
  try {
    const { guideId, year, month } = req.params;
    
    console.log(`🚫 Fetching constraints for guide ${guideId} in ${year}-${month}`);
    
    // Get specific date constraints
    const constraintsResult = await pool.query(`
      SELECT 
        id, 
        user_id, 
        type, 
        date::text as date, 
        details,
        'constraint' as constraint_type,
        created_at
      FROM constraints 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
    `, [guideId, year, month]);
    
    // Get fixed weekly constraints
    const fixedConstraintsResult = await pool.query(`
      SELECT 
        id,
        user_id,
        weekday,
        hour_start,
        hour_end,
        details,
        'fixed' as constraint_type,
        created_at
      FROM fixed_constraints 
      WHERE user_id = $1
    `, [guideId]);
    
    // Get vacation constraints that overlap with the month
    const vacationsResult = await pool.query(`
      SELECT 
        id,
        user_id,
        date_start::text as date_start,
        date_end::text as date_end,
        note as details,
        status,
        'vacation' as constraint_type,
        created_at
      FROM vacations 
      WHERE user_id = $1 
        AND status = 'approved'
        AND (
          (EXTRACT(YEAR FROM date_start) = $2 AND EXTRACT(MONTH FROM date_start) = $3) OR
          (EXTRACT(YEAR FROM date_end) = $2 AND EXTRACT(MONTH FROM date_end) = $3) OR
          (date_start <= DATE($2 || '-' || $3 || '-01') AND date_end >= (DATE($2 || '-' || $3 || '-01') + INTERVAL '1 month - 1 day'))
        )
    `, [guideId, year, month]);
    
    // Calculate dynamic constraints based on existing assignments
    const assignmentsResult = await pool.query(`
      SELECT date::text as date, guide1_id, guide2_id, guide1_role, guide2_role
      FROM schedule 
      WHERE (guide1_id = $1 OR guide2_id = $1)
        AND EXTRACT(YEAR FROM date) = $2 
        AND EXTRACT(MONTH FROM date) = $3
        AND is_manual = true
    `, [guideId, year, month]);
    
    // Generate consecutive day constraints
    const dynamicConstraints = [];
    assignmentsResult.rows.forEach(assignment => {
      const assignmentDate = new Date(assignment.date);
      
      // Block day before
      const dayBefore = new Date(assignmentDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      
      // Block day after
      const dayAfter = new Date(assignmentDate);
      dayAfter.setDate(dayAfter.getDate() + 1);
      
      // Only add if within the same month
      if (dayBefore.getMonth() === assignmentDate.getMonth()) {
        dynamicConstraints.push({
          id: `dynamic_before_${assignment.date}`,
          user_id: parseInt(guideId),
          date: dayBefore.toISOString().split('T')[0],
          details: `חסום - יום לפני משמרת ב-${assignment.date}`,
          constraint_type: 'dynamic_consecutive',
          created_at: new Date().toISOString(),
          source_assignment: assignment.date
        });
      }
      
      if (dayAfter.getMonth() === assignmentDate.getMonth()) {
        dynamicConstraints.push({
          id: `dynamic_after_${assignment.date}`,
          user_id: parseInt(guideId),
          date: dayAfter.toISOString().split('T')[0],
          details: `חסום - יום אחרי משמרת ב-${assignment.date}`,
          constraint_type: 'dynamic_consecutive',
          created_at: new Date().toISOString(),
          source_assignment: assignment.date
        });
      }
    });
    
    res.json({
      success: true,
      guide_id: parseInt(guideId),
      month: `${year}-${String(month).padStart(2, '0')}`,
      constraints: {
        regular: constraintsResult.rows,
        fixed: fixedConstraintsResult.rows,
        vacations: vacationsResult.rows,
        dynamic: dynamicConstraints
      },
      total_constraints: constraintsResult.rows.length + fixedConstraintsResult.rows.length + 
                        vacationsResult.rows.length + dynamicConstraints.length,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching constraints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch constraints',
      details: error.message
    });
  }
});

// POST /api/enhanced-manual/validate-assignment
// Validate if an assignment is allowed before committing
router.post('/validate-assignment', async (req, res) => {
  try {
    const { guide_id, date, slot_type, assignment_type } = req.body;
    
    if (!guide_id || !date || !slot_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: guide_id, date, slot_type'
      });
    }
    
    console.log(`✅ Validating assignment: Guide ${guide_id} on ${date} (${slot_type})`);
    
    const validation = await validateAssignment(guide_id, date, slot_type, assignment_type);
    
    res.json({
      success: true,
      is_valid: validation.isValid,
      reasons: validation.reasons,
      warnings: validation.warnings,
      guide_id: parseInt(guide_id),
      date: date,
      slot_type: slot_type,
      assignment_type: assignment_type || 'auto-detect',
      validated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error validating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate assignment',
      details: error.message
    });
  }
});

// POST /api/enhanced-manual/assign
// Create a manual assignment (similar to existing /api/schedule/manual but enhanced)
router.post('/assign', async (req, res) => {
  try {
    const { guide_id, date, slot_type, assignment_type, created_by = 'enhanced-manual' } = req.body;
    
    if (!guide_id || !date || !slot_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: guide_id, date, slot_type'
      });
    }
    
    console.log(`📝 Creating assignment: Guide ${guide_id} on ${date} (${slot_type})`);
    
    // Validate before creating
    const validation = await validateAssignment(guide_id, date, slot_type, assignment_type);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Assignment validation failed',
        reasons: validation.reasons,
        warnings: validation.warnings
      });
    }
    
    // Determine guide assignments based on slot type
    let guide1_id = null;
    let guide2_id = null;
    let type = assignment_type || 'רגיל';
    
    if (slot_type === 'normal') {
      guide1_id = guide_id;
    } else if (slot_type === 'overlap') {
      // For overlap, we need to check if there's already a normal assignment
      const existingResult = await pool.query(
        'SELECT guide1_id FROM schedule WHERE date::date = $1::date',
        [date]
      );
      
      if (existingResult.rows.length > 0 && existingResult.rows[0].guide1_id) {
        guide1_id = existingResult.rows[0].guide1_id;
        guide2_id = guide_id;
        type = 'חפיפה';
      } else {
        guide1_id = guide_id;
      }
    }
    
    // Use existing manual assignment logic
    const assignmentResult = await createManualAssignment({
      date,
      guide1_id,
      guide2_id,
      type,
      created_by
    });
    
    res.json({
      success: true,
      assignment: assignmentResult,
      slot_type: slot_type,
      validation: validation,
      created_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment',
      details: error.message
    });
  }
});

// DELETE /api/enhanced-manual/assignment/:date/:slot
// Remove an assignment from a specific date and slot
router.delete('/assignment/:date/:slot', async (req, res) => {
  try {
    const { date, slot } = req.params;
    const { guide_id } = req.query; // Optional: specific guide to remove
    
    console.log(`🗑️ Removing assignment from ${date} (${slot} slot)`);
    
    // Get existing assignment
    const existingResult = await pool.query(
      'SELECT * FROM schedule WHERE date::date = $1::date',
      [date]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No assignment found for this date'
      });
    }
    
    const existing = existingResult.rows[0];
    
    if (slot === 'normal') {
      // Remove guide1, keep guide2 if exists
      if (existing.guide2_id) {
        // Move guide2 to guide1 position
        await pool.query(`
          UPDATE schedule 
          SET guide1_id = $1, guide1_role = $2, guide2_id = NULL, guide2_role = NULL,
              updated_at = NOW()
          WHERE date::date = $3::date
        `, [existing.guide2_id, existing.guide2_role || 'רגיל', date]);
      } else {
        // Delete entire assignment
        await pool.query('DELETE FROM schedule WHERE date::date = $1::date', [date]);
      }
    } else if (slot === 'overlap') {
      // Remove guide2 only
      await pool.query(`
        UPDATE schedule 
        SET guide2_id = NULL, guide2_role = NULL, updated_at = NOW()
        WHERE date::date = $1::date
      `, [date]);
    }
    
    res.json({
      success: true,
      message: 'Assignment removed successfully',
      date: date,
      slot: slot,
      removed_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error removing assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove assignment',
      details: error.message
    });
  }
});

// Helper function: Calculate guide statistics (reuse existing logic)
function calculateGuideStatistics(schedule, guideId, year, month, weekendTypes) {
  const stats = {
    total_shifts: 0,
    manual_shifts: 0,
    auto_shifts: 0,
    regular_shifts: 0,
    overlap_shifts: 0,
    conan_shifts: 0,
    motzash_shifts: 0,
    weekend_shifts: 0,
    regular_hours: 0,
    night_hours: 0,
    shabbat_hours: 0,
    conan_hours: 0,
    conan_shabbat_hours: 0,
    motzash_hours: 0,
    total_hours: 0,
    salary_factor: 0
  };
  
  schedule.forEach((day, index) => {
    // Check if guide is assigned on this day
    const isGuide1 = day.guide1_id === guideId;
    const isGuide2 = day.guide2_id === guideId;
    
    if (isGuide1 || isGuide2) {
      const role = isGuide1 ? day.guide1_role : day.guide2_role;
      const dayOfWeek = new Date(day.date).getDay();
      const isFriday = dayOfWeek === 5;
      const isSaturday = dayOfWeek === 6;
      const isWeekend = isFriday || isSaturday;
      
      stats.total_shifts++;
      
      if (day.is_manual) stats.manual_shifts++;
      else stats.auto_shifts++;
      
      if (isWeekend) stats.weekend_shifts++;
      
      // Count by role type
      if (role === 'רגיל') stats.regular_shifts++;
      else if (role === 'חפיפה') stats.overlap_shifts++;
      else if (role === 'כונן') stats.conan_shifts++;
      else if (role === 'מוצ״ש') stats.motzash_shifts++;
      
      // Calculate hours (reuse existing complex logic)
      const hours = calculateHoursForShift(day, role, weekendTypes, schedule, index);
      
      stats.regular_hours += hours.regular;
      stats.night_hours += hours.night;
      stats.shabbat_hours += hours.shabbat;
      stats.conan_hours += hours.conan;
      stats.conan_shabbat_hours += hours.conan_shabbat;
      stats.motzash_hours += hours.motzash;
    }
  });
  
  // Calculate totals
  stats.total_hours = stats.regular_hours + stats.night_hours + stats.shabbat_hours + 
                      stats.conan_hours + stats.conan_shabbat_hours + stats.motzash_hours;
  
  // Calculate salary factor with correct multipliers
  stats.salary_factor = (stats.regular_hours * 1.0) + 
                        (stats.night_hours * 1.5) + 
                        (stats.shabbat_hours * 2.0) + 
                        (stats.conan_hours * 0.3) + 
                        (stats.conan_shabbat_hours * 0.6) + 
                        (stats.motzash_hours * 1.0);
  
  return stats;
}

// Helper function: Calculate hours for a shift (simplified version)
function calculateHoursForShift(day, role, weekendTypes, schedule, dayIndex) {
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
  
  // Simplified hour calculation - can be enhanced with full logic later
  switch (role) {
    case 'כונן':
      if (isFriday && isClosedSaturday) {
        hours.conan = 10;
        hours.conan_shabbat = 22;
      } else {
        hours.conan = 24;
      }
      break;
      
    case 'מוצ״ש':
      if (isSaturday && isClosedSaturday) {
        hours.shabbat = 2;
        hours.regular = 5;
        hours.night = 8;
        hours.motzash = 15;
      } else {
        hours.shabbat = 16;
      }
      break;
      
    case 'רגיל':
      if (isFriday && !isClosedSaturday) {
        hours.regular = 10;
        hours.shabbat = 14;
      } else if (isSaturday && !isClosedSaturday) {
        hours.shabbat = 24;
      } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        hours.regular = 16;
        hours.night = 8;
      }
      break;
      
    case 'חפיפה':
      // Overlap typically adds 1 hour
      hours.regular = 1;
      break;
      
    default:
      hours.regular = 8; // Default fallback
  }
  
  return hours;
}

// Helper function: Validate assignment
async function validateAssignment(guideId, date, slotType, assignmentType) {
  const validation = {
    isValid: true,
    reasons: [],
    warnings: []
  };
  
  try {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    
    // Check regular constraints
    const constraintResult = await pool.query(`
      SELECT * FROM constraints 
      WHERE user_id = $1 AND date = $2::date
    `, [guideId, date]);
    
    if (constraintResult.rows.length > 0) {
      validation.isValid = false;
      validation.reasons.push(`מדריך חסום בתאריך זה - ${constraintResult.rows[0].details || 'אילוץ רגיל'}`);
    }
    
    // Check fixed constraints
    const fixedResult = await pool.query(`
      SELECT * FROM fixed_constraints 
      WHERE user_id = $1 AND weekday = $2
    `, [guideId, dayOfWeek]);
    
    if (fixedResult.rows.length > 0) {
      validation.isValid = false;
      validation.reasons.push(`מדריך חסום ביום ${['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'][dayOfWeek]} - ${fixedResult.rows[0].details || 'אילוץ קבוע'}`);
    }
    
    // Check vacation constraints
    const vacationResult = await pool.query(`
      SELECT * FROM vacations 
      WHERE user_id = $1 AND status = 'approved'
        AND date_start <= $2::date AND date_end >= $2::date
    `, [guideId, date]);
    
    if (vacationResult.rows.length > 0) {
      validation.isValid = false;
      validation.reasons.push(`מדריך בחופשה - ${vacationResult.rows[0].note || 'חופשה מאושרת'}`);
    }
    
    // Check consecutive days
    const dayBefore = new Date(dateObj);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(dateObj);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const consecutiveResult = await pool.query(`
      SELECT date::text as date FROM schedule 
      WHERE (guide1_id = $1 OR guide2_id = $1)
        AND (date = $2::date OR date = $3::date)
        AND is_manual = true
    `, [guideId, dayBefore.toISOString().split('T')[0], dayAfter.toISOString().split('T')[0]]);
    
    if (consecutiveResult.rows.length > 0) {
      validation.isValid = false;
      validation.reasons.push('מדריך משובץ ביום סמוך - חל איסור על ימים עוקבים');
    }
    
    // Check if slot is already occupied
    const existingResult = await pool.query(`
      SELECT guide1_id, guide2_id, guide1_role, guide2_role 
      FROM schedule WHERE date::date = $1::date
    `, [date]);
    
    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      
      if (slotType === 'normal' && existing.guide1_id) {
        validation.warnings.push(`המשמרת הרגילה תוחלף - נמצא: ${existing.guide1_role || 'משמרת קיימת'}`);
      }
      
      if (slotType === 'overlap' && existing.guide2_id) {
        validation.warnings.push(`החפיפה תוחלף - נמצא: ${existing.guide2_role || 'חפיפה קיימת'}`);
      }
    }
    
  } catch (error) {
    console.error('Error in validation:', error);
    validation.isValid = false;
    validation.reasons.push('שגיאה בבדיקת אילוצים');
  }
  
  return validation;
}

// Helper function: Create manual assignment (wrapper around existing logic)
async function createManualAssignment({ date, guide1_id, guide2_id, type, created_by }) {
  // This will use the existing POST /api/schedule/manual logic
  // For now, we'll implement a simplified version
  
  const jsDate = new Date(date);
  const hebrewWeekdays = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const dow = jsDate.getDay();
  const weekday = hebrewWeekdays[dow];
  const scheduleType = (dow === 5 || dow === 6) ? 'weekend' : 'weekday';
  
  // Derive roles from type
  let guide1_role = null;
  let guide2_role = null;
  
  if (type === 'כונן') {
    guide1_role = 'כונן';
  } else if (type === 'רגיל') {
    guide1_role = 'רגיל';
  } else if (type === 'חפיפה') {
    guide1_role = 'רגיל';
    guide2_role = 'חפיפה';
  } else if (type === 'מוצ״ש') {
    guide1_role = 'מוצ״ש';
  }
  
  // Upsert logic
  const existingRes = await pool.query('SELECT * FROM schedule WHERE date::date = $1::date', [date]);
  
  if (existingRes.rows.length === 0) {
    // Insert new
    const insertResult = await pool.query(`
      INSERT INTO schedule (
        date, weekday, type, 
        guide1_id, guide2_id, 
        guide1_role, guide2_role,
        is_manual, is_locked,
        created_by, created_at, updated_at,
        house_id
      ) VALUES (
        $1::date, $2, $3,
        $4, $5,
        $6, $7,
        true, false,
        $8, NOW(), NOW(),
        'dror'
      )
      RETURNING *
    `, [date, weekday, scheduleType, guide1_id, guide2_id, guide1_role, guide2_role, created_by]);
    
    return insertResult.rows[0];
  } else {
    // Update existing
    const existing = existingRes.rows[0];
    
    const updateResult = await pool.query(`
      UPDATE schedule SET
        guide1_id = $1, guide2_id = $2,
        guide1_role = $3, guide2_role = $4,
        is_manual = true, updated_at = NOW()
      WHERE date::date = $5::date
      RETURNING *
    `, [
      guide1_id || existing.guide1_id,
      guide2_id || existing.guide2_id,
      guide1_role || existing.guide1_role,
      guide2_role || existing.guide2_role,
      date
    ]);
    
    return updateResult.rows[0];
  }
}

module.exports = router;