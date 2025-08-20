# Scheduling Bible - Complete Guide for AI Agent
## תורת השיבוץ - מדריך מלא לסוכן AI

### 🇮🇱 Israeli Calendar System
- **Weekend**: Friday-Saturday (יום שישי-שבת)
- **Weekdays**: Sunday-Thursday (יום ראשון-חמישי)
- **Date Format**: dd-mm-yyyy (Israeli standard)

### 📋 Core Scheduling Principles / עקרונות יסוד

#### 0. Universal Guide Pattern / דפוס מדריכים אוניברסלי
**Every shift (weekday, weekend, holiday) follows the same structure:**
- **1 Regular Guide (רגיל)**: Works the standard shift duration (24h)
- **1 Overlap Guide (חפיפה)**: Always works +1 hour (25h) for handover to next day's guides

**Exceptions:**
- **Closed Weekend Friday**: Only 1 כונן guide (standby)
- **Closed Weekend Saturday**: 1 former כונן + 1 מוצ״ש guide

#### 1. Daily Assignment Requirements / דרישות שיבוץ יומיות
- **Every day MUST have 1-2 guides** (לא יותר ולא פחות)
- **Weekdays (Sun-Thu)**: Always 2 guides (1 רגיל + 1 חפיפה)
- **Weekends (Fri-Sat)**: According to weekend type settings
- **Holidays**: Always 2 guides (1 רגיל + 1 חפיפה)
- **Maximum per day**: 2 guides only

#### 2. Role Types / סוגי תפקידים
- **רגיל** (Regular) - Standard shift (24 hours)
- **חפיפה** (Overlap) - Overlap shift for continuity (25 hours, +1h handover)
- **כונן** (Standby) - On-call duty (×0.3/×0.6 multiplier)
- **מוצ״ש** (Saturday Night) - Saturday evening shift (combination of existing hour types)

### 🚫 HARD CONSTRAINTS (Must Never Violate) / אילוצים קשיחים

#### 1. No Back-to-Back Days / איסור ימים עוקבים
- **RULE**: A guide cannot work consecutive days
- **EXCEPTION**: Friday→Saturday continuation for כונן in closed weekends
- **Implementation**: Check if guide worked previous day before assignment

#### 2. Personal Constraints / אילוצים אישיים
- **RULE**: Never assign guides who have personal constraints on specific dates
- **Source**: `constraints` table with user_id and date
- **Status**: Absolute veto - red traffic light

#### 3. Fixed Weekly Constraints / אילוצים קבועים שבועיים
- **RULE**: Never assign guides who have fixed constraints for specific weekdays
- **Source**: `fixed_constraints` table with user_id and weekday (0-6)
- **Status**: Absolute veto - red traffic light

#### 4. Vacation Periods / תקופות חופשה
- **RULE**: Never assign guides during approved vacation periods
- **Source**: `vacations` table with date ranges and status='approved'
- **Status**: Absolute veto - red traffic light

#### 5. Coordinator Rules / כללי רכז
These are management-level restrictions:
- **no_auto_scheduling**: Guide cannot be auto-assigned (manual only)
- **manual_only**: Guide requires manual assignment always
- **no_weekends**: Guide cannot work Friday/Saturday
- **no_conan**: Guide cannot work כונן (standby) role
- **no_together**: Two specific guides cannot work same day
- **prevent_pair**: Two specific guides should avoid same day

### 🌅 Weekend Logic / היגיון סופי שבוע

#### Weekend Types / סוגי סופי שבוע
Determined by Friday flag in `weekend_types` table:

#### Open Weekend / סופ״ש פתוח
- **Friday**: 2 guides (1 רגיל + 1 חפיפה) working 09:00 Friday - 10:00 Saturday
- **Saturday**: 2 guides (1 רגיל + 1 חפיפה) working 09:00 Saturday - 10:00 Sunday
- **Pattern**: Always 2 guides, fresh each day, maximum coverage

#### Closed Weekend / סופ״ש סגור
- **Friday**: 1 כונן (standby) guide ONLY, working 09:00 Friday - 17:00 Saturday
- **Saturday**: SAME כונן from Friday + 1 מוצ״ש guide, working 17:00 Saturday - 10:00 Sunday
- **Continuity Rule**: Saturday כונן MUST be same person as Friday כונן
- **Pattern**: Cost-effective coverage, limited Friday coverage

