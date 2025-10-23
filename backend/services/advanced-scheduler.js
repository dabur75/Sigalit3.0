/**
 * Advanced Auto-Scheduler for Sigalit
 * State-of-the-art scheduling engine with month-wide perspective and fair distribution
 * 
 * Based on SCHEDULING_BIBLE.md requirements
 */

const { pool } = require('../database/postgresql');
const { buildMonthContext } = require('./context-builder');

class AdvancedScheduler {
  constructor() {
    this.constraints = null;
    this.guides = null;
    this.weekendTypes = null;
    this.manualAssignments = null;
    this.monthDays = null;
  }

  /**
   * Main entry point for advanced scheduling
   * @param {number} year 
   * @param {number} month 
   * @param {boolean} overwrite - Whether to overwrite existing auto assignments
   * @returns {Object} Complete schedule with explanations
   */
  async generateAdvancedSchedule(year, month, overwrite = false) {
    console.log(`🧠 Starting advanced scheduling for ${year}-${month}`);
    
    try {
      // Phase 1: Load all necessary data
      await this.loadSchedulingData(year, month);
      
      // Phase 2: Monthly analysis and target setting
      const monthlyPlan = this.analyzeMonthAndSetTargets(year, month);
      
      // Phase 3: Generate optimal assignments
      const schedule = await this.generateOptimalSchedule(year, month, monthlyPlan, overwrite);
      
      // Phase 4: Validate and optimize
      const validatedSchedule = this.validateAndOptimize(schedule, monthlyPlan);
      
      // Phase 5: Generate Hebrew explanations
      const scheduleWithExplanations = this.generateHebrewExplanations(validatedSchedule, monthlyPlan);
      
      return {
        success: true,
        schedule: scheduleWithExplanations,
        monthly_plan: monthlyPlan,
        statistics: this.generateScheduleStatistics(scheduleWithExplanations),
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Advanced scheduling failed:', error);
      return {
        success: false,
        error: error.message,
        generated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Load all data required for scheduling
   */
  async loadSchedulingData(year, month) {
    console.log('📊 Loading scheduling data...');
    
    // Load active guides
    const guidesResult = await pool.query(`
      SELECT * FROM users 
      WHERE role = 'מדריך' AND is_active = true
      ORDER BY name
    `);
    this.guides = guidesResult.rows;

    // Load constraints
    await this.loadConstraints(year, month);
    
    // Load weekend types
    await this.loadWeekendTypes(year, month);
    
    // Load existing manual assignments
    await this.loadManualAssignments(year, month);
    
    // Generate month day structure
    this.generateMonthDayStructure(year, month);
    
    console.log(`✅ Loaded: ${this.guides.length} guides, ${this.constraints.personal.length} personal constraints, ${this.manualAssignments.length} manual assignments`);
  }

  /**
   * Load all types of constraints using the existing context builder
   */
  async loadConstraints(year, month) {
    // Use the existing context builder which handles all database queries correctly
    const context = await buildMonthContext({ 
      house_id: 'dror', // Default house - could be parameterized later
      year: parseInt(year), 
      month: parseInt(month) 
    });

    // Map context data to our expected format
    this.constraints = {
      personal: context.constraints || [],
      fixed: context.fixedConstraints || [],
      vacations: context.vacations || [],
      coordinator: context.coordinatorRules || []
    };

    // Load weekend types from context
    this.weekendTypes = context.weekendTypes || {};

    // Load manual assignments from context
    this.manualAssignments = context.manualAssignments || [];

    console.log(`📋 Loaded constraints: ${this.constraints.personal.length} personal, ${this.constraints.fixed.length} fixed, ${this.constraints.vacations.length} vacations, ${this.constraints.coordinator.length} coordinator rules`);
    console.log(`📅 Loaded ${Object.keys(this.weekendTypes).length} weekend type settings`);
    console.log(`📅 Weekend types data:`, this.weekendTypes);
    console.log(`📝 Loaded ${this.manualAssignments.length} manual assignments`);
  }

  /**
   * Load weekend types for the month - use context builder data
   */
  async loadWeekendTypes(year, month) {
    // Weekend types are already loaded in loadConstraints via context builder
    // The context builder returns weekendTypes as part of the context
    // We'll load them there instead of here
    console.log('📅 Weekend types will be loaded with constraints');
  }

  /**
   * Load existing manual assignments that must be preserved - use context data
   */
  async loadManualAssignments(year, month) {
    // Manual assignments were already loaded in loadConstraints via context builder
    console.log(`📝 Manual assignments loaded from context: ${this.manualAssignments.length} assignments`);
  }

  /**
   * Generate structure of all days in the month
   */
  generateMonthDayStructure(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    this.monthDays = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = date.getDay();
      
      // Weekend type is determined by Friday flag according to SCHEDULING_BIBLE
      let weekendType = null;
      if (dayOfWeek === 5) { // Friday
        weekendType = this.weekendTypes[dateStr]; // true = closed, false = open
      } else if (dayOfWeek === 6) { // Saturday
        // For Saturday, use the Friday setting from the previous day
        const fridayDate = new Date(year, month - 1, day - 1);
        const fridayDateStr = `${fridayDate.getFullYear()}-${String(fridayDate.getMonth() + 1).padStart(2, '0')}-${String(fridayDate.getDate()).padStart(2, '0')}`;
        weekendType = this.weekendTypes[fridayDateStr];
      } else {
        weekendType = null; // Not a weekend day
      }
      
      this.monthDays.push({
        date: dateStr,
        dayOfWeek: dayOfWeek,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Friday or Saturday
        isFriday: dayOfWeek === 5,
        isSaturday: dayOfWeek === 6,
        weekendType: weekendType, // true = closed, false = open, null = not weekend
        dayName: this.getDayName(dayOfWeek)
      });
      
      // Debug weekend type assignment
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        console.log(`📅 Weekend day ${dateStr} (${this.getDayName(dayOfWeek)}): weekendType = ${weekendType}`);
      }
    }
  }

  /**
   * Get Hebrew day name
   */
  getDayName(dayOfWeek) {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayOfWeek];
  }

  /**
   * Analyze entire month and set fair distribution targets
   */
  analyzeMonthAndSetTargets(year, month) {
    console.log('🎯 Analyzing month and setting targets...');
    
    const plan = {
      totalDays: this.monthDays.length,
      totalSlots: 0,
      weeklyDistribution: this.analyzeWeeklyDistribution(),
      guideTargets: {},
      constraintBottlenecks: this.identifyConstraintBottlenecks(),
      weekendBalance: this.analyzeWeekendBalance()
    };

    // Calculate total scheduling slots needed
    this.monthDays.forEach(day => {
      if (day.isWeekend && day.weekendType === true) {
        // Closed weekend: 1 slot Friday (כונן), 1 slot Saturday (same כונן)
        if (day.isFriday) plan.totalSlots += 1;
        // Saturday uses same guide, so no additional slot
      } else {
        // Regular day or open weekend: 2 slots
        plan.totalSlots += 2;
      }
    });

    // Calculate targets per guide (excluding manual_only guides)
    const eligibleGuides = this.getEligibleGuides();
    const slotsPerGuide = Math.floor(plan.totalSlots / eligibleGuides.length);
    const remainderSlots = plan.totalSlots % eligibleGuides.length;
    
    eligibleGuides.forEach((guide, index) => {
      plan.guideTargets[guide.id] = {
        name: guide.name,
        targetShifts: slotsPerGuide + (index < remainderSlots ? 1 : 0),
        targetSalaryFactor: 0, // Will be calculated based on shift types
        currentShifts: 0,
        currentSalaryFactor: 0,
        weeklyDistribution: [0, 0, 0, 0, 0] // Assuming max 5 weeks in month
      };
    });

    console.log(`✅ Monthly analysis complete: ${plan.totalSlots} slots for ${eligibleGuides.length} guides`);
    return plan;
  }

  /**
   * Get guides eligible for auto-scheduling (not manual_only)
   */
  getEligibleGuides() {
    return this.guides.filter(guide => {
      const manualOnlyRule = this.constraints.coordinator.find(
        rule => rule.user_id === guide.id && 
               (rule.rule_type === 'no_auto_scheduling' || rule.rule_type === 'manual_only')
      );
      return !manualOnlyRule;
    });
  }

  /**
   * Analyze weekly distribution needs
   */
  analyzeWeeklyDistribution() {
    const weeks = [];
    let currentWeek = [];
    
    this.monthDays.forEach((day, index) => {
      currentWeek.push(day);
      
      // End week on Saturday or last day of month
      if (day.isSaturday || index === this.monthDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return weeks.map((week, weekIndex) => ({
      weekNumber: weekIndex + 1,
      days: week,
      totalSlots: week.reduce((sum, day) => {
        if (day.isWeekend && day.weekendType === true) {
          return sum + (day.isFriday ? 1 : 0); // Closed weekend
        }
        return sum + 2; // Regular day or open weekend
      }, 0)
    }));
  }

  /**
   * Identify days with limited guide availability
   */
  identifyConstraintBottlenecks() {
    const bottlenecks = [];
    
    this.monthDays.forEach(day => {
      const availableGuides = this.getAvailableGuides(day.date, day.dayOfWeek);
      
      if (availableGuides.length < 3) { // Potential bottleneck
        bottlenecks.push({
          date: day.date,
          dayName: day.dayName,
          availableGuides: availableGuides.length,
          guideNames: availableGuides.map(g => g.name)
        });
      }
    });
    
    return bottlenecks;
  }

  /**
   * Get guides available for a specific date
   */
  getAvailableGuides(date, dayOfWeek) {
    
    return this.guides.filter(guide => {
      // Check personal constraints (fix date comparison: handle timezone properly)
      const personalConstraint = this.constraints.personal.find(
        c => c.user_id === guide.id && this.normalizeConstraintDate(c.date) === date
      );
      if (personalConstraint) return false;

      // Check fixed constraints
      const fixedConstraint = this.constraints.fixed.find(
        c => c.user_id === guide.id && c.weekday === dayOfWeek
      );
      if (fixedConstraint) return false;

      // Check vacations (fix date comparison: handle timezone properly)
      const onVacation = this.constraints.vacations.some(
        v => v.user_id === guide.id && 
        date >= this.normalizeConstraintDate(v.start_date) && 
        date <= this.normalizeConstraintDate(v.end_date)
      );
      if (onVacation) return false;

      // Check coordinator rules for auto-scheduling restrictions
      const noAutoSchedulingRule = this.constraints.coordinator.find(
        rule => rule.guide1_id === guide.id && 
               (rule.rule_type === 'no_auto_scheduling' || rule.rule_type === 'manual_only')
      );
      if (noAutoSchedulingRule) {
        console.log(`🚫 COORDINATOR FILTER: Guide ${guide.id}:${guide.name} excluded due to ${noAutoSchedulingRule.rule_type} rule`);
        return false;
      }

      // Check weekend restrictions
      if ((dayOfWeek === 5 || dayOfWeek === 6)) { // Friday or Saturday
        const noWeekendsRule = this.constraints.coordinator.find(
          rule => rule.guide1_id === guide.id && rule.rule_type === 'no_weekends'
        );
        if (noWeekendsRule) return false;
      }

      return true;
    });
  }

  /**
   * Analyze weekend assignment balance
   */
  analyzeWeekendBalance() {
    const weekends = this.monthDays.filter(day => day.isWeekend);
    const openWeekends = weekends.filter(day => day.weekendType === false).length / 2; // Friday + Saturday pairs
    const closedWeekends = weekends.filter(day => day.isFriday && day.weekendType === true).length;
    
    return {
      totalWeekends: openWeekends + closedWeekends,
      openWeekends,
      closedWeekends,
      weekendSlotsNeeded: (openWeekends * 4) + (closedWeekends * 2) // Open: 2 per day, Closed: 1 כונן for both days
    };
  }

  /**
   * Generate optimal schedule assignments
   */
  async generateOptimalSchedule(year, month, monthlyPlan, overwrite) {
    console.log('🔧 Generating optimal schedule...');
    
    const schedule = [];
    
    // First, preserve all manual assignments
    this.manualAssignments.forEach(manual => {
      schedule.push({
        date: manual.date,
        guide1_id: manual.guide1_id,
        guide1_role: manual.guide1_role,
        guide2_id: manual.guide2_id,
        guide2_role: manual.guide2_role,
        is_manual: true,
        explanation: 'שיבוץ ידני נשמר כפי שהוזן'
      });
      
      // Update targets based on manual assignments
      if (manual.guide1_id && monthlyPlan.guideTargets[manual.guide1_id]) {
        monthlyPlan.guideTargets[manual.guide1_id].currentShifts++;
      }
      if (manual.guide2_id && monthlyPlan.guideTargets[manual.guide2_id]) {
        monthlyPlan.guideTargets[manual.guide2_id].currentShifts++;
      }
    });

    // Process each day that needs auto-assignment
    for (const day of this.monthDays) {
      const existingManual = this.manualAssignments.find(m => m.date === day.date);
      if (existingManual) {
        continue; // Skip manually assigned days
      }

      // Check if there's an existing auto assignment we might overwrite
      if (!overwrite) {
        const existingAuto = await this.checkExistingAutoAssignment(day.date);
        if (existingAuto) {
          schedule.push(existingAuto);
          continue;
        }
      }

      // Generate new assignment for this day
      const dayAssignment = this.generateDayAssignment(day, monthlyPlan, schedule);
      schedule.push(dayAssignment);
      
      // Update running targets
      this.updateRunningTargets(dayAssignment, monthlyPlan);
    }

    return schedule;
  }

  /**
   * Check if day already has auto assignment
   */
  async checkExistingAutoAssignment(date) {
    const result = await pool.query(`
      SELECT date, guide1_id, guide1_role, guide2_id, guide2_role, is_manual
      FROM schedule 
      WHERE date = $1 AND is_manual = false
    `, [date]);
    
    if (result.rows.length > 0) {
      const existing = result.rows[0];
      return {
        date: existing.date,
        guide1_id: existing.guide1_id,
        guide1_role: existing.guide1_role,
        guide2_id: existing.guide2_id,
        guide2_role: existing.guide2_role,
        is_manual: false,
        explanation: 'שיבוץ אוטומטי קיים נשמר'
      };
    }
    
    return null;
  }

  /**
   * Generate assignment for a single day
   */
  generateDayAssignment(day, monthlyPlan, existingSchedule) {
    console.log(`🗓️ Assigning ${day.date} (${day.dayName}) - isWeekend: ${day.isWeekend}, weekendType: ${day.weekendType}`);
    
    // Handle different day types
    if (day.isWeekend && day.weekendType === true) {
      console.log(`📅 Processing as CLOSED weekend: ${day.date}`);
      return this.generateClosedWeekendAssignment(day, monthlyPlan, existingSchedule);
    } else {
      console.log(`📅 Processing as REGULAR day: ${day.date}`);
      return this.generateRegularDayAssignment(day, monthlyPlan, existingSchedule);
    }
  }

  /**
   * Generate assignment for closed weekend (כונן only)
   */
  generateClosedWeekendAssignment(day, monthlyPlan, existingSchedule) {
    // Handle Friday and Saturday differently for closed weekends
    if (day.isFriday) {
      return this.handleClosedWeekendFriday(day, monthlyPlan, existingSchedule);
    } else if (day.isSaturday) {
      return this.handleClosedWeekendSaturday(day, monthlyPlan, existingSchedule);
    } else {
      console.log(`⚠️ Unexpected: generateClosedWeekendAssignment called for non-weekend day: ${day.date}`);
      return this.generateRegularDayAssignment(day, monthlyPlan, existingSchedule);
    }
  }

  /**
   * Handle closed weekend Friday - assign כונן only
   */
  handleClosedWeekendFriday(day, monthlyPlan, existingSchedule) {
    console.log(`📅 Handling closed weekend Friday: ${day.date}`);
    
    // Get available guides for כונן role
    const availableGuides = this.getAvailableGuidesForRole(day.date, day.dayOfWeek, 'כונן');
    const fridayConanGuide = this.selectBestGuideForRole(availableGuides, 'כונן', monthlyPlan, day, existingSchedule);
    
    if (fridayConanGuide) {
      console.log(`✅ Assigning Friday כונן: ${fridayConanGuide.name}`);
      return {
        date: day.date,
        guide1_id: fridayConanGuide.id,
        guide1_role: 'כונן',
        guide2_id: null,
        guide2_role: null,
        is_manual: false,
        explanation: `${fridayConanGuide.name} - כונן לסופ״ש סגור (יום שישי)`
      };
    } else {
      console.log(`❌ No guide available for Friday כונן`);
      return {
        date: day.date,
        guide1_id: null,
        guide1_role: null,
        guide2_id: null,
        guide2_role: null,
        is_manual: false,
        explanation: 'לא נמצא מדריך זמין לכונן יום שישי'
      };
    }
  }

  /**
   * Handle closed weekend Saturday by ensuring Friday-Saturday continuity
   */
  handleClosedWeekendSaturday(day, monthlyPlan, existingSchedule) {
    const fridayDate = this.getPreviousDay(day.date);
    console.log(`📅 Handling closed weekend Saturday: ${day.date}, looking for Friday ${fridayDate}`);
    
    // Find Friday assignment in existing schedule
    const fridayAssignment = existingSchedule.find(a => a.date === fridayDate);
    
    if (fridayAssignment && fridayAssignment.guide1_role === 'כונן' && fridayAssignment.guide1_id) {
      // Friday has כונן - continue with same guide + add מוצ״ש guide
      const fridayConanGuide = this.guides.find(g => g.id === fridayAssignment.guide1_id);
      console.log(`✅ Continuing Saturday with Friday כונן: ${fridayConanGuide?.name}`);
      
      // Select מוצ״ש guide for Saturday (excluding the כונן guide)
      
      const allAvailableForMotzash = this.getAvailableGuidesForRole(day.date, day.dayOfWeek, 'מוצ״ש');
      console.log(`📋 All available guides for מוצ״ש on ${day.date}: ${allAvailableForMotzash.length} guides`);
      console.log(`📋 All available מוצ״ש guides: ${allAvailableForMotzash.map(g => `${g.id}:${g.name}`).join(', ')}`);
      
      const availableGuidesForMotzash = allAvailableForMotzash
        .filter(guide => guide.id !== fridayAssignment.guide1_id); // Exclude the כונן guide
      console.log(`📋 Available guides for מוצ״ש (excluding כונן ${fridayAssignment.guide1_id}): ${availableGuidesForMotzash.length} guides`);
      console.log(`📋 Available מוצ״ש guides (filtered): ${availableGuidesForMotzash.map(g => `${g.id}:${g.name}`).join(', ')}`);
      
      // FORCE: Always assign first available guide
      const motzashGuide = availableGuidesForMotzash.length > 0 ? availableGuidesForMotzash[0] : null;
      console.log(`🎯 Selected מוצ״ש guide (FORCED): ${motzashGuide ? `${motzashGuide.id}:${motzashGuide.name}` : 'NULL - NO GUIDES AVAILABLE'}`);
      
      if (motzashGuide) {
        const assignmentObject = {
          date: day.date,
          guide1_id: fridayAssignment.guide1_id,
          guide1_role: 'כונן',
          guide2_id: motzashGuide.id,
          guide2_role: 'מוצ״ש',
          is_manual: false,
          explanation: `${fridayConanGuide?.name} - המשך כונן מיום שישי + ${motzashGuide.name} - מוצ״ש לסופ״ש סגור`
        };
        console.log(`✅ Adding מוצ״ש guide for Saturday: ${motzashGuide.name}`);
        return assignmentObject;
      } else {
        console.log(`⚠️ No מוצ״ש guide available for Saturday ${day.date}`);
        console.log(`🔧 FALLBACK: Forcing first available guide as מוצ״ש for debugging`);
        
        // DEBUG: Force assign first available guide as מוצ״ש if selection failed
        if (availableGuidesForMotzash.length > 0) {
          const fallbackGuide = availableGuidesForMotzash[0];
          console.log(`🆘 Using fallback מוצ״ש guide: ${fallbackGuide.name}`);
          return {
            date: day.date,
            guide1_id: fridayAssignment.guide1_id,
            guide1_role: 'כונן',
            guide2_id: fallbackGuide.id,
            guide2_role: 'מוצ״ש',
            is_manual: false,
            explanation: `${fridayConanGuide?.name} - המשך כונן מיום שישי + ${fallbackGuide.name} - מוצ״ש לסופ״ש סגור (fallback)`
          };
        }
        
        return {
          date: day.date,
          guide1_id: fridayAssignment.guide1_id,
          guide1_role: 'כונן',
          guide2_id: null,
          guide2_role: null,
          is_manual: false,
          explanation: `${fridayConanGuide?.name} - המשך כונן מיום שישי (לא נמצא מדריך זמין למוצ״ש)`
        };
      }
    } else {
      // No Friday כונן found - this shouldn't happen in proper flow
      console.log(`⚠️ No Friday כונן found for Saturday ${day.date}. Trying to assign Saturday כונן independently.`);
      
      const availableGuides = this.getAvailableGuidesForRole(day.date, day.dayOfWeek, 'כונן');
      const saturdayConanGuide = this.selectBestGuideForRole(availableGuides, 'כונן', monthlyPlan, day, existingSchedule);
      
      if (saturdayConanGuide) {
        return {
          date: day.date,
          guide1_id: saturdayConanGuide.id,
          guide1_role: 'כונן',
          guide2_id: null,
          guide2_role: null,
          is_manual: false,
          explanation: `${saturdayConanGuide.name} - כונן שבת (ללא רצף מיום שישי)`
        };
      } else {
        return {
          date: day.date,
          guide1_id: null,
          guide1_role: null,
          guide2_id: null,
          guide2_role: null,
          is_manual: false,
          explanation: 'לא נמצא מדריך זמין לכונן שבת'
        };
      }
    }
  }

  /**
   * Generate assignment for regular day or open weekend
   */
  generateRegularDayAssignment(day, monthlyPlan, existingSchedule) {
    const assignments = [];
    
    // Determine roles needed
    let roles = ['רגיל', 'חפיפה'];
    if (day.isWeekend && day.weekendType === false) {
      roles = ['רגיל', 'רגיל']; // Open weekend gets 2 regular guides
    }
    
    // Assign first guide
    const availableGuides1 = this.getAvailableGuidesForRole(day.date, day.dayOfWeek, roles[0]);
    const guide1 = this.selectBestGuideForRole(availableGuides1, roles[0], monthlyPlan, day, existingSchedule);
    
    // Assign second guide (excluding first guide and checking pairing rules)
    const availableGuides2 = this.getAvailableGuidesForRole(day.date, day.dayOfWeek, roles[1])
      .filter(g => g.id !== guide1.id && this.canGuidesWorkTogether(guide1, g));
    const guide2 = this.selectBestGuideForRole(availableGuides2, roles[1], monthlyPlan, day, existingSchedule);
    
    return {
      date: day.date,
      guide1_id: guide1 ? guide1.id : null,
      guide1_role: roles[0],
      guide2_id: guide2 ? guide2.id : null,
      guide2_role: roles[1],
      is_manual: false,
      explanation: this.generatePairExplanation(guide1, guide2, roles, day, monthlyPlan)
    };
  }

  /**
   * Get guides available for specific role
   */
  getAvailableGuidesForRole(date, dayOfWeek, role) {
    let availableGuides = this.getAvailableGuides(date, dayOfWeek);
    
    // Apply role-specific restrictions
    if (role === 'כונן') {
      // Filter out guides who can't do כונן
      availableGuides = availableGuides.filter(guide => {
        const noConanRule = this.constraints.coordinator.find(
          rule => rule.guide1_id === guide.id && rule.rule_type === 'no_conan'
        );
        return !noConanRule;
      });
    } else if (role === 'מוצ״ש') {
      // מוצ״ש guides have no special restrictions - same as regular guides
      // No additional filtering needed
    }
    
    return availableGuides;
  }

  /**
   * Select best guide for role based on fairness and balancing
   */
  selectBestGuideForRole(availableGuides, role, monthlyPlan, day, existingSchedule = []) {
    if (availableGuides.length === 0) return null;
    
    
    // Score each guide
    const scoredGuides = availableGuides.map(guide => {
      const target = monthlyPlan.guideTargets[guide.id];
      let score = 0;
      
      // Fairness score (prefer guides with fewer shifts)
      const shiftDeficit = target ? (target.targetShifts - target.currentShifts) : 0;
      score += shiftDeficit * 100; // High weight for fairness
      
      // Weekly balance score (prefer guides with fewer shifts this week)
      const weekShifts = this.getGuideShiftsThisWeek(guide.id, day.date);
      score += Math.max(0, 3 - weekShifts) * 50; // Prefer guides with <3 shifts this week
      
      // Consecutive day penalty
      const workedPrevDay = this.workedPreviousDay(guide.id, day.date, existingSchedule);
      if (workedPrevDay) {
        score -= 1000; // Heavy penalty for consecutive days
        
      }
      
      // Role suitability bonus
      if (this.isGuideGoodForRole(guide, role)) {
        score += 25;
      }
      
      return {
        guide: guide,
        score: score
      };
    });
    
    // Sort by score (highest first) and return best guide
    scoredGuides.sort((a, b) => b.score - a.score);
    
    
    return scoredGuides[0].guide;
  }

  /**
   * Check if guides can work together (pairing rules)
   */
  canGuidesWorkTogether(guide1, guide2) {
    if (!guide1 || !guide2) return true;
    
    // Check no_together rule
    const noTogetherRule = this.constraints.coordinator.find(
      rule => rule.rule_type === 'no_together' && 
             ((rule.user_id === guide1.id && rule.target_user_id === guide2.id) ||
              (rule.user_id === guide2.id && rule.target_user_id === guide1.id))
    );
    
    if (noTogetherRule) return false;
    
    // Check prevent_pair rule (soft constraint, allowed but not preferred)
    return true;
  }

  /**
   * Check if guide worked previous day
   */
  workedPreviousDay(guideId, currentDate, scheduleBeingBuilt = []) {
    const previousDate = this.getPreviousDay(currentDate);
    
    // Check if guide worked previous day in schedule being built
    const previousDayAssignment = scheduleBeingBuilt.find(s => 
      s.date === previousDate && (s.guide1_id === guideId || s.guide2_id === guideId)
    );
    
    return !!previousDayAssignment;
  }

  /**
   * Normalize constraint date to handle timezone issues
   * PostgreSQL stores dates in UTC, but we need Israeli dates for comparison
   */
  normalizeConstraintDate(date) {
    // Handle both Date objects and strings
    if (typeof date === 'string') {
      // If it's already a string in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // Convert string to Date first
      date = new Date(date);
    }
    
    // Create a new date in Israeli timezone (UTC+3 or UTC+2 depending on DST)
    const israelDate = new Date(date.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours for Israeli time
    return israelDate.toISOString().split('T')[0];
  }

  /**
   * Get previous day
   */
  getPreviousDay(dateStr) {
    // Normalize date format first
    const normalizedDate = this.normalizeConstraintDate(dateStr);
    const [year, month, day] = normalizedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    const prevYear = date.getFullYear();
    const prevMonth = date.getMonth() + 1;
    const prevDay = date.getDate();
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
  }

  /**
   * Get guide's shifts count for current week
   */
  getGuideShiftsThisWeek(guideId, currentDate) {
    // Simplified implementation - would need to analyze current schedule
    return 0;
  }

  /**
   * Check if guide is suitable for role
   */
  isGuideGoodForRole(guide, role) {
    // Could check guide preferences, experience, etc.
    return true;
  }

  /**
   * Generate explanation for guide pair
   */
  generatePairExplanation(guide1, guide2, roles, day, monthlyPlan) {
    const explanations = [];
    
    if (guide1) {
      const reason = this.explainGuideSelection(guide1, monthlyPlan, roles[0]);
      explanations.push(`${guide1.name} (${roles[0]}) - ${reason}`);
    }
    
    if (guide2) {
      const reason = this.explainGuideSelection(guide2, monthlyPlan, roles[1]);
      explanations.push(`${guide2.name} (${roles[1]}) - ${reason}`);
    }
    
    return explanations.join('. ');
  }

  /**
   * Explain why guide was selected
   */
  explainGuideSelection(guide, monthlyPlan, role) {
    const target = monthlyPlan.guideTargets[guide.id];
    if (!target) return 'זמין לשיבוץ';
    
    const deficit = target.targetShifts - target.currentShifts;
    
    if (deficit > 2) return 'עומס נמוך - זקוק למשמרות נוספות';
    if (deficit > 0) return 'איזון עומס - מתחת למטרה החודשית';
    if (deficit === 0) return 'מטרה חודשית מאוזנת';
    return 'עומס מעט מעל הממוצע אך זמין';
  }

  /**
   * Update running targets after assignment
   */
  updateRunningTargets(assignment, monthlyPlan) {
    if (assignment.guide1_id && monthlyPlan.guideTargets[assignment.guide1_id]) {
      monthlyPlan.guideTargets[assignment.guide1_id].currentShifts++;
    }
    if (assignment.guide2_id && monthlyPlan.guideTargets[assignment.guide2_id]) {
      monthlyPlan.guideTargets[assignment.guide2_id].currentShifts++;
    }
  }

  /**
   * Validate schedule against all SCHEDULING_BIBLE rules
   */
  validateAndOptimize(schedule, monthlyPlan) {
    console.log('✅ Validating schedule against SCHEDULING_BIBLE rules...');
    
    const violations = [];
    
    // Validate each rule
    violations.push(...this.validateConsecutiveDays(schedule));
    violations.push(...this.validateConstraints(schedule));
    violations.push(...this.validateWeekendLogic(schedule));
    violations.push(...this.validateManualPreservation(schedule));
    violations.push(...this.validateCompleteCoverage(schedule));
    
    if (violations.length > 0) {
      console.warn('⚠️ Schedule violations found:', violations);
      // Could implement optimization here to fix violations
    }
    
    return schedule;
  }

  /**
   * Validate no consecutive days rule
   */
  validateConsecutiveDays(schedule) {
    const violations = [];
    
    for (let i = 1; i < schedule.length; i++) {
      const today = schedule[i];
      const yesterday = schedule[i - 1];
      
      if (this.isConsecutiveDay(yesterday.date, today.date)) {
        // Check if same guide works both days
        const commonGuides = this.findCommonGuides(yesterday, today);
        
        commonGuides.forEach(guideId => {
          // Allow Friday→Saturday closed weekend exception
          const fridayToSaturday = this.isFridayToSaturdayClosedWeekend(yesterday, today);
          
          if (!fridayToSaturday) {
            violations.push({
              type: 'consecutive_days',
              date: today.date,
              guideId: guideId,
              message: `מדריך ${guideId} עובד ימים עוקבים`
            });
          }
        });
      }
    }
    
    return violations;
  }

  /**
   * Check if dates are consecutive
   */
  isConsecutiveDay(date1, date2) {
    // Normalize dates to YYYY-MM-DD format (handle both strings and Date objects)
    const dateStr1 = this.normalizeConstraintDate(date1);
    const dateStr2 = this.normalizeConstraintDate(date2);
    
    const [year1, month1, day1] = dateStr1.split('-').map(Number);
    const [year2, month2, day2] = dateStr2.split('-').map(Number);
    const d1 = new Date(year1, month1 - 1, day1);
    const d2 = new Date(year2, month2 - 1, day2);
    return Math.abs(d2.getTime() - d1.getTime()) === 24 * 60 * 60 * 1000;
  }

  /**
   * Find guides working both days
   */
  findCommonGuides(day1, day2) {
    const guides1 = [day1.guide1_id, day1.guide2_id].filter(Boolean);
    const guides2 = [day2.guide1_id, day2.guide2_id].filter(Boolean);
    
    return guides1.filter(id => guides2.includes(id));
  }

  /**
   * Check if Friday→Saturday closed weekend exception applies
   */
  isFridayToSaturdayClosedWeekend(day1, day2) {
    // Normalize dates to YYYY-MM-DD format
    const dateStr1 = this.normalizeConstraintDate(day1.date);
    const dateStr2 = this.normalizeConstraintDate(day2.date);
    
    const [year1, month1, day1Num] = dateStr1.split('-').map(Number);
    const [year2, month2, day2Num] = dateStr2.split('-').map(Number);
    const date1 = new Date(year1, month1 - 1, day1Num);
    const date2 = new Date(year2, month2 - 1, day2Num);
    
    return date1.getDay() === 5 && // Friday
           date2.getDay() === 6 && // Saturday
           this.weekendTypes[dateStr1] === true && // Closed weekend
           day1.guide1_role === 'כונן' && // Friday כונן
           day2.guide1_role === 'כונן'; // Saturday כונן
  }

  /**
   * Validate constraints compliance
   */
  validateConstraints(schedule) {
    const violations = [];
    
    schedule.forEach(day => {
      [day.guide1_id, day.guide2_id].forEach(guideId => {
        if (!guideId) return;
        
        const date = this.normalizeConstraintDate(day.date);
        const [year, month, dayNum] = date.split('-').map(Number);
        const dayOfWeek = new Date(year, month - 1, dayNum).getDay();
        
        // Check personal constraints (fix date comparison: handle timezone properly)
        const personalViolation = this.constraints.personal.find(
          c => c.user_id === guideId && this.normalizeConstraintDate(c.date) === date
        );
        if (personalViolation) {
          violations.push({
            type: 'personal_constraint',
            date: date,
            guideId: guideId,
            message: `מדריך ${guideId} חסום באילוץ אישי`
          });
        }
        
        // Check fixed constraints
        const fixedViolation = this.constraints.fixed.find(
          c => c.user_id === guideId && c.weekday === dayOfWeek
        );
        if (fixedViolation) {
          violations.push({
            type: 'fixed_constraint',
            date: date,
            guideId: guideId,
            message: `מדריך ${guideId} חסום באילוץ קבוע`
          });
        }
        
        // Check vacation (fix date comparison: handle timezone properly)
        const vacationViolation = this.constraints.vacations.find(
          v => v.user_id === guideId && 
          date >= this.normalizeConstraintDate(v.start_date) && 
          date <= this.normalizeConstraintDate(v.end_date)
        );
        if (vacationViolation) {
          violations.push({
            type: 'vacation',
            date: date,
            guideId: guideId,
            message: `מדריך ${guideId} בחופשה`
          });
        }
      });
    });
    
    return violations;
  }

  /**
   * Validate weekend logic
   */
  validateWeekendLogic(schedule) {
    const violations = [];
    // Implementation would check closed weekend כונן continuity, etc.
    return violations;
  }

  /**
   * Validate manual assignments preserved
   */
  validateManualPreservation(schedule) {
    const violations = [];
    // Implementation would ensure all manual assignments are unchanged
    return violations;
  }

  /**
   * Validate complete coverage
   */
  validateCompleteCoverage(schedule) {
    const violations = [];
    
    this.monthDays.forEach(day => {
      const daySchedule = schedule.find(s => s.date === day.date);
      
      if (!daySchedule) {
        violations.push({
          type: 'no_coverage',
          date: day.date,
          message: `יום ${day.date} ללא כיסוי`
        });
        return;
      }
      
      // Check minimum coverage
      const guideCount = [daySchedule.guide1_id, daySchedule.guide2_id].filter(Boolean).length;
      
      if (day.isWeekend && day.weekendType === true) {
        // Closed weekend needs 1 כונן
        if (guideCount < 1) {
          violations.push({
            type: 'insufficient_coverage',
            date: day.date,
            message: `סופ״ש סגור צריך לפחות מדריך אחד`
          });
        }
      } else {
        // Regular day needs 2 guides
        if (guideCount < 2) {
          violations.push({
            type: 'insufficient_coverage',
            date: day.date,
            message: `יום רגיל צריך 2 מדריכים`
          });
        }
      }
    });
    
    return violations;
  }

  /**
   * Generate Hebrew explanations for all assignments
   */
  generateHebrewExplanations(schedule, monthlyPlan) {
    // Already generated during assignment, but could enhance here
    return schedule;
  }

  /**
   * Generate comprehensive statistics
   */
  generateScheduleStatistics(schedule) {
    const stats = {
      totalAssignments: schedule.length,
      manualAssignments: schedule.filter(s => s.is_manual).length,
      autoAssignments: schedule.filter(s => !s.is_manual).length,
      guideWorkload: {},
      fairnessMetrics: {},
      weekendDistribution: {}
    };
    
    // Calculate guide workload
    this.guides.forEach(guide => {
      const assignments = schedule.filter(
        s => s.guide1_id === guide.id || s.guide2_id === guide.id
      );
      
      stats.guideWorkload[guide.id] = {
        name: guide.name,
        totalShifts: assignments.length,
        weekendShifts: assignments.filter(s => {
          const dateStr = this.normalizeConstraintDate(s.date);
          const [year, month, day] = dateStr.split('-').map(Number);
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          return dayOfWeek === 5 || dayOfWeek === 6;
        }).length
      };
    });
    
    return stats;
  }
}

module.exports = AdvancedScheduler;