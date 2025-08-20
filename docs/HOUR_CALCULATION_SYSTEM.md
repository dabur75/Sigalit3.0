# Hour Calculation System - Sigalit Project

## Overview
This document describes the complete method of how hours are calculated in the Sigalit project, including all factors, multipliers, and calculation rules for different shift types and roles.

**Key System Design**: Weekday shifts (Sunday-Thursday) always have 2 guides working simultaneously - one regular guide and one overlap guide, with different shift durations but overlapping night hours.

### Universal Guide Pattern
**Every shift (weekday, weekend, holiday) follows the same structure:**
- **1 Regular Guide (רגיל)**: Works the standard shift duration
- **1 Overlap Guide (חפיפה)**: Always works +1 hour for handover to next day's guides

**Purpose of Overlap:**
- Ensures smooth transition between shifts
- No gap in coverage between days
- Consistent handover process across all shift types

## Core Hour Calculation Factors

### Salary Factor Multipliers
The system uses the following multipliers for salary calculations:

| Shift Type | Hebrew Name | Multiplier | Description |
|------------|-------------|------------|-------------|
| Regular | רגיל | ×1.0 | Standard weekday shifts |
| Night | לילה | ×1.5 | Night shift hours (00:00-08:00) |
| Shabbat | שבת | ×2.0 | Saturday/Shabbat hours |
| Standby | כונן | ×0.3 | Weekday standby duty |
| Standby Shabbat | כונן שבת | ×0.6 | Saturday standby duty |

## Shift Types and Role Definitions

### 1. Regular Shift (רגיל)
- **Weekday (Sunday-Thursday)**: 24 hours total
  - Regular hours: 16 (09:00-00:00 + 08:00-09:00 next day)
  - Night hours: 8 (00:00-08:00)
- **Friday (Open Shabbat)**: 24 hours total
  - Regular hours: 10 (09:00-19:00)
  - Shabbat hours: 14 (19:00 - Saturday 09:00)
- **Saturday (Open Shabbat)**: 24 hours total
  - Shabbat hours: 24 (full Saturday shift)

### 2. Overlap Shift (חפיפה)
- **Weekday (Sunday-Thursday)**: 25 hours total
  - Regular hours: 17 (09:00-00:00 + 08:00-10:00 next day)
  - Night hours: 8 (00:00-08:00)
- **Friday (Open Shabbat)**: 25 hours total
  - Regular hours: 10 (09:00-19:00)
  - Shabbat hours: 15 (19:00 - Saturday 10:00, includes handover)
- **Saturday (Open Shabbat)**: 25 hours total
  - Shabbat hours: 25 (full Saturday + handover hour)

### 3. Standby Duty (כונן)
- **Weekday**: 24 hours total
  - Standby hours: 24 (full day standby)
- **Friday (Closed Saturday)**: 32 hours total
  - Friday standby: 10 (09:00-19:00 weekday standby)
  - Saturday standby: 22 (19:00 Friday - 17:00 Saturday Shabbat standby)

### 4. Saturday Night Shift (מוצ״ש)
**Note**: This is not a separate hour type, but a combination of existing types.

- **Saturday (Closed Shabbat)**: 15 hours total
  - Shabbat hours: 2 (17:00-19:00) - uses ×2.0 multiplier
  - Regular hours: 5 (19:00-24:00) - uses ×1.0 multiplier
  - Night hours: 8 (00:00-08:00 Sunday) - uses ×1.5 multiplier
- **Saturday (Open Shabbat)**: 16 hours total
  - Shabbat hours: 16 (Saturday shift in open Shabbat) - uses ×2.0 multiplier

## Weekday Hour Calculation Logic (Sunday-Thursday)

### Two Guides Per Shift
- **Regular Guide (רגיל)**: Works 09:00 - 09:00 next day (24 hours total)
- **Overlap Guide (חפיפה)**: Works 09:00 - 10:00 next day (25 hours total)

### Hour Breakdown for Both Guides
Both guides work the same hours during the night period, but have different end times:

#### Regular Guide (רגיל) - 24 hours total
- **09:00-00:00 (15 hours)**: Regular hours (×1.0)
- **00:00-08:00 (8 hours)**: Night hours (×1.5) 
- **08:00-09:00 (1 hour)**: Regular hours (×1.0)
- **Total**: 16 regular + 8 night = 24 hours

#### Overlap Guide (חפיפה) - 25 hours total
- **09:00-00:00 (15 hours)**: Regular hours (×1.0)
- **00:00-08:00 (8 hours)**: Night hours (×1.5)
- **08:00-10:00 (2 hours)**: Regular hours (×1.0) - includes handover
- **Total**: 17 regular + 8 night = 25 hours