#### Holiday Coverage / כיסוי חגים
- **All Holidays**: Always 2 guides (1 רגיל + 1 חפיפה)
- **Pattern**: Follows open weekend structure, never uses standby
- **Multipliers**: ×2.0 for holiday hours, highest compensation

### ⚖️ BALANCING AND FAIRNESS / איזון והוגנות

#### 1. Workload Distribution / חלוקת עומס
- Track total shifts per guide for the month
- Prefer guides with fewer total shifts
- Balance weekend shifts fairly
- Balance כונן assignments fairly

#### 2. Assignment Priority Order / סדר עדיפויות
1. **Manual assignments** - Always preserved (highest priority)
2. **Hard constraints** - Never violate
3. **Weekend rules** - Must follow weekend type logic
4. **Fairness balancing** - Distribute workload evenly
5. **Soft preferences** - Consider when possible

### 📅 SCHEDULING ALGORITHM / אלגוריתם השיבוץ

#### Step 1: Preserve Manual Assignments / שמירה על שיבוצים ידניים
- **CRITICAL**: Any day with manual assignment (is_manual=true) must be preserved exactly
- Do not modify, replace, or supplement manual assignments
- Manual assignments override all other rules

#### Step 2: Generate Complete Coverage / כיסוי מלא
- **REQUIREMENT**: Every day in the month must have assignments
- **No gaps allowed**: If a day has no manual assignment, AI must provide assignment
- **Minimum**: 1 guide per day (weekend logic may require specific roles)
- **Maximum**: 2 guides per day

#### Step 3: Apply Constraints / יישום אילוצים
For each proposed assignment:
1. Check guide exists and is active
2. Check personal constraints for that date
3. Check fixed constraints for that weekday
4. Check vacation periods
5. Check coordinator rules
6. Check consecutive day rule (except closed weekend exception)
7. Check pairing conflicts

#### Step 4: Weekend Logic Enforcement / אכיפת היגיון סופ״ש
- **Open Weekend**: Ensure 2 guides (1 רגיל + 1 חפיפה) for both Friday and Saturday
- **Closed Weekend Friday**: Keep only כונן role, remove others
- **Closed Weekend Saturday**: Ensure same כונן from Friday continues + add מוצ״ש guide
- **Holidays**: Always ensure 2 guides (1 רגיל + 1 חפיפה) regardless of weekend type

#### Step 5: Balancing Optimization / אופטימיזציה של איזון
- Count current month assignments per guide
- Prefer guides with fewer total shifts
- Ensure weekend distribution is fair
- Avoid overloading any single guide

### 🔍 VALIDATION RULES / כללי ולידציה

#### Critical Checks / בדיקות קריטיות
1. **Complete Coverage**: Every day has 1-2 assignments
2. **No Consecutive Days**: Same guide not assigned consecutive days (except closed weekend Friday→Saturday כונן continuation)
3. **Constraint Compliance**: No violations of personal/fixed/vacation constraints
4. **Role Compliance**: Correct roles for weekend types (1 רגיל + 1 חפיפה for open weekends, כונן for closed Friday)
5. **Manual Preservation**: All manual assignments unchanged
6. **Coordinator Rules**: All management restrictions followed
7. **Guide Pattern Compliance**: Correct 1 רגיל + 1 חפיפה pattern (except closed weekends)

#### Warning Conditions / תנאי אזהרה
- Guide assigned after recent consecutive day
- Workload imbalance detected
- Suboptimal weekend type compliance
- Pairing conflict detected but resolved

### 💭 AI REASONING GUIDELINES / הנחיות חשיבה לAI

#### Always Explain in Hebrew / תמיד הסבר בעברית
- Provide clear Hebrew explanation for each assignment
- Explain why specific guide was chosen
- Mention constraint considerations
- Note balancing factors

#### Decision Factors / גורמי החלטה
1. **Availability** - Guide not blocked by constraints
2. **Fairness** - Balanced workload distribution  
3. **Weekend Logic** - Appropriate roles for weekend types
4. **Continuity** - Closed weekend Friday→Saturday כונן continuation
5. **Preference** - Guide specialization or house preferences
6. **Cost Efficiency** - Balance coverage needs with budget constraints
7. **Guide Pattern** - Ensure correct 1 רגיל + 1 חפיפה structure (except closed weekends)

