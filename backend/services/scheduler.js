'use strict';

// Scheduler service (single source of truth)
// Extracted from app.js to a dedicated module per docs plan.

const { pool } = require('../database/postgresql');

// Date/weekday helpers
function getHebrewWeekday(dayIndex) {
  const weekdays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return weekdays[dayIndex];
}

function formatDateLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysLocal(dateStr, deltaDays) {
  const base = new Date(dateStr + 'T00:00:00');
  base.setDate(base.getDate() + deltaDays);
  return formatDateLocal(base);
}

function getAllDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month - 1, 1, 12, 0, 0, 0);
  while (date.getMonth() === month - 1) {
    const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
    days.push(dayDate);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Phase 1: Data preparation
async function prepareSchedulingDataPG(year, month) {
  const guides = (await pool.query("SELECT * FROM users WHERE role = 'מדריך' AND is_active = true ORDER BY name")).rows;
  const constraints = (await pool.query('SELECT * FROM constraints')).rows;
  const fixedConstraints = (await pool.query('SELECT * FROM fixed_constraints')).rows;
  const vacations = (await pool.query("SELECT * FROM vacations WHERE status = 'approved'")).rows;
  const coordinatorRules = (await pool.query('SELECT * FROM coordinator_rules WHERE is_active = true')).rows;
  const existingSchedule = (await pool.query(
    'SELECT * FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2',
    [year, month]
  )).rows;

  // Weekend types: stored on Fridays; mirror to Saturday in-memory
  const weekendTypes = {};
  const weekendRows = (await pool.query(
    'SELECT * FROM weekend_types WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2',
    [year, month]
  )).rows;
  weekendRows.forEach(row => {
    const fridayStr = formatDateLocal(row.date);
    weekendTypes[fridayStr] = row.is_closed === true;
    if (row.is_closed === true) {
      const saturdayStr = addDaysLocal(fridayStr, 1);
      weekendTypes[saturdayStr] = true;
    }
  });

  const days = getAllDaysInMonth(year, month).map(date => {
    const dateStr = formatDateLocal(date);
    return {
      date: dateStr,
      weekday: getHebrewWeekday(date.getDay()),
      weekdayNum: date.getDay(),
      weekendType: weekendTypes[dateStr] || null,
      isWeekend: date.getDay() === 5 || date.getDay() === 6,
      requirements: null,
    };
  });

  const guideStats = {};
  guides.forEach(guide => {
    guideStats[guide.id] = {
      totalShifts: 0,
      leadShifts: 0,
      secondShifts: 0,
      regularShifts: 0,
      overlapShifts: 0,
      standbyShifts: 0,
      motzashShifts: 0,
      weekendShifts: 0,
      weekdayShifts: 0,
      lastShiftDate: null,
      consecutiveDays: 0,
    };
  });

  const manualAssignments = {};
  existingSchedule.forEach(assignment => {
    if (assignment.is_manual) {
      manualAssignments[formatDateLocal(assignment.date)] = assignment;
      if (assignment.guide1_id) {
        updateGuideStatsForAssignmentPG(guideStats[assignment.guide1_id], assignment.date, assignment.guide1_role || 'רגיל');
      }
      if (assignment.guide2_id) {
        updateGuideStatsForAssignmentPG(guideStats[assignment.guide2_id], assignment.date, assignment.guide2_role || 'רגיל');
      }
    }
  });

  return {
    guides,
    constraints,
    fixedConstraints,
    vacations,
    coordinatorRules,
    weekendTypes,
    days,
    guideStats,
    manualAssignments,
    year,
    month,
    options: {},
    totalDays: days.length,
    averageShiftsPerGuide: 0,
  };
}

// Day requirements
function getDayRequirementsPG(dayInfo, context) {
  const { date, weekdayNum } = dayInfo;
  if (weekdayNum === 5) {
    const fridayDateStr = date;
    const isClosedOnFriday = context.weekendTypes[fridayDateStr] === true;
    if (isClosedOnFriday) {
      const saturdayDateStr = addDaysLocal(fridayDateStr, 1);
      return {
        guidesNeeded: 1,
        roles: ['כונן'],
        type: 'standby',
        isClosedWeekendFriday: true,
        linkedSaturday: saturdayDateStr,
      };
    }
  }
  if (weekdayNum === 6) {
    const fridayDateStr = addDaysLocal(date, -1);
    const isClosedFromFriday = context.weekendTypes[fridayDateStr] === true;
    if (isClosedFromFriday) {
      return {
        guidesNeeded: 2,
        roles: ['כונן', 'מוצ״ש'],
        type: 'closed_weekend_saturday',
        isClosedWeekend: true,
        requiresMotzash: true,
        linkedFriday: fridayDateStr,
      };
    }
  }
  return {
    guidesNeeded: 2,
    roles: ['רגיל', 'חפיפה'],
    type: 'regular',
    isWeekend: dayInfo.weekdayNum === 5 || dayInfo.weekdayNum === 6,
  };
}

// Availability and scoring
function calculateTrafficLightStatusForSchedulingPG(guide, guideStats, date, context) {
  try {
    let status = 'green';
    let reason = 'זמין לעבודה';
    if (!guideStats) return { status: 'green', reason: 'מדריך חדש - מועדף לעבודה' };
    if (guideStats.totalShifts >= 8) { status = 'yellow'; reason = 'עומס עבודה גבוה החודש'; }
    else if (guideStats.weekendShifts >= 3) { status = 'yellow'; reason = 'הרבה עבודה בסופי שבוע'; }
    else if (guideStats.standbyShifts >= 2) { status = 'yellow'; reason = 'הרבה עבודת כונן'; }
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    if (isWeekend && guideStats.weekendShifts >= 4) { status = 'red'; reason = 'חריגה חמורה בעבודת סופי שבוע'; }
    if (guideStats.totalShifts >= 12) { status = 'red'; reason = 'עומס עבודה קיצוני - נדרשת הפגה'; }
    if (guideStats.lastShiftDate) {
      const lastShift = new Date(guideStats.lastShiftDate);
      const diffDays = Math.ceil((new Date(date) - lastShift) / (1000 * 60 * 60 * 24));
      if (diffDays === 2 && status === 'green') { status = 'yellow'; reason = 'עבד לפני יומיים - מומלץ מנוחה'; }
    }
    return { status, reason };
  } catch (e) {
    return { status: 'yellow', reason: 'שגיאה בחישוב סטטוס' };
  }
}

async function validateGuideAvailabilityPG(guide, date, context) {
  try {
    const availability = { available: true, score: 0, reasons: [], traffic_light_status: 'green', traffic_light_reason: '' };
    // Hard constraints
    if (context.constraints.some(c => c.user_id === guide.id && c.date === date)) {
      availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'אילוץ אישי'; availability.reasons.push('אילוץ אישי'); return availability;
    }
    const dayOfWeek = new Date(date).getDay();
    if (context.fixedConstraints.some(fc => fc.user_id === guide.id && fc.weekday === dayOfWeek)) {
      availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'אילוץ קבוע'; availability.reasons.push('אילוץ קבוע'); return availability;
    }
    const hasVacation = context.vacations.some(v => v.user_id === guide.id && date >= v.date_start.toISOString().split('T')[0] && date <= v.date_end.toISOString().split('T')[0]);
    if (hasVacation) {
      availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'חופשה'; availability.reasons.push('חופשה'); return availability;
    }
    // Disallow consecutive-day assignments (soft exception for closed-weekend pairing)
    const guideStats = context.guideStats[guide.id];
    if (guideStats && guideStats.lastShiftDate) {
      const previousDayStr = addDaysLocal(date, -1);
      const workedYesterday = guideStats.lastShiftDate === previousDayStr;
      const isClosedSaturday = dayOfWeek === 6 && context.weekendTypes[previousDayStr] === true;
      if (workedYesterday && !isClosedSaturday) {
        availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'אסור יום אחרי יום'; availability.reasons.push('עבד אתמול'); return availability;
      }
    }

    // Coordinator rules
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    if (context.coordinatorRules.some(r => r.rule_type === 'no_auto_scheduling' && r.is_active && r.guide1_id === guide.id)) {
      availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'חוק רכז - לא באוטומטי'; availability.reasons.push('חוק רכז - לא באוטומטי'); return availability;
    }
    if (context.coordinatorRules.some(r => r.rule_type === 'no_weekends' && r.is_active && r.guide1_id === guide.id) && isWeekend) {
      availability.available = false; availability.traffic_light_status = 'red'; availability.traffic_light_reason = 'חוק רכז - לא בסופי שבוע'; availability.reasons.push('חוק רכז - לא בסופי שבוע'); return availability;
    }
    // Traffic-light and scoring
    // Traffic-light and scoring
    // Note: guideStats referenced above; ensure present
    const traffic = calculateTrafficLightStatusForSchedulingPG(guide, guideStats, date, context);
    availability.traffic_light_status = traffic.status;
    availability.traffic_light_reason = traffic.reason;
    let baseScore = 0;
    if (guideStats) {
      baseScore += guideStats.totalShifts * 10;
      baseScore += guideStats.weekendShifts * 6;
      baseScore += guideStats.standbyShifts * 12;
      if (guideStats.motzashShifts) baseScore += guideStats.motzashShifts * 8;
      if (guideStats.lastShiftDate) {
        const diffDays = Math.ceil((new Date(date) - new Date(guideStats.lastShiftDate)) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays > 1) { baseScore += (4 - diffDays) * 5; availability.reasons.push(`עבד לפני ${diffDays} ימים`); }
      }
      if (guideStats.standbyShifts >= 2) { baseScore += 100; availability.reasons.push(`כבר ${guideStats.standbyShifts} כוננויות החודש`); }
      if (guideStats.weekendShifts >= 4) { baseScore += 80; availability.reasons.push('הרבה עבודת סופי שבוע'); }
    }
    switch (availability.traffic_light_status) {
      case 'yellow': availability.score = baseScore + 50; break;
      case 'red': availability.score = baseScore + 200; break;
      default: availability.score = baseScore; break;
    }
    availability.score += Math.random() * 2;
    return availability;
  } catch (e) {
    return { available: false, score: 1000, reasons: ['שגיאה בבדיקת זמינות'], traffic_light_status: 'red', traffic_light_reason: 'שגיאה במערכת' };
  }
}

function hasCoordinatorConflictPG(guide1, guide2, context) {
  const noTogether = context.coordinatorRules.find(r => r.rule_type === 'no_together' && r.is_active && ((r.guide1_id === guide1.id && r.guide2_id === guide2.id) || (r.guide1_id === guide2.id && r.guide2_id === guide1.id)));
  if (noTogether) return true;
  const preventPair = context.coordinatorRules.find(r => r.rule_type === 'prevent_pair' && r.is_active && ((r.guide1_id === guide1.id && r.guide2_id === guide2.id) || (r.guide1_id === guide2.id && r.guide2_id === guide1.id)));
  if (preventPair) return true;
  const guide1ManualOnly = context.coordinatorRules.find(r => r.rule_type === 'manual_only' && r.is_active && r.guide1_id === guide1.id);
  const guide2ManualOnly = context.coordinatorRules.find(r => r.rule_type === 'manual_only' && r.is_active && r.guide1_id === guide2.id);
  return !!(guide1ManualOnly || guide2ManualOnly);
}

async function selectOptimalGuidesPG(availableGuides, requirements, context, date) {
  if (availableGuides.length === 0) return null;
  const { guidesNeeded, roles, type } = requirements;

  if (type === 'closed_weekend_saturday') {
    const fridayDateStr = addDaysLocal(date, -1);
    let fridayAssignment = context.manualAssignments[fridayDateStr] || context.assignments?.find(a => a.date === fridayDateStr);
    let standbyGuide = null;
    if (fridayAssignment && fridayAssignment.guide1_id) {
      standbyGuide = context.guides.find(g => g.id === fridayAssignment.guide1_id);
    }
    const motzashCandidates = availableGuides.filter(g => g.id !== standbyGuide?.id);
    const motzashGuide = motzashCandidates[0];
    return {
      date,
      weekday: getHebrewWeekday(new Date(date).getDay()),
      type: 'מוצ״ש',
      guide1_id: standbyGuide?.id || null,
      guide1_name: standbyGuide?.name || null,
      guide1_role: 'כונן',
      guide2_id: motzashGuide?.id || null,
      guide2_name: motzashGuide?.name || null,
      guide2_role: 'מוצ״ש',
      is_manual: false,
      is_locked: false,
      created_by: null,
    };
  }

  if (type === 'standby') {
    const validStandbyGuides = availableGuides.filter(g => !context.coordinatorRules.some(r => r.rule_type === 'no_conan' && r.is_active && r.guide1_id === g.id));
    if (validStandbyGuides.length === 0) return null;
    const standbyGuide = validStandbyGuides[0];
    return {
      date,
      weekday: getHebrewWeekday(new Date(date).getDay()),
      type: 'כונן',
      guide1_id: standbyGuide.id,
      guide1_name: standbyGuide.name,
      guide1_role: 'כונן',
      guide2_id: null,
      guide2_name: null,
      guide2_role: null,
      is_manual: false,
      is_locked: false,
      created_by: null,
    };
  }

  const guide1 = availableGuides[0];
  let guide2 = null;
  if (guidesNeeded > 1) {
    const guide2Candidates = availableGuides.slice(1).filter(g => !hasCoordinatorConflictPG(guide1, g, context));
    guide2 = guide2Candidates.length > 0 ? guide2Candidates[0] : availableGuides[1];
  }
  return {
    date,
    weekday: getHebrewWeekday(new Date(date).getDay()),
    type: roles.join('+'),
    guide1_id: guide1.id,
    guide1_name: guide1.name,
    guide1_role: roles[0],
    guide2_id: guide2?.id || null,
    guide2_name: guide2?.name || null,
    guide2_role: guide2 ? roles[1] : null,
    is_manual: false,
    is_locked: false,
    created_by: null,
  };
}

async function handleClosedSaturdayWeekendPG(fridayInfo, context) {
  const { date: fridayDate } = fridayInfo;
  const saturdayDateStr = addDaysLocal(fridayDate, 1);
  const fridayAvailable = await Promise.all(
    context.guides.map(async guide => {
      const availability = await validateGuideAvailabilityPG(guide, fridayDate, context);
      if (availability.available && context.guideStats[guide.id].standbyShifts >= 2) {
        availability.available = false;
        availability.reason = 'כבר עבד כונן פעמיים החודש';
      }
      return { ...guide, availability };
    })
  );
  const availableForStandby = fridayAvailable.filter(g => g.availability.available).sort((a, b) => a.availability.score - b.availability.score);
  if (availableForStandby.length === 0) {
    const anyAvailable = fridayAvailable.filter(g => g.availability.available || g.availability.reason === 'כבר עבד כונן פעמיים החודש').sort((a, b) => a.availability.score - b.availability.score);
    if (anyAvailable.length > 0) {
      const standbyGuide = anyAvailable[0];
      return {
        date: fridayDate,
        weekday: getHebrewWeekday(new Date(fridayDate).getDay()),
        type: 'כונן',
        guide1_id: standbyGuide.id,
        guide1_name: standbyGuide.name,
        guide1_role: 'כונן',
        guide2_id: null,
        guide2_name: null,
        guide2_role: null,
        is_manual: false,
        is_locked: false,
        created_by: null,
        linkedSaturday: saturdayDateStr,
        warning: 'Guide assigned despite standby limit',
      };
    }
    return null;
  }
  const standbyGuide = availableForStandby[0];
  return {
    date: fridayDate,
    weekday: getHebrewWeekday(new Date(fridayDate).getDay()),
    type: 'כונן',
    guide1_id: standbyGuide.id,
    guide1_name: standbyGuide.name,
    guide1_role: 'כונן',
    guide2_id: null,
    guide2_name: null,
    guide2_role: null,
    is_manual: false,
    is_locked: false,
    created_by: null,
    linkedSaturday: saturdayDateStr,
  };
}

async function assignDayOptimalPG(dayInfo, context) {
  const { date, weekdayNum } = dayInfo;
  if (context.manualAssignments[date]) return context.manualAssignments[date];
  const requirements = getDayRequirementsPG(dayInfo, context);
  dayInfo.requirements = requirements;
  if (requirements.isClosedWeekend || requirements.isClosedSaturday) {
    if (weekdayNum === 5) return await handleClosedSaturdayWeekendPG(dayInfo, context);
    if (weekdayNum === 6) {
      const fridayDateStr = addDaysLocal(date, -1);
      let fridayAssignment = context.manualAssignments[fridayDateStr] || context.assignments?.find(a => a.date === fridayDateStr);
      if (!fridayAssignment) {
        const fridayInfo = { date: fridayDateStr, weekday: getHebrewWeekday(5), weekdayNum: 5, weekendType: true };
        const fridayAssignmentResult = await handleClosedSaturdayWeekendPG(fridayInfo, context);
        if (fridayAssignmentResult) {
          context.assignments = context.assignments || [];
          context.assignments.push(fridayAssignmentResult);
          fridayAssignment = fridayAssignmentResult;
        }
      }
      if (fridayAssignment && fridayAssignment.guide1_id) {
        const standbyGuide = context.guides.find(g => g.id === fridayAssignment.guide1_id);
        if (standbyGuide) {
          const motzashAvailable = await Promise.all(context.guides.map(async g => {
            if (g.id === standbyGuide.id) return null;
            const availability = await validateGuideAvailabilityPG(g, date, context);
            return { ...g, availability };
          }));
          const availableForMotzash = motzashAvailable.filter(g => g && g.availability.available).sort((a, b) => a.availability.score - b.availability.score);
          if (availableForMotzash.length > 0) {
            const motzashGuide = availableForMotzash[0];
            return {
              date,
              weekday: getHebrewWeekday(dayInfo.weekdayNum),
              type: 'מוצ״ש',
              guide1_id: standbyGuide.id,
              guide1_name: standbyGuide.name,
              guide1_role: 'כונן',
              guide2_id: motzashGuide.id,
              guide2_name: motzashGuide.name,
              guide2_role: 'מוצ״ש',
              is_manual: false,
              is_locked: false,
              created_by: null,
            };
          }
          return {
            date,
            weekday: getHebrewWeekday(dayInfo.weekdayNum),
            type: 'כונן',
            guide1_id: standbyGuide.id,
            guide1_name: standbyGuide.name,
            guide1_role: 'כונן',
            guide2_id: null,
            guide2_name: null,
            guide2_role: null,
            is_manual: false,
            is_locked: false,
            created_by: null,
          };
        }
      }
    }
  }
  const guidesWithAvailability = await Promise.all(context.guides.map(async g => ({ ...g, availability: await validateGuideAvailabilityPG(g, date, context) })));
  const availableGuides = guidesWithAvailability.filter(g => g.availability.available).sort((a, b) => a.availability.score - b.availability.score);
  if (availableGuides.length === 0) {
    const overrideGuides = await tryOverrideSoftConstraintsPG(guidesWithAvailability, date, context);
    if (overrideGuides.length > 0) return await selectOptimalGuidesPG(overrideGuides, requirements, context, date);
    return null;
  }
  return await selectOptimalGuidesPG(availableGuides, requirements, context, date);
}

async function tryOverrideSoftConstraintsPG() {
  return [];
}

function updateGuideStatsForAssignmentPG(stats, date, role) {
  if (!stats) return;
  stats.totalShifts++;
  stats.lastShiftDate = date;
  switch (role) {
    case 'רגיל': stats.regularShifts++; break;
    case 'חפיפה': stats.overlapShifts++; break;
    case 'כונן': stats.standbyShifts++; break;
    case 'מוצ״ש': stats.motzashShifts++; break;
  }
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 5 || dayOfWeek === 6) stats.weekendShifts++; else stats.weekdayShifts++;
}