### Key Points
- **Night factor (×1.5)** applies to both guides during 00:00-08:00
- **Regular factor (×1.0)** applies to all other hours
- **Overlap guide** works 1 extra hour for handover purposes
- **Both guides** are present simultaneously during the shift

## Weekend Logic and Hour Calculations

### Open Weekend (סופ״ש פתוח)

#### Friday Shift - 2 Guides Working Simultaneously
**Both guides start at 09:00 Friday and work together during the day.**

- **Regular Guide (רגיל)**: 09:00 Friday - 09:00 Saturday (24 hours total)
  - Regular hours: 10 (09:00-19:00 Friday) - uses ×1.0 multiplier
  - Shabbat hours: 14 (19:00 Friday - 09:00 Saturday) - uses ×2.0 multiplier
- **Overlap Guide (חפיפה)**: 09:00 Friday - 10:00 Saturday (25 hours total)
  - Regular hours: 10 (09:00-19:00 Friday) - uses ×1.0 multiplier
  - Shabbat hours: 15 (19:00 Friday - 10:00 Saturday) - uses ×2.0 multiplier

**Key Points:**
- Both guides work the same 10 regular hours (09:00-19:00 Friday)
- Both guides work Shabbat hours from 19:00 Friday onwards
- Regular guide ends at 09:00 Saturday (14 Shabbat hours)
- Overlap guide continues until 10:00 Saturday (15 Shabbat hours total)
- The 1-hour difference (09:00-10:00 Saturday) is the handover period

#### Saturday Shift - 2 Guides Working Simultaneously
**Both guides start at 09:00 Saturday and work together during the day.**

- **Regular Guide (רגיל)**: 09:00 Saturday - 09:00 Sunday (24 hours total)
  - Shabbat hours: 10 (09:00-19:00 Saturday) - uses ×2.0 multiplier
  - Regular hours: 9 (19:00-00:00 Saturday + 08:00-09:00 Sunday) - uses ×1.0 multiplier
  - Night hours: 5 (00:00-08:00 Sunday) - uses ×1.5 multiplier

- **Overlap Guide (חפיפה)**: 09:00 Saturday - 10:00 Sunday (25 hours total)
  - Shabbat hours: 10 (09:00-19:00 Saturday) - uses ×2.0 multiplier
  - Regular hours: 10 (19:00-00:00 Saturday + 08:00-10:00 Sunday) - uses ×1.0 multiplier
  - Night hours: 5 (00:00-08:00 Sunday) - uses ×1.5 multiplier

**Key Points:**
- Both guides work the same 10 Shabbat hours (09:00-19:00 Saturday)
- Both guides work regular hours from 19:00 Saturday onwards
- Both guides work night hours (00:00-08:00 Sunday)
- Regular guide ends at 09:00 Sunday (24 hours total)
- Overlap guide continues until 10:00 Sunday (25 hours total)
- The 1-hour difference (09:00-10:00 Sunday) is the handover period

**Open Weekend Summary:**
- **Friday**: 2 guides work 09:00 Friday - 10:00 Saturday (24-25 hours each)
- **Saturday**: 2 guides work 09:00 Saturday - 10:00 Sunday (24-25 hours each)
- **Total Coverage**: Continuous 48-50 hours with 2 guides always present
- **Handover**: Overlap guide works 1 extra hour for smooth transition

### Closed Weekend (סופ״ש סגור)

#### Friday Shift - Standby Only
- **Guide**: כונן (Standby) - works Friday 09:00 - Saturday 17:00 (32 hours total)
  - Standby hours: 10 (Friday 09:00-19:00) - uses ×0.3 multiplier
  - Standby Shabbat hours: 22 (Friday 19:00 - Saturday 17:00) - uses ×0.6 multiplier

#### Saturday Shift - Standby + Motzash
**At 17:00 Saturday, the standby guide becomes active and is joined by a second guide.**

- **Guide 1 (Former כונן)**: Saturday 17:00 - Sunday 10:00 (17 hours total)
  - Shabbat hours: 2 (17:00-19:00 Saturday) - uses ×2.0 multiplier
  - Regular hours: 5 (19:00-00:00 Saturday) - uses ×1.0 multiplier
  - Night hours: 8 (00:00-08:00 Sunday) - uses ×1.5 multiplier
  - Regular hours: 2 (08:00-10:00 Sunday) - uses ×1.0 multiplier