#### Example Explanations / דוגמאות הסברים
- "נבחר בשל עומס נמוך ואין אילוצים" (Chosen due to low workload and no constraints)
- "המשך כונן מיום שישי לפי כללי סופ״ש סגור" (Continuing standby from Friday per closed weekend rules)
- "איזון עומס - מדריך עם מעט משמרות החודש" (Load balancing - guide with few shifts this month)

### 🎯 SUCCESS CRITERIA / קריטריונים להצלחה

#### Complete Success / הצלחה מלאה
✅ All days covered (no empty slots)  
✅ No constraint violations  
✅ Manual assignments preserved  
✅ Weekend logic followed correctly  
✅ Fair workload distribution  
✅ Clear Hebrew explanations provided  

#### Acceptable Compromises / פשרות מקובלות
- Slight workload imbalance if constraints force it
- Suboptimal role assignments if availability limited
- Missing מוצ״ש if no suitable guide available

#### Unacceptable Failures / כשלים בלתי מקובלים
❌ Empty days with no assignments  
❌ Constraint violations (personal/vacation/fixed)  
❌ Consecutive day violations (except closed weekend Friday→Saturday כונן)  
❌ Modified manual assignments  
❌ Wrong roles for closed weekends  
❌ Incorrect guide pattern (not 1 רגיל + 1 חפיפה when required)  
❌ Holiday assignments without 2 guides  

### 💰 HOUR CALCULATION SYSTEM / מערכת חישוב שעות

#### Core Principles / עקרונות יסוד
The hour calculation system determines compensation for guides based on shift types and multipliers:

#### Universal Guide Pattern / דפוס מדריכים אוניברסלי
**Every shift (weekday, weekend, holiday) follows the same structure:**
- **1 Regular Guide (רגיל)**: Works the standard shift duration (24h)
- **1 Overlap Guide (חפיפה)**: Always works +1 hour (25h) for handover to next day's guides

**Purpose of Overlap:**
- Ensures smooth transition between shifts
- No gap in coverage between days
- Consistent handover process across all shift types

#### Salary Factor Multipliers / מכפילי פקטור שכר
| Shift Type | Hebrew Name | Multiplier | Description |
|------------|-------------|------------|-------------|
| Regular | רגיל | ×1.0 | Standard weekday shifts |
| Night | לילה | ×1.5 | Night shift hours (00:00-08:00) |
| Shabbat | שבת | ×2.0 | Saturday/Shabbat hours |
| Standby | כונן | ×0.3 | Weekday standby duty |
| Standby Shabbat | כונן שבת | ×0.6 | Saturday standby duty |

#### Day Type Hour Calculations / חישובי שעות לפי סוג יום

##### 1. **Standard Weekdays (Sunday-Thursday)**
- **Pattern**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Hours**: Regular (×1.0) + Night (×1.5)
- **Coverage**: 09:00 - 10:00 next day
- **Total**: 49 hours (24 + 25)
- **Salary Factor**: Regular = 28, Overlap = 29

##### 2. **Open Weekend Days**
- **Friday**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Saturday**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Pattern**: Always 2 guides, fresh each day
- **Total**: 98 hours (4 guides × 24-25h)
- **Salary Factor**: Friday Regular = 38, Friday Overlap = 40, Saturday Regular = 36.5, Saturday Overlap = 37.5

##### 3. **Closed Weekend Days**
- **Friday**: 1 כונן (32h standby)
- **Saturday**: 1 former כונן (17h) + 1 מוצ״ש (16h)
- **Pattern**: 1 guide Friday, 2 guides Saturday
- **Total**: 65 hours (32 + 17 + 16)
- **Salary Factor**: Friday = 16.2, Saturday Former כונן = 23, מוצ״ש = 22

##### 4. **Holiday Days**
- **Pattern**: Always 1 רגיל (24h) + 1 חפיפה (25h)
- **Multipliers**: ×2.0 for holiday hours, ×1.0 for regular, ×1.5 for night
- **Coverage**: 09:00 - 10:00 next day
- **Total**: 49 hours (24 + 25)
- **Salary Factor**: Varies by holiday type (38-98+)