function updateContextWithAssignmentPG(context, assignment) {
  if (assignment.guide1_id) updateGuideStatsForAssignmentPG(context.guideStats[assignment.guide1_id], assignment.date, assignment.guide1_role);
  if (assignment.guide2_id) updateGuideStatsForAssignmentPG(context.guideStats[assignment.guide2_id], assignment.date, assignment.guide2_role);
  if (assignment.is_manual) context.manualAssignments[assignment.date] = assignment;
}

async function saveAssignmentsToDatabasePG(assignments, year, month, guides) {
  await pool.query(
    `DELETE FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND (is_manual IS NULL OR is_manual = false)`,
    [year, month]
  );
  await pool.query("SELECT setval('schedule_id_seq', COALESCE((SELECT MAX(id) FROM schedule), 0) + 1, false)");
  const manualDatesResult = await pool.query(
    `SELECT date::date AS date_only FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND is_manual = true`,
    [year, month]
  );
  const manualDateSet = new Set(manualDatesResult.rows.map(r => r.date_only.toISOString().split('T')[0]));
  for (const assignment of assignments) {
    if (manualDateSet.has(assignment.date)) continue;
    const guide1Name = assignment.guide1_id ? guides.find(g => g.id === assignment.guide1_id)?.name : null;
    const guide2Name = assignment.guide2_id ? guides.find(g => g.id === assignment.guide2_id)?.name : null;
    const dateObj = new Date(assignment.date);
    const weekdayName = getHebrewWeekday(dateObj.getDay());
    const type = assignment.type || ((dateObj.getDay() === 5 || dateObj.getDay() === 6) ? 'weekend' : 'weekday');
    await pool.query(
      `INSERT INTO schedule (date, weekday, type, guide1_id, guide2_id, guide1_role, guide2_role, guide1_name, guide2_name, is_manual, is_locked, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, false, NOW(), NOW())`,
      [assignment.date, weekdayName, type, assignment.guide1_id, assignment.guide2_id, assignment.guide1_role, assignment.guide2_role, guide1Name, guide2Name]
    );
  }
}