- **Guide 2 (מוצ״ש)**: Saturday 17:00 - Sunday 09:00 (16 hours total)
  - Shabbat hours: 2 (17:00-19:00 Saturday) - uses ×2.0 multiplier
  - Regular hours: 5 (19:00-00:00 Saturday) - uses ×1.0 multiplier
  - Night hours: 8 (00:00-08:00 Sunday) - uses ×1.5 multiplier
  - Regular hours: 1 (08:00-09:00 Sunday) - uses ×1.0 multiplier

**Key Points:**
- **Continuity Rule**: Saturday standby MUST be same person as Friday standby
- Friday: 1 guide works 32 hours (10 standby + 22 standby Shabbat)
- Saturday: 2 guides work together from 17:00 onwards
- The former standby guide works 1 extra hour (until 10:00 Sunday) for handover
- Total coverage: Continuous 48 hours with proper handover

**Closed Weekend Summary:**
- **Friday**: 1 guide (כונן) works 09:00 Friday - 17:00 Saturday (32 hours total)
- **Saturday**: 2 guides work together from 17:00 Saturday onwards
  - Former standby guide: 17:00 Saturday - 10:00 Sunday (17 hours total)
  - New מוצ״ש guide: 17:00 Saturday - 09:00 Sunday (16 hours total)
- **Total Coverage**: Continuous 48 hours with 1 guide Friday, 2 guides Saturday
- **Handover**: Former standby guide works 1 extra hour (until 10:00 Sunday) for smooth transition

## Implementation Details

### Core Calculation Function
The hour calculations are implemented in the `calculateHoursForShiftPG` function in `backend/app.js`:

```javascript
function calculateHoursForShiftPG(day, role, weekendTypes, schedule, dayIndex) {
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
  
  // Check if this is a closed Saturday weekend
  let isClosedSaturday = false;
  if (isFriday) {
    const saturdayDate = new Date(day.date);
    saturdayDate.setDate(saturdayDate.getDate() + 1);
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0];
    isClosedSaturday = weekendTypes[saturdayDateStr] === true;
  } else if (isSaturday) {
    isClosedSaturday = weekendTypes[day.date] === true;
  }
  
  // Calculate hours based on role and day
  switch (role) {
    case 'כונן':
      if (isFriday && isClosedSaturday) {
        hours.conan = 10;           // Friday 09:00-19:00
        hours.conan_shabbat = 22;   // Friday 19:00 - Saturday 17:00
      } else {
        hours.conan = 24;
      }
      break;
      
    case 'מוצ״ש':
      if (isSaturday && isClosedSaturday) {
        // Note: This represents the מוצ״ש guide only
        // The former standby guide works additional hours (08:00-10:00 Sunday)
        hours.shabbat = 2;    // Saturday 17:00-19:00
        hours.regular = 5;    // Saturday 19:00-24:00
        hours.night = 8;      // Sunday 00:00-08:00
        hours.motzash = 15;   // Total motzash hours
      } else {
        hours.shabbat = 16;   // Saturday shift in open Shabbat
      }
      break;
      
    case 'רגיל':
      if (isFriday && !isClosedSaturday) {
        hours.regular = 10;   // Friday 09:00-19:00
        hours.shabbat = 14;   // Friday 19:00 - Saturday 09:00
      } else if (isSaturday && !isClosedSaturday) {
        // Saturday: 10 Shabbat (09:00-19:00) + 9 regular (19:00-00:00 + 08:00-09:00) + 5 night (00:00-08:00)
        hours.shabbat = 10;   // Saturday 09:00-19:00
        hours.regular = 9;    // Saturday 19:00-00:00 + Sunday 08:00-09:00
        hours.night = 5;      // Sunday 00:00-08:00
      } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        hours.regular = 16;   // Day shift 09:00 - next day 09:00
        hours.night = 8;      // Night shift 00:00 - 08:00
      }
      break;
      
    case 'חפיפה':
      if (isFriday && !isClosedSaturday) {
        hours.regular = 10;   // Friday 09:00-19:00
        hours.shabbat = 15;   // Friday 19:00 - Saturday 10:00
      } else if (isSaturday && !isClosedSaturday) {
        // Saturday: 10 Shabbat (09:00-19:00) + 10 regular (19:00-00:00 + 08:00-10:00) + 5 night (00:00-08:00)
        hours.shabbat = 10;   // Saturday 09:00-19:00
        hours.regular = 10;   // Saturday 19:00-00:00 + Sunday 08:00-10:00
        hours.night = 5;      // Sunday 00:00-08:00
      } else if (dayOfWeek >= 0 && dayOfWeek <= 4) {
        hours.regular = 17;   // Day shift 09:00 - next day 10:00
        hours.night = 8;      // Night shift 00:00 - 08:00
      }
      break;
  }
  
  return hours;
}
```

### Salary Factor Calculation
The total salary factor is calculated by applying the multipliers:

