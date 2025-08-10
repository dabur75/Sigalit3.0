# Rebuild Scheduler from Backup — Implementation Plan

Progress: 1/16 (6%)

- [x] 0. Kickoff
  - [x] Confirm backup files at `old-bckp/` (found `app_old.js`, `scheduler.html`, `organized_scheduler.html`)

- [x] 1. Backend module (single source of truth)
  - [x] Create `backend/services/scheduler.js`
  - [x] Implement helpers: `formatDateLocal`, `addDaysLocal`, `getHebrewWeekday`, `getAllDaysInMonth`
  - [x] Implement `loadMonthContext(year, month, pool)` to fetch guides, constraints, vacations, existing schedule, `weekend_types`
  - [x] Port `getWeekendType(date, weekdayNum, weekendTypes)` (Fri flag stored on Friday, Saturday reads Friday) — mirrored logic via `weekendTypes` map
  - [x] Port `determineShiftRequirements(weekdayNum, weekendType)`
  - [x] Implement `handleClosedSaturdayWeekend(fridayInfo, context)` (Friday כונן → Saturday continue + add מוצ״ש)
  - [x] Implement `assignDayOptimal(dayInfo, context)` (availability + fairness)
  - [x] Implement `runCompleteAutoScheduling(year, month, pool)` (compute → save → return stats)

- [x] 2. Backend endpoints
  - [x] POST `/api/schedule/auto/:year/:month` → calls `runCompleteAutoScheduling` (supports `?overwrite=true`)
  - [x] Keep `GET /api/weekend-types/:year/:month` (Friday keys, 'סופ״ש סגור' | 'סופ״ש פתוח')
  - [x] Ensure POST `/api/weekend-type/:date` stores only on Friday

- [ ] 3. Frontend refactor (`backend/public/scheduler.html`)
  - [ ] Remove in-page auto-scheduling logic (no client decisions)
  - [x] “Run Auto” button calls backend POST endpoint and refreshes calendar on success
  - [x] Ensure table renders only after data (no mock flicker)
  - [x] Keep manual edit UI exactly as-is

- [ ] 4. Validation and testing
  - [x] Seed or confirm Aug 2025: 2025-08-08 and 2025-08-22 are 'סופ״ש סגור'
  - [x] Run POST `/api/schedule/auto/2025/8?overwrite=true`
  - [x] Verify visually:
    - [x] Thu 7/8: regular (no כונן/מוצ״ש)
    - [x] Fri 8/8: כונן (one)
    - [x] Sat 9/8: same כונן + מוצ״ש
    - [x] Same for 22–23
  - [ ] Check column alignment (Sun→Sat) and no flicker

- [ ] 5. Stabilization
  - [ ] Add simple guardrails (max weekend shifts, basic traffic-light thresholds)
  - [ ] Log key decisions for traceability
  - [ ] Document behavior in `docs/SCHEDULING_RULES.md` to reflect backend ownership

- [ ] 6. Optional (later)
  - [ ] Unit tests for `services/scheduler.js`
  - [ ] Advanced fairness (scoring, historical balance)
  - [ ] UI explanations for auto decisions