function generateFinalStatisticsPG(context, assignments) {
  const stats = { total_assignments: assignments.length, guides_used: new Set(), average_shifts_per_guide: 0, assigned: assignments.length, empty_days: context.totalDays - assignments.length };
  assignments.forEach(a => { if (a.guide1_id) stats.guides_used.add(a.guide1_id); if (a.guide2_id) stats.guides_used.add(a.guide2_id); });
  stats.guides_used = Array.from(stats.guides_used).length;
  stats.average_shifts_per_guide = stats.total_assignments > 0 ? (stats.total_assignments * 2) / stats.guides_used : 0;
  return stats;
}

// Main entry
async function runCompleteAutoSchedulingPG(year, month, options = {}) {
  try {
    const context = await prepareSchedulingDataPG(year, month);
    const assignments = [];
    const warnings = [];
    context.assignments = assignments;
    for (const dayInfo of context.days) {
      try {
        const assignment = await assignDayOptimalPG(dayInfo, context);
        if (assignment) {
          assignments.push(assignment);
          updateContextWithAssignmentPG(context, assignment);
        } else {
          warnings.push({ type: 'assignment_failed', date: dayInfo.date, message: `Failed to assign guides for ${dayInfo.date}` });
        }
      } catch (error) {
        warnings.push({ type: 'assignment_error', date: dayInfo.date, message: `Error assigning ${dayInfo.date}: ${error.message}` });
      }
    }
    await saveAssignmentsToDatabasePG(assignments, year, month, context.guides);
    const stats = generateFinalStatisticsPG(context, assignments);
    return { success: true, assignments, warnings, stats };
  } catch (error) {
    return { success: false, error: error.message, warnings: [] };
  }
}

module.exports = {
  // main
  runCompleteAutoSchedulingPG,
  // helpers exposed for tests/future use
  prepareSchedulingDataPG,
  assignDayOptimalPG,
  handleClosedSaturdayWeekendPG,
  selectOptimalGuidesPG,
  getDayRequirementsPG,
  validateGuideAvailabilityPG,
  calculateTrafficLightStatusForSchedulingPG,
  updateGuideStatsForAssignmentPG,
  updateContextWithAssignmentPG,
  saveAssignmentsToDatabasePG,
  generateFinalStatisticsPG,
  getAllDaysInMonth,
  getHebrewWeekday,
  formatDateLocal,
  addDaysLocal,
};