```javascript
stats.salary_factor = (stats.regular_hours * 1.0) + 
                      (stats.night_hours * 1.5) + 
                      (stats.shabbat_hours * 2.0) + 
                      (stats.conan_hours * 0.3) + 
                      (stats.conan_shabbat_hours * 0.6);
```

## Database Schema

### Assignment Types Table
The system includes predefined assignment types with default hour configurations:

```sql
CREATE TABLE assignment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hours_per_shift INTEGER DEFAULT 24,
    salary_factor REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default values
INSERT INTO assignment_types (name, description, hours_per_shift, salary_factor) VALUES
('רגיל', 'משמרת רגילה', 24, 1.0),
('חג', 'משמרת בחג', 24, 1.5),
('שבת', 'משמרת בשבת', 24, 1.3);
```

### Weekend Types Table
Weekend configurations are stored in the `weekend_types` table:

```sql
CREATE TABLE weekend_types (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Reporting and Statistics

### Hours Tab Display
The reports page displays detailed hour breakdowns for each guide:

| Column | Hebrew | Description |
|--------|---------|-------------|
| Guide Name | מדריך | Guide's name |
| Regular Hours | שעות רגיל | Standard hours (×1.0) |
| Night Hours | שעות לילה | Night shift hours (×1.5) |
| Shabbat Hours | שעות שבת | Saturday hours (×2.0) |
| Standby Hours | שעות כונן | Weekday standby (×0.3) |
| Standby Shabbat | שעות כונן שבת | Saturday standby (×0.6) |
| Total Hours | סה"כ שעות נטו | Sum of all hours |
| Salary Factor | פקטור שכר | Weighted total for salary |
| % of Average | % מהממוצע | Percentage compared to team average |

### CSV Export
The system exports detailed hour statistics including:
- Total shifts per guide
- Manual vs. automatic assignments
- Hours by type with multipliers
- Salary factors
- Balance analysis

## Special Cases and Rules

### 1. Consecutive Day Exception
- **RULE**: Guides cannot work consecutive days
- **EXCEPTION**: Friday→Saturday continuation for standby in closed weekends
- **Implementation**: Check if guide worked previous day before assignment

### 2. Weekend Continuity
- **Closed Weekend**: Friday standby must continue to Saturday
- **Open Weekend**: Regular guides can be assigned independently
- **Motzash**: Can be added to any Saturday regardless of weekend type

### 3. Hour Distribution Logic
- **Weekday (Sun-Thu)**: 24-25 hours (regular + night)
  - Regular guide: 16 regular + 8 night = 24 total
  - Overlap guide: 17 regular + 8 night = 25 total
- **Friday**: 24 hours (regular + Shabbat)
- **Saturday**: 24-25 hours (Shabbat + optional Motzash)
- **Standby**: 24-32 hours depending on weekend type
- **Holidays**: Always follow open weekend pattern (2 guides working together)

## Weekly Hour Worth Mapping

### Hour-by-Hour Worth Table (Sunday - Saturday)
This table shows the salary multiplier for each hour of the week based on shift types and weekend configurations.

| Day | Time | Regular Guide (רגיל) | Overlap Guide (חפיפה) | Standby Guide (כונן) | Notes |
|-----|------|---------------------|----------------------|---------------------|-------|
| **Sunday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Main shift |
| **Monday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Main shift |
| **Tuesday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Main shift |
| **Wednesday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Main shift |
| **Thursday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Main shift |
| **Friday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.3 (Standby) | Weekday shift |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | Handover period |
| | 09:00-19:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.3 (Standby) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Standby only |
| | 19:00-00:00 | ×2.0 (Shabbat) | ×2.0 (Shabbat) | ×0.6 (Standby Shabbat) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Standby only |
| **Saturday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×0.6 (Standby Shabbat) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Standby only |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×0.6 (Standby Shabbat) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Standby only |
| | 09:00-17:00 | ×2.0 (Shabbat) | ×2.0 (Shabbat) | ×0.6 (Standby Shabbat) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Standby only |
| | 17:00-19:00 | ×2.0 (Shabbat) | ×2.0 (Shabbat) | ×2.0 (Shabbat) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Former standby + מוצ״ש |
| | 19:00-00:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×1.0 (Regular) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Former standby + מוצ״ש |
| **Sunday** | 00:00-08:00 | ×1.5 (Night) | ×1.5 (Night) | ×1.5 (Night) | **Open Weekend**: Both guides present<br>**Closed Weekend**: Former standby + מוצ״ש |
| | 08:00-09:00 | ×1.0 (Regular) | ×1.0 (Regular) | ×1.0 (Regular) | **Open Weekend**: Regular guide ends<br>**Closed Weekend**: מוצ״ש guide ends |
| | 09:00-10:00 | - | ×1.0 (Regular) | ×1.0 (Regular) | **Open Weekend**: Overlap guide handover<br>**Closed Weekend**: Former standby handover |

### Weekend Configuration Impact

#### Open Weekend (סופ״ש פתוח) - 4 Different Guides
- **Friday 09:00-19:00**: 2 guides (1 רגיל + 1 חפיפה) both get ×1.0
- **Friday 19:00 - Saturday 10:00**: 2 guides (1 רגיל + 1 חפיפה) both get ×2.0
- **Saturday 09:00 - Sunday 10:00**: 2 guides (1 רגיל + 1 חפיפה) get mixed multipliers
- **Total Coverage**: 48-50 hours with 2 guides always present
- **Guide Rotation**: Fresh guides each day, no consecutive day restrictions
- **Overlap Purpose**: חפיפה guide always works +1 hour for handover to next day's guides

#### Closed Weekend (סופ״ש סגור) - 2 Guides Total
- **Friday 09:00 - Saturday 17:00**: 1 guide (כונן) gets ×0.3/×0.6
- **Saturday 17:00 - Sunday 10:00**: 2 guides (former standby + מוצ״ש) get mixed multipliers
- **Total Coverage**: 48 hours with 1 guide Friday, 2 guides Saturday
- **Guide Continuity**: Same standby guide works Friday-Saturday, joined by מוצ״ש Saturday

### Holiday Calculations (חגים)
**Holidays always follow the open weekend pattern with 2 guides working together.**

#### Holiday Types and Multipliers
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

#### Rosh Hashana Example
```
Rosh Hashana Eve (ערב ראש השנה):
- 2 guides (1 רגיל + 1 חפיפה): 09:00-10:00 next day
- Regular guide: 10×1.0 + 14×2.0 = 24h total
- Overlap guide: 10×1.0 + 15×2.0 = 25h total (+1h handover)

Rosh Hashana Day 1 (ראש השנה א):
- 2 guides (1 רגיל + 1 חפיפה): 09:00-09:00 next day  
- Regular guide: 24×2.0 = 24h total
- Overlap guide: 25×2.0 = 25h total (+1h handover)

Rosh Hashana Day 2 (ראש השנה ב):
- 2 guides (1 רגיל + 1 חפיפה): 09:00-09:00 next day
- Regular guide: 10×2.0 + 9×1.0 + 5×1.5 = 24h total
- Overlap guide: 10×2.0 + 10×1.0 + 5×1.5 = 25h total (+1h handover)
```

### Quick Weekend Comparison Table
| Aspect | Open Weekend (סופ״ש פתוח) | Closed Weekend (סופ״ש סגור) |
|--------|---------------------------|------------------------------|
| **Total Guides Needed** | 4 guides | 2 guides |
| **Friday Coverage** | 2 guides (09:00-10:00) | 1 guide (09:00-17:00) |
| **Saturday Coverage** | 2 guides (09:00-10:00) | 2 guides (17:00-10:00) |
| **Guide Rotation** | Fresh guides each day | Same standby Friday-Saturday |
| **Friday Hours** | 10×1.0 + 14×2.0 = 24-25h per guide | 10×0.3 + 22×0.6 = 32h total |
| **Saturday Hours** | 10×2.0 + 9-10×1.0 + 5×1.5 = 24-25h per guide | Mixed multipliers for 2 guides |
| **Total Weekend Hours** | 96-100 hours (4 guides) | 48 hours (2 guides) |

### Holiday Hour Worth Mapping
**Holidays follow open weekend pattern but with extended ×2.0 periods.**

#### Multi-Day Holiday Example (Rosh Hashana)
```
Rosh Hashana Eve → Rosh Hashana Day 1 → Rosh Hashana Day 2
      ↓                    ↓                    ↓
   09:00-19:00          09:00-09:00          09:00-19:00
   ×1.0 (Regular)       ×2.0 (Holiday)       ×2.0 (Holiday)
   
   19:00-10:00          19:00-00:00          19:00-00:00
   ×2.0 (Holiday)       ×2.0 (Holiday)       ×1.0 (Regular)
   
   00:00-08:00          00:00-08:00          00:00-08:00
   ×2.0 (Holiday)       ×2.0 (Holiday)       ×1.5 (Night)
   
   08:00-09:00          08:00-09:00          08:00-09:00
   ×2.0 (Holiday)       ×2.0 (Holiday)       ×1.0 (Regular)