#### Weekend Logic and Hour Calculations / היגיון סופ״ש וחישובי שעות

##### Open Weekend (סופ״ש פתוח)
- **Friday**: 2 guides (1 רגיל + 1 חפיפה) working 09:00 Friday - 10:00 Saturday
- **Saturday**: 2 guides (1 רגיל + 1 חפיפה) working 09:00 Saturday - 10:00 Sunday
- **Total Coverage**: Continuous 48-50 hours with 2 guides always present
- **Handover**: Overlap guide works 1 extra hour for smooth transition

##### Closed Weekend (סופ״ש סגור)
- **Friday**: 1 guide (כונן) works 09:00 Friday - 17:00 Saturday (32 hours total)
- **Saturday**: 2 guides work together from 17:00 Saturday onwards
  - Former standby guide: 17:00 Saturday - 10:00 Sunday (17 hours total)
  - New מוצ״ש guide: 17:00 Saturday - 09:00 Sunday (16 hours total)
- **Total Coverage**: 48 hours with 1 guide Friday, 2 guides Saturday
- **Handover**: Former standby guide works 1 extra hour (until 10:00 Sunday) for smooth transition

#### Holiday Calculations (חגים)
**Holidays always follow the open weekend pattern with 2 guides working together.**

##### Holiday Types and Multipliers
1. **Holiday Eve (ערב חג)**: Like Friday - 2 guides (1 רגיל + 1 חפיפה)
   - 09:00-19:00: ×1.0 (Regular hours)
   - 19:00-10:00 next day: ×2.0 (Holiday hours)
   - Regular guide: 24h total, Overlap guide: 25h total (+1h handover)

2. **Full Holiday (חג מלא)**: 24 hours of ×2.0 multiplier
   - 2 guides (1 רגיל + 1 חפיפה): 09:00-09:00 next day
   - Regular guide: 24h ×2.0, Overlap guide: 25h ×2.0 (+1h handover)

3. **Consecutive Holidays**: Multiple days with ×2.0 multiplier
   - Each day: 2 guides (1 רגיל + 1 חפיפה) working 09:00-09:00 next day
   - Regular guide: 24h ×2.0, Overlap guide: 25h ×2.0 (+1h handover)

4. **Holiday + Shabbat**: Creates extended ×2.0 periods
   - Example: Rosh Hashana Eve → Rosh Hashana 1 → Rosh Hashana 2
   - Can result in 48+ consecutive hours of ×2.0 multiplier
   - Always 2 guides (1 רגיל + 1 חפיפה) with overlap handover

#### Cost Implications for AI Scheduling / השלכות עלות על שיבוץ AI

##### Cost Comparison by Day Type
| Day Type | Total Hours | Total Salary Factor | Cost Level | AI Consideration |
|-----------|-------------|---------------------|------------|------------------|
| **Weekday** | 49h | 49 | Low | Standard cost, good for budget |
| **Open Weekend** | 98h | 98 | Medium | Higher cost, maximum coverage |
| **Closed Weekend** | 65h | 51.2 | Low-Medium | Cost-effective, limited coverage |
| **Holiday** | 49h | 98+ | High | Premium cost, required coverage |

##### AI Scheduling Guidelines Based on Hour Calculations
1. **Budget Optimization**: Prefer closed weekends when coverage allows
2. **Coverage Priority**: Use open weekends when maximum coverage needed
3. **Holiday Planning**: Always assign 2 guides (required pattern)
4. **Fair Distribution**: Balance high-cost and low-cost assignments across guides
5. **Handover Continuity**: Ensure overlap guides can properly hand over to next day

### 📖 IMPLEMENTATION NOTES / הערות יישום

This bible serves as the complete reference for AI scheduling decisions. Every assignment must be justified against these rules. When in doubt, prioritize coverage and constraint compliance over optimization.

**Hour Calculation Integration**: The AI agent should now consider both operational requirements AND cost implications when making scheduling decisions. Use the hour calculation system to optimize for both coverage and budget efficiency.

**Reference Documents**: 
- **Primary**: This Scheduling Bible (complete scheduling rules and hour calculations)
- **Detailed**: `HOUR_CALCULATION_SYSTEM.md` (comprehensive hour calculation examples and tables)

The AI agent should read this document as the ultimate authority on scheduling logic and refer to it for all decision-making processes.