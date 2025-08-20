'use strict';

/**
 * Prompt templates for AI monthly proposal and day refinement
 * Following AI_SCHEDULER_PLAN.md - clean proposal generation approach
 * Keep prompts compact; all outputs in Hebrew unless stated
 */
const PromptTemplates = {
  systemMonthly() {
    return [
      '🏥 You are an AI scheduling assistant for an Israeli residential home (בית אבות).',
      '🎯 MISSION: Create a complete monthly scheduling proposal following Israeli scheduling rules.',
      '',
      '🚨 CRITICAL MUST RULES - Never violate these:',
      '1. 🚫 No consecutive days: A guide cannot work back-to-back days (except Friday כונן → Saturday closed weekend)',
      '2. 📅 Personal constraints: Never schedule guides during their constraint dates',
      '3. 🏖️ Vacations: Never schedule guides during vacation periods',
      '4. 📋 Fixed constraints: Respect weekly recurring constraints (weekday blocks)',
      '5. ⚖️ Coordinator rules: Follow no_auto_scheduling, manual_only, no_weekends, no_conan, prevent_pair',
      '6. 🏠 House scoping: Only use active guides from the specified house',
      '',
      '📋 Daily Requirements (Israeli Weekend Logic):',
      '- Weekdays (Sun-Thu): 1-2 guides (רגיל/חפיפה)',
      '- Friday Open: 2 regular guides',
      '- Friday Closed: 1 כונן only',
      '- Saturday Open: 2 guides + optional מוצ״ש',
      '- Saturday Closed: Same כונן from Friday + optional מוצ״ש',
      '- Roles: רגיל, חפיפה, כונן, מוצ״ש',
      '',
      '🎯 SHOULD Rules (optimize for these):',
      '- Fair workload distribution across the month',
      '- Diverse pairings (avoid same pairs repeatedly)',  
      '- Prefer guides with fewer recent shifts',
      '- Balance weekend workload fairly',
      '',
      '📝 OUTPUT FORMAT (JSON only):',
      '[{"date":"YYYY-MM-DD","assignments":[{"guide_id":number,"role":"רגיל|חפיפה|כונן|מוצ״ש"}],"explanation_he":"Hebrew explanation"}]',
      '',
      '🔍 Hebrew explanations required:',
      '- Explain assignment reasoning briefly',
      '- Mention any constraints considered',
      '- Note load balancing decisions',
      'בחר guide_id רק מתוך context.guides. השתמש בתווים עבריים ללא escape characters.',
    ].join('\n');
  },

  systemRefine() {
    return [
      '🔧 אתה מסייע לרכז לשפר יום ספציפי בלוח משמרות בית אבות לפי תורת השיבוץ.',
      '',
      '🚨 CRITICAL RULES לשיפור יום:',
      '- דרוש בדיוק 1-2 מדריכים ליום (לא פחות, לא יותר)',
      '- איסור ימים עוקבים: בדוק יום קודם/הבא לאותו מדריך',
      '- אילוצים אישיים: בדוק constraints ליום זה',
      '- חופשות: בדוק vacation periods',
      '- כללי רכז: בדוק coordinator_rules (no_auto_scheduling, no_weekends, etc.)',
      '- היגיון סופי שבוע: כונן בשישי סגור, המשך בשבת',
      '',
      '📋 תפקידים מותרים: רגיל, חפיפה, כונן, מוצ״ש',
      '',
      '🎯 העדפות שיפור:',
      '- העדף מדריכים עם פחות משמרות בחודש',
      '- שמור על איזון עומס',
      '- התאם לסוג יום השבוע והדרישות',
      '',
      '📝 OUTPUT: {"date":"YYYY-MM-DD","assignments":[{"guide_id":number,"role":"string"}],"explanation_he":"string"}',
      'בחר guide_id רק מתוך context.guides. הסבר בעברית את הבחירה והשיקולים.',
    ].join('\n');
  },

  /**
   * Build user message for full-month proposal (clean approach from AI_SCHEDULER_PLAN.md)
   * @param {Object} context - compact month context
   */
  userMonthly(context) {
    const exampleGuideId = context.guides?.[0]?.id || 1;
    const year = context.year || new Date().getFullYear();
    const month = context.month || new Date().getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return [
      `📅 Create complete monthly schedule for ${month}/${year} (${daysInMonth} days):`,
      '',
      `👥 Available guides (${context.guides?.length || 0}):`,
      context.guides?.map(g => `- ${g.id}: ${g.name} (${g.role})`).join('\n') || 'None available',
      '',
      `🚫 Personal constraints:`,
      context.constraints?.length > 0 
        ? context.constraints.map(c => `- Guide ${c.user_id}: ${c.date}`).join('\n')
        : '- None',
      '',
      `🏖️ Vacations:`,
      context.vacations?.length > 0
        ? context.vacations.map(v => `- Guide ${v.user_id}: ${v.date_start} to ${v.date_end}`).join('\n')
        : '- None',
      '',
      `📋 Fixed constraints (recurring):`,
      context.fixedConstraints?.length > 0
        ? context.fixedConstraints.map(f => `- Guide ${f.user_id}: ${f.weekday} blocked`).join('\n')
        : '- None',
      '',
      `📅 Weekend types:`,
      Object.entries(context.weekendTypes || {}).map(([date, isClosed]) => 
        `- ${date}: ${isClosed ? 'Closed' : 'Open'}`
      ).join('\n') || '- All open weekends',
      '',
      `⚖️ Coordinator rules active:`,
      context.coordinatorRules?.filter(r => r.is_active).map(r => 
        `- ${r.rule_type}${r.guide1_id ? ` (Guide ${r.guide1_id})` : ''}`
      ).join('\n') || '- None',
      '',
      `🎯 Create JSON schedule with ${daysInMonth} days, following all MUST rules.`,
      `Example format: [{"date":"${year}-${String(month).padStart(2,'0')}-01","assignments":[{"guide_id":${exampleGuideId},"role":"רגיל"}],"explanation_he":"נבחר לאיזון עומס"}]`
    ].join('\n');
  },

  /**
   * Build user message for ranged proposal (to reduce token size)
   */
  userMonthlyRange(context, startDate, endDate) {
    const exampleGuideId = context.guides?.[0]?.id || 1;
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Build day-of-week reference for AI
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dateReference = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const dayOfWeek = dayNames[d.getDay()];
      dateReference.push(`${dateStr} = יום ${dayOfWeek}`);
    }
    
    return [
      `🎯 צור הצעה לטווח תאריכים ${startDate} עד ${endDate}:`,
      '',
      `📅 CRITICAL: ימי השבוע הנכונים לטווח זה:`,
      dateReference.join('\n'),
      '',
      `📊 נתוני טווח:`,
      `- ימים בטווח: ${daysDiff} ימים`,
      `- חובה לכסות כל יום בטווח!`,
      `- השתמש בימי השבוע הנכונים לכל תאריך!`,
      '',
      `⚠️ חשוב: אל תחזיר תאריכים מחוץ לטווח ${startDate}-${endDate}`,
      '',
      JSON.stringify({ context, range: { startDate, endDate } }),
      '',
      `📝 סכמת החזרה (כל ימי הטווח):`,
      `[{"date":"YYYY-MM-DD","assignments":[{"guide_id":${exampleGuideId},"role":"רגיל"}],"explanation_he":"הסבר עם יום השבוע הנכון"}]`,
      '',
      `👥 מדריכים זמינים: ${context.guides?.map(g => `${g.id}:${g.name}`).join(', ') || 'none'}`,
      '',
      '🎯 דרש כיסוי מלא לכל יום בטווח עם הסברים מפורטים בעברית עם ימי השבוע הנכונים.',
    ].join('\n');
  },

  /**
   * Build user message for day refinement (following AI_SCHEDULER_PLAN.md)
   * @param {Object} refinement - { date, instructions, context, currentDay }
   */
  userRefine(refinement) {
    const { date, instructions, context, currentDay } = refinement;
    const exampleGuideId = context?.guides?.[0]?.id || 1;
    const dayOfWeek = new Date(date + 'T00:00:00').toLocaleDateString('he-IL', { weekday: 'long' });
    
    return [
      `🎯 Refine single day assignment for ${date} (${dayOfWeek}):`,
      '',
      `📋 Current assignment:`,
      currentDay && currentDay.assignments?.length > 0
        ? currentDay.assignments.map(a => `- Guide ${a.guide_id} as ${a.role}`).join('\n')
        : '- No current assignment',
      '',
      `💬 User instructions:`,
      `"${instructions}"`,
      '',
      `👥 Available guides:`,
      context?.guides?.map(g => `- ${g.id}: ${g.name} (${g.role})`).join('\n') || 'None available',
      '',
      `🚫 Constraints for this date:`,
      context?.constraints?.filter(c => c.date === date)
        .map(c => `- Guide ${c.user_id} unavailable`).join('\n') || '- None',
      '',
      `📅 Weekend type: ${context?.weekendTypes?.[date] ? 'Closed' : 'Open'}`,
      '',
      `🎯 Return refined assignment as JSON:`,
      `{"date":"${date}","assignments":[{"guide_id":${exampleGuideId},"role":"רגיל"}],"explanation_he":"סיבת השינוי בעברית"}`
    ].join('\n');
  },

  /**
   * JSON schema used for monthly proposal responses
   */
  schemaMonthly() {
    return {
      name: 'MonthlyProposal',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            assignments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  guide_id: { type: 'number' },
                  role: { type: 'string' },
                },
                required: ['guide_id', 'role'],
                additionalProperties: false,
              },
            },
            explanation_he: { type: 'string' },
          },
          required: ['date', 'assignments', 'explanation_he'],
          additionalProperties: false,
        },
      },
      strict: true,
    };
  },

  /**
   * JSON schema for day refinement responses
   */
  schemaDay() {
    return {
      name: 'DayProposal',
      schema: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          assignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                guide_id: { type: 'number' },
                role: { type: 'string' },
              },
              required: ['guide_id', 'role'],
              additionalProperties: false,
            },
          },
          explanation_he: { type: 'string' },
        },
        required: ['date', 'assignments', 'explanation_he'],
        additionalProperties: false,
      },
      strict: true,
    };
  },
};

module.exports = PromptTemplates;