```

**Key Points:**
- **Holiday Eve**: Like Friday (10×1.0 + 14×2.0)
- **Full Holiday**: 24h ×2.0 (highest compensation)
- **Consecutive Holidays**: Can create 48+ hours of ×2.0
- **Always 2 guides**: Never uses standby pattern
- **Consistent Pattern**: 1 רגיל (24h) + 1 חפיפה (25h) for handover

### Multiplier Summary
- **×0.3**: Weekday standby hours
- **×0.6**: Shabbat standby hours  
- **×1.0**: Regular hours (weekday main shift, weekend regular hours, holiday regular hours)
- **×1.5**: Night hours (00:00-08:00)
- **×2.0**: Shabbat hours (Friday 19:00 onwards, Saturday 09:00-19:00) + Holiday hours (full 24h on holidays)

### Visual Hour Worth Maps by Weekend Type

#### Open Weekend (סופ״ש פתוח) - 4 Different Guides
```
Week: Sunday → Monday → Tuesday → Wednesday → Thursday → Friday → Saturday → Sunday
      ↓        ↓        ↓         ↓           ↓         ↓        ↓         ↓
   09:00    09:00    09:00     09:00       09:00     09:00    09:00     09:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×1.0     ×2.0      ×1.0
   
   19:00    19:00    19:00     19:00       19:00     19:00    19:00     19:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×2.0     ×2.0      ×1.0
   
   00:00    00:00    00:00     00:00       00:00     00:00    00:00     00:00
   ×1.5     ×1.5     ×1.5      ×1.5        ×1.5      ×2.0     ×1.5      ×1.5
   
   08:00    08:00    08:00     08:00       08:00     08:00    08:00     08:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×1.0     ×1.0      ×1.0

**Friday Shift (09:00 Fri - 10:00 Sat):**
- Guide 1 (רגיל): 09:00-09:00 = 24h (10×1.0 + 14×2.0)
- Guide 2 (חפיפה): 09:00-10:00 = 25h (10×1.0 + 15×2.0)

**Saturday Shift (09:00 Sat - 10:00 Sun):**
- Guide 3 (רגיל): 09:00-09:00 = 24h (10×2.0 + 9×1.0 + 5×1.5)
- Guide 4 (חפיפה): 09:00-10:00 = 25h (10×2.0 + 10×1.0 + 5×1.5)
```

#### Closed Weekend (סופ״ש סגור) - 2 Guides Total
```
Week: Sunday → Monday → Tuesday → Wednesday → Thursday → Friday → Saturday → Sunday
      ↓        ↓        ↓         ↓           ↓         ↓        ↓         ↓
   09:00    09:00    09:00     09:00       09:00     09:00    09:00     09:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×1.0     ×2.0      ×1.0
   
   19:00    19:00    19:00     19:00       19:00     19:00    19:00     19:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×0.6     ×2.0      ×1.0
   
   00:00    00:00    00:00     00:00       00:00     00:00    00:00     00:00
   ×1.5     ×1.5     ×1.5      ×1.5        ×1.5      ×0.6     ×1.5      ×1.5
   
   08:00    08:00    08:00     08:00       08:00     08:00    08:00     08:00
   ×1.0     ×1.0     ×1.0      ×1.0        ×1.0      ×0.6     ×1.0      ×1.0

**Friday Shift (09:00 Fri - 17:00 Sat):**
- Guide 1 (כונן): 09:00-17:00 = 32h (10×0.3 + 22×0.6)

