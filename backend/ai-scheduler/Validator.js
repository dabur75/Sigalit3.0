'use strict';

/**
 * Deterministic validator for AI proposals
 * Enforces MUST rules; drops violating assignments and records warnings
 */

function toDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function fmt(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, delta) {
  const d = toDate(dateStr);
  d.setDate(d.getDate() + delta);
  return fmt(d);
}

function isWeekendDay(dateStr) {
  const dow = toDate(dateStr).getDay();
  return dow === 5 || dow === 6; // Fri or Sat
}

/**
 * Validate monthly proposal with completion checking and gap filling
 * @param {Object} context - month context from context-builder
 * @param {Array} proposal - [{ date, assignments:[{guide_id, role}], explanation_he }]
 * @returns {{proposal:Array, warnings:Array, stats:Object, completionStatus:Object}}
 */
function validateMonthlyProposal(context, proposal) {
  console.log('🔍 VALIDATOR: Starting validation of', proposal?.length || 0, 'days');
  const warnings = [];
  const sanitized = [];
  
  // Generate all dates in month for completion checking
  const year = context.year;
  const month = context.month;
  const daysInMonth = new Date(year, month, 0).getDate();
  const allDatesInMonth = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    allDatesInMonth.push(dateStr);
  }

  // Index helpers
  const guideSet = new Set(context.guides.map(g => g.id));
  // Manual assignments map: date -> [{guide_id, role}]
  const manualByDate = new Map();
  if (Array.isArray(context.manualAssignments)) {
    for (const m of context.manualAssignments) {
      const arr = [];
      if (m.guide1_id) arr.push({ guide_id: m.guide1_id, role: m.guide1_role || 'רגיל' });
      if (m.guide2_id) arr.push({ guide_id: m.guide2_id, role: m.guide2_role || 'רגיל' });
      manualByDate.set(m.date, arr);
    }
  }
  
  // Also check existingSchedule for manual assignments (enhancement mode)
  if (Array.isArray(context.existingSchedule)) {
    for (const day of context.existingSchedule) {
      if (day.is_manual && Array.isArray(day.assignments)) {
        const arr = day.assignments.map(a => ({ guide_id: a.guide_id, role: a.role || 'רגיל' }));
        manualByDate.set(day.date, arr);
      }
    }
  }
  const constraintsByDate = new Map();
  for (const c of context.constraints) {
    const list = constraintsByDate.get(c.date) || new Set();
    list.add(c.user_id);
    constraintsByDate.set(c.date, list);
  }

  const fixedByWeekday = new Map(); // user_id: Set(weekday)
  for (const fc of context.fixedConstraints) {
    const key = fc.user_id;
    const set = fixedByWeekday.get(key) || new Set();
    set.add(fc.weekday);
    fixedByWeekday.set(key, set);
  }

  const vacations = context.vacations || [];

  const noAuto = new Set(context.coordinatorRules.filter(r => r.rule_type === 'no_auto_scheduling' && r.is_active).map(r => r.guide1_id));
  const manualOnly = new Set(context.coordinatorRules.filter(r => r.rule_type === 'manual_only' && r.is_active).map(r => r.guide1_id));
  const noWeekends = new Set(context.coordinatorRules.filter(r => r.rule_type === 'no_weekends' && r.is_active).map(r => r.guide1_id));
  const noConan = new Set(context.coordinatorRules.filter(r => r.rule_type === 'no_conan' && r.is_active).map(r => r.guide1_id));

  const noTogetherPairs = new Set(
    context.coordinatorRules
      .filter(r => r.rule_type === 'no_together' && r.is_active)
      .map(r => `${r.guide1_id}:${r.guide2_id}`)
  );
  const preventPairPairs = new Set(
    context.coordinatorRules
      .filter(r => r.rule_type === 'prevent_pair' && r.is_active)
      .map(r => `${r.guide1_id}:${r.guide2_id}`)
  );

  function violatesPair(g1, g2) {
    if (!g1 || !g2) return false;
    const a = `${g1}:${g2}`;
    const b = `${g2}:${g1}`;
    return noTogetherPairs.has(a) || noTogetherPairs.has(b) || preventPairPairs.has(a) || preventPairPairs.has(b);
  }

  // Track last shift per guide to enforce no back-to-back
  const lastShiftByGuide = new Map(); // guideId -> 'YYYY-MM-DD'
  // For closed Fri->Sat exception we will check Friday conan continuity
  const assignmentByDate = new Map();

  // Build union of dates from AI proposal and existing manual assignments
  const proposalByDate = new Map((proposal || []).map(d => [d.date, d]));
  const dateSet = new Set(Array.from(proposalByDate.keys()));
  for (const d of manualByDate.keys()) dateSet.add(d);
  const sorted = Array.from(dateSet).sort((a, b) => a.localeCompare(b)).map(date => {
    return proposalByDate.get(date) || { date, assignments: [], explanation_he: '' };
  });

  for (const day of sorted) {
    const dateStr = day.date;
    const dow = toDate(dateStr).getDay();
    const isFriday = dow === 5;
    const isSaturday = dow === 6;
    const fridayStr = isSaturday ? addDays(dateStr, -1) : dateStr;
    const isClosedFriday = !!context.weekendTypes[fridayStr];

    const dayConstraints = constraintsByDate.get(dateStr) || new Set();

    // If manual assignment exists for this date, preserve it EXACTLY and skip AI validation
    const manual = manualByDate.get(dateStr);
    if (manual && manual.length > 0) {
      const manualDay = { 
        date: dateStr, 
        assignments: manual.map(a => ({
          guide_id: a.guide_id,
          role: a.role || 'רגיל'
        })), 
        explanation_he: day.explanation_he || 'שיבוץ ידני נשמר ללא שינוי', 
        is_manual: true,
        is_imported: true
      };
      sanitized.push(manualDay);
      assignmentByDate.set(dateStr, manualDay);
      // Update lastShiftByGuide so following days respect no-consecutive rule
      for (const a of manual) lastShiftByGuide.set(a.guide_id, dateStr);
      warnings.push({ date: dateStr, type: 'manual_preserved', message: 'שיבוץ ידני נשמר' });
      continue;
    }

    const kept = [];
    const roles = [];

    for (const a of (day.assignments || [])) {
      const gid = a.guide_id;
      const role = a.role || 'רגיל';

      // Guide existence
      if (!guideSet.has(gid)) {
        warnings.push({ date: dateStr, type: 'unknown_guide', guide_id: gid });
        continue;
      }

      // Hard constraints
      if (dayConstraints.has(gid)) {
        warnings.push({ date: dateStr, type: 'personal_constraint', guide_id: gid });
        continue;
      }

      const hasFixed = fixedByWeekday.get(gid) && fixedByWeekday.get(gid).has(dow);
      if (hasFixed) {
        warnings.push({ date: dateStr, type: 'fixed_constraint', guide_id: gid });
        continue;
      }

      const inVacation = vacations.some(v => gid === v.user_id && dateStr >= v.date_start && dateStr <= v.date_end);
      if (inVacation) {
        warnings.push({ date: dateStr, type: 'vacation', guide_id: gid });
        continue;
      }

      // Coordinator rules
      if (noAuto.has(gid)) { warnings.push({ date: dateStr, type: 'no_auto', guide_id: gid }); continue; }
      if (manualOnly.has(gid)) { warnings.push({ date: dateStr, type: 'manual_only', guide_id: gid }); continue; }
      if ((isFriday || isSaturday) && noWeekends.has(gid)) { warnings.push({ date: dateStr, type: 'no_weekends', guide_id: gid }); continue; }
      if (role === 'כונן' && noConan.has(gid)) { warnings.push({ date: dateStr, type: 'no_conan', guide_id: gid }); continue; }

      // No back-to-back days except closed Fri->Sat continuity for כונן
      const prevDate = addDays(dateStr, -1);
      const last = lastShiftByGuide.get(gid);
      const allowClosedSatContinuation = isSaturday && isClosedFriday;
      if (last === prevDate && !allowClosedSatContinuation) {
        console.log(`🚫 VALIDATOR: Blocking consecutive day assignment for guide ${gid} on ${dateStr} (last worked: ${last})`);
        warnings.push({ date: dateStr, type: 'consecutive_day', guide_id: gid });
        continue;
      }

      // Pairing conflicts (if second guide conflicts with first)
      if (kept.length === 1 && violatesPair(kept[0].guide_id, gid)) {
        warnings.push({ date: dateStr, type: 'pair_conflict', guide1_id: kept[0].guide_id, guide2_id: gid });
        continue;
      }

      kept.push({ guide_id: gid, role });
      roles.push(role);

      if (kept.length >= 2) break; // keep at most two assignments per day
    }

    // Closed weekend adjustments (best-effort):
    if (isFriday && isClosedFriday) {
      // Keep only כונן on Friday
      const standby = kept.find(x => x.role === 'כונן') || kept[0];
      const newKept = standby ? [{ guide_id: standby.guide_id, role: 'כונן' }] : [];
      if (kept.length !== newKept.length) warnings.push({ date: dateStr, type: 'closed_weekend_friday_trim' });
      kept.length = 0; kept.push(...newKept);
    }

    // Record day with proper flags - distinguish clean proposals from enhancement mode
    const isEnhancementMode = context.existingSchedule && Array.isArray(context.existingSchedule);
    const existingDay = isEnhancementMode ? context.existingSchedule.find(d => d.date === dateStr) : null;
    
    const sanitizedDay = { 
      date: dateStr, 
      assignments: kept, 
      explanation_he: day.explanation_he || '', 
      is_manual: false,
      is_enhanced: isEnhancementMode && existingDay && existingDay.assignments && existingDay.assignments.length > 0, // Only true if enhancing existing data
      is_gap_filled: false // Will be set to true only for emergency gap-filling below
    };
    sanitized.push(sanitizedDay);
    assignmentByDate.set(dateStr, sanitizedDay);

    // Update lastShiftByGuide
    for (const a of kept) {
      lastShiftByGuide.set(a.guide_id, dateStr);
    }
  }

  // Second pass: closed Saturday continuity check
  for (const day of sanitized) {
    const dateStr = day.date;
    const dow = toDate(dateStr).getDay();
    if (dow !== 6) continue;
    const fridayStr = addDays(dateStr, -1);
    const isClosedFriday = !!context.weekendTypes[fridayStr];
    if (!isClosedFriday) continue;
    const fri = assignmentByDate.get(fridayStr);
    if (!fri || !fri.assignments || fri.assignments.length === 0) continue;
    const friConan = fri.assignments.find(a => a.role === 'כונן') || fri.assignments[0];
    if (!day.assignments.some(a => a.guide_id === friConan.guide_id && a.role === 'כונן')) {
      // Enforce continuity by injecting/adjusting כונן if possible
      if (day.assignments.length === 0) {
        day.assignments.push({ guide_id: friConan.guide_id, role: 'כונן' });
        warnings.push({ date: dateStr, type: 'closed_sat_added_conan', guide_id: friConan.guide_id });
      } else {
        // Replace first assignment to ensure continuity
        day.assignments[0] = { guide_id: friConan.guide_id, role: 'כונן' };
        warnings.push({ date: dateStr, type: 'closed_sat_replaced_conan', guide_id: friConan.guide_id });
      }
    }
  }

  // COMPLETION CHECK: Ensure all days in month are covered
  const proposalDates = new Set(sanitized.map(d => d.date));
  const missingDates = allDatesInMonth.filter(date => !proposalDates.has(date));
  
  // Add gap-filling for missing dates (basic fallback assignments)
  for (const missingDate of missingDates) {
    const dow = toDate(missingDate).getDay();
    const dayConstraints = constraintsByDate.get(missingDate) || new Set();
    
    // Find available guides for this date (simple heuristic)
    const availableGuides = context.guides.filter(guide => {
      // Check basic constraints
      if (dayConstraints.has(guide.id)) return false;
      if (fixedByWeekday.get(guide.id) && fixedByWeekday.get(guide.id).has(dow)) return false;
      
      // Check vacation
      const inVacation = vacations.some(v => 
        guide.id === v.user_id && missingDate >= v.date_start && missingDate <= v.date_end
      );
      if (inVacation) return false;
      
      // Check coordinator rules
      if (noAuto.has(guide.id) || manualOnly.has(guide.id)) return false;
      if ((dow === 5 || dow === 6) && noWeekends.has(guide.id)) return false;
      
      return true;
    });
    
    if (availableGuides.length > 0) {
      // Simple assignment: pick first available guide
      const guide = availableGuides[0];
      const role = (dow === 5 || dow === 6) ? 'כונן' : 'רגיל'; // Basic role assignment
      
      const gapDay = {
        date: missingDate,
        assignments: [{ guide_id: guide.id, role }],
        explanation_he: `שיבוץ חירום למילוי חוסר - ${guide.name}`,
        is_manual: false,
        is_enhanced: false,
        is_gap_filled: true
      };
      
      sanitized.push(gapDay);
      assignmentByDate.set(missingDate, gapDay);
      warnings.push({ date: missingDate, type: 'gap_filled_emergency', guide_id: guide.id });
    } else {
      // No available guides - critical gap
      warnings.push({ date: missingDate, type: 'critical_gap_unfilled', severity: 'critical' });
    }
  }
  
  // Sort sanitized by date for proper order
  sanitized.sort((a, b) => a.date.localeCompare(b.date));
  
  // COMPLETION STATUS
  const completionStatus = {
    totalDays: daysInMonth,
    coveredDays: sanitized.length,
    missingDays: missingDates.length,
    gapsFilled: sanitized.filter(d => d.is_gap_filled).length,
    criticalGaps: warnings.filter(w => w.type === 'critical_gap_unfilled').length,
    isComplete: missingDates.length === 0 || sanitized.length === daysInMonth
  };
  
  const stats = {
    days: sanitized.length,
    total_assignments: sanitized.reduce((acc, d) => acc + (d.assignments ? d.assignments.length : 0), 0),
    warnings: warnings.length,
    completion: completionStatus
  };

  console.log('✅ VALIDATOR: Completed validation. Sanitized:', sanitized.length, 'days. Warnings:', warnings.length);
  console.log('🚫 VALIDATOR: Warning types:', warnings.map(w => w.type).join(', '));
  
  return { proposal: sanitized, warnings, stats, completionStatus };
}

module.exports = { validateMonthlyProposal };