**Saturday Shift (17:00 Sat - 10:00 Sun):**
- Guide 1 (Former כונן): 17:00-10:00 = 17h (2×2.0 + 5×1.0 + 8×1.5 + 2×1.0)
- Guide 2 (מוצ״ש): 17:00-09:00 = 16h (2×2.0 + 5×1.0 + 8×1.5 + 1×1.0)
```

**Legend:**
- **×1.0**: Regular hours (standard rate)
- **×1.5**: Night hours (00:00-08:00)
- **×2.0**: Shabbat hours (Friday 19:00 onwards, Saturday 09:00-19:00)
- **×0.3**: Weekday standby
- **×0.6**: Shabbat standby

## Calculation Examples
- **Role**: רגיל (Regular)
- **Day**: Tuesday
- **Hours**: 16 regular + 8 night = 24 total
- **Salary Factor**: (16 × 1.0) + (8 × 1.5) = 16 + 12 = 28

### Example 1b: Overlap Weekday Shift
- **Role**: חפיפה (Overlap)
- **Day**: Tuesday
- **Hours**: 17 regular + 8 night = 25 total
- **Salary Factor**: (17 × 1.0) + (8 × 1.5) = 17 + 12 = 29

### Example 2: Open Weekend Friday Shift
- **Regular Guide (רגיל)**: Friday 09:00 - Saturday 09:00
  - Hours: 10 regular + 14 Shabbat = 24 total
  - Salary Factor: (10 × 1.0) + (14 × 2.0) = 10 + 28 = 38
- **Overlap Guide (חפיפה)**: Friday 09:00 - Saturday 10:00
  - Hours: 10 regular + 15 Shabbat = 25 total
  - Salary Factor: (10 × 1.0) + (15 × 2.0) = 10 + 30 = 40

### Example 2b: Open Weekend Saturday Shift
- **Regular Guide (רגיל)**: Saturday 09:00 - Sunday 09:00
  - Hours: 10 Shabbat + 9 regular + 5 night = 24 total
  - Salary Factor: (10 × 2.0) + (9 × 1.0) + (5 × 1.5) = 20 + 9 + 7.5 = 36.5
- **Overlap Guide (חפיפה)**: Saturday 09:00 - Sunday 10:00
  - Hours: 10 Shabbat + 10 regular + 5 night = 25 total
  - Salary Factor: (10 × 2.0) + (10 × 1.0) + (5 × 1.5) = 20 + 10 + 7.5 = 37.5

### Example 3: Friday Standby (Closed Weekend)
- **Role**: כונן (Standby)
- **Day**: Friday
- **Hours**: 10 standby + 22 Shabbat standby = 32 total
- **Salary Factor**: (10 × 0.3) + (22 × 0.6) = 3 + 13.2 = 16.2

### Example 4: Closed Weekend Saturday Shift
- **Guide 1 (Former כונן)**: Saturday 17:00 - Sunday 10:00
  - Hours: 2 Shabbat + 5 regular + 8 night + 2 regular = 17 total
  - Salary Factor: (2 × 2.0) + (5 × 1.0) + (8 × 1.5) + (2 × 1.0) = 4 + 5 + 12 + 2 = 23
- **Guide 2 (מוצ״ש)**: Saturday 17:00 - Sunday 09:00
  - Hours: 2 Shabbat + 5 regular + 8 night + 1 regular = 16 total
  - Salary Factor: (2 × 2.0) + (5 × 1.0) + (8 × 1.5) + (1 × 1.0) = 4 + 5 + 12 + 1 = 22
- **Note**: Both guides work together from 17:00 Saturday onwards, with the former standby guide working 1 extra hour for handover

### Example 5: Holiday Calculations
- **Rosh Hashana Eve**: 2 guides working 09:00-10:00 next day
  - Hours: 10×1.0 + 14×2.0 = 24 total per guide
  - Salary Factor: (10 × 1.0) + (14 × 2.0) = 10 + 28 = 38
- **Rosh Hashana Day 1**: 2 guides working 09:00-09:00 next day
  - Hours: 24×2.0 = 24 total per guide
  - Salary Factor: (24 × 2.0) = 48 (highest possible for 24h shift)
- **Rosh Hashana Day 2**: 2 guides working 09:00-09:00 next day
  - Hours: 10×2.0 + 9×1.0 + 5×1.5 = 24 total per guide
  - Salary Factor: (10 × 2.0) + (9 × 1.0) + (5 × 1.5) = 20 + 9 + 7.5 = 36.5

## All Day Types Summary

### Complete List of Possible Day Types in the System

| Day Type | Hebrew Name | Guide Pattern | Hours | Multipliers | Special Notes |
|-----------|-------------|---------------|-------|-------------|---------------|
| **Weekday (Sun-Thu)** | יום חול | 1 רגיל + 1 חפיפה | 24h + 25h | ×1.0, ×1.5 | Standard 2-guide pattern |
| **Friday (Open Weekend)** | שישי (סופ״ש פתוח) | 1 רגיל + 1 חפיפה | 24h + 25h | ×1.0, ×2.0 | 2 guides, Shabbat from 19:00 |
| **Saturday (Open Weekend)** | שבת (סופ״ש פתוח) | 1 רגיל + 1 חפיפה | 24h + 25h | ×2.0, ×1.0, ×1.5 | 2 guides, mixed multipliers |
| **Friday (Closed Weekend)** | שישי (סופ״ש סגור) | 1 כונן only | 32h | ×0.3, ×0.6 | Standby only, continues to Saturday |
| **Saturday (Closed Weekend)** | שבת (סופ״ש סגור) | 1 כונן + 1 מוצ״ש | 17h + 16h | ×2.0, ×1.0, ×1.5 | Former standby + new guide |
| **Holiday Eve** | ערב חג | 1 רגיל + 1 חפיפה | 24h + 25h | ×1.0, ×2.0 | Like Friday, holiday from 19:00 |
| **Full Holiday** | חג מלא | 1 רגיל + 1 חפיפה | 24h + 25h | ×2.0 only | 24h of holiday multiplier |
| **Consecutive Holiday** | חג רצוף | 1 רגיל + 1 חפיפה | 24h + 25h | ×2.0 only | Multiple days of holiday |
| **Holiday + Shabbat** | חג + שבת | 1 רגיל + 1 חפיפה | 24h + 25h | ×2.0, ×1.0, ×1.5 | Extended holiday period |

### Day Type Categories

#### 1. **Standard Weekdays (Sunday-Thursday)**
- **Pattern**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Hours**: Regular (×1.0) + Night (×1.5)
- **Coverage**: 09:00 - 10:00 next day
- **Total**: 49 hours (24 + 25)

#### 2. **Open Weekend Days**
- **Friday**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Saturday**: 1 רגיל (24h) + 1 חפיפה (25h)
- **Pattern**: Always 2 guides, fresh each day
- **Total**: 98 hours (4 guides × 24-25h)

#### 3. **Closed Weekend Days**
- **Friday**: 1 כונן (32h standby)
- **Saturday**: 1 former כונן (17h) + 1 מוצ״ש (16h)
- **Pattern**: 1 guide Friday, 2 guides Saturday
- **Total**: 65 hours (32 + 17 + 16)

#### 4. **Holiday Days**
- **Pattern**: Always 1 רגיל (24h) + 1 חפיפה (25h)
- **Multipliers**: ×2.0 for holiday hours, ×1.0 for regular, ×1.5 for night
- **Coverage**: 09:00 - 10:00 next day
- **Total**: 49 hours (24 + 25)

### Multiplier Distribution by Day Type

| Day Type | ×0.3 | ×0.6 | ×1.0 | ×1.5 | ×2.0 | Total Multiplier |
|-----------|-------|-------|-------|-------|-------|------------------|
| **Weekday** | - | - | 33h | 16h | - | 49 |
| **Friday Open** | - | - | 20h | - | 28h | 48 |
| **Saturday Open** | - | - | 19h | 10h | 20h | 49 |
| **Friday Closed** | 10h | 22h | - | - | - | 16.2 |
| **Saturday Closed** | - | - | 15h | 16h | 4h | 35 |
| **Holiday Eve** | - | - | 20h | - | 28h | 48 |
| **Full Holiday** | - | - | - | - | 49h | 98 |

### Coverage Patterns

#### **Continuous Coverage (Open Weekend/Holiday)**
- **24/7 Coverage**: 2 guides always present
- **Handover**: Smooth transition between days
- **Cost**: Higher (more guides, more hours)

#### **Efficient Coverage (Closed Weekend)**
- **Limited Coverage**: 1 guide Friday, 2 guides Saturday
- **Handover**: Same guide Friday-Saturday
- **Cost**: Lower (fewer guides, standby rates)

#### **Holiday Coverage**
- **Premium Coverage**: Always 2 guides
- **Extended ×2.0**: Can have consecutive holiday multipliers
- **Cost**: Highest (holiday rates + overlap)

### Quick Reference: Day Type Decision Tree
```
Is it a Holiday? → YES → Always 2 guides (1 רגיל + 1 חפיפה)
                    ↓
                   NO
                    ↓
Is it Friday? → YES → Is it Open Weekend? → YES → 2 guides (1 רגיל + 1 חפיפה)
              ↓                                    ↓
             NO                                   NO
              ↓                                    ↓
Is it Saturday? → YES → Is it Open Weekend? → YES → 2 guides (1 רגיל + 1 חפיפה)
                ↓                                    ↓
               NO                                   NO
                ↓                                    ↓
              Weekday → Always 2 guides (1 רגיל + 1 חפיפה)
```

### Cost Comparison by Day Type
| Day Type | Total Hours | Total Salary Factor | Cost Level |
|-----------|-------------|---------------------|------------|
| **Weekday** | 49h | 49 | Low |
| **Open Weekend** | 98h | 98 | Medium |
| **Closed Weekend** | 65h | 51.2 | Low-Medium |
| **Holiday** | 49h | 98+ | High |

## Summary

1. **Categorizes hours** into 5 distinct types with different salary multipliers
2. **Applies weekend logic** to determine appropriate roles and hour distributions
3. **Calculates salary factors** using weighted multipliers for fair compensation
4. **Tracks detailed statistics** for workload balancing and reporting
5. **Handles special cases** like consecutive day restrictions and weekend continuity
6. **Provides flexible reporting** with CSV export and detailed breakdowns

The system ensures fair compensation while maintaining operational requirements and provides comprehensive tracking for management and planning purposes.
