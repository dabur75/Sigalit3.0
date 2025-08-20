# Salary Factor Calculation Fix

## Problem Analysis
The frontend reports.html expects `salary_factor` calculations with specific multipliers:
- Regular hours: ×1.0
- Night hours: ×1.5 
- Shabbat hours: ×2.0
- Conan (standby) hours: ×0.3
- Conan Shabbat hours: ×0.6
- Motzash hours: ×1.0

However, the backend API `/api/schedule/enhanced-statistics/:year/:month` only returns raw hour counts without calculating the salary factors.

## Key Functions Found

### 1. API Endpoint: `/api/schedule/enhanced-statistics/:year/:month` (line 1170)
- Located in app.js
- Returns guide statistics but missing salary_factor calculations

### 2. Function: `calculateGuideStatisticsPG()` (line 3798)
- Calculates raw hours by type: regular_hours, night_hours, shabbat_hours, conan_hours, conan_shabbat_hours, motzash_hours
- Missing: salary_factor calculation using the multipliers

### 3. Frontend Expectations (reports.html line 586)
- Expects `guide.salary_factor` field 
- Shows multipliers in UI: רגיל ×1.0, לילה ×1.5, שבת ×2.0, כונן ×0.3, כונן שבת ×0.6, מוצ"ש ×1.0
- CSV export includes salary_factor field

## Todo Items

### [ ] 1. Add salary factor calculation to calculateGuideStatisticsPG function
- Modify the function to calculate total salary factor based on hours and multipliers
- Add salary_factor field to returned stats object

### [ ] 2. Update enhanced statistics endpoint to include salary_factor in averages
- Add salary_factor_per_guide to averages calculation
- Ensure proper calculation for active guides only

### [ ] 3. Test the salary factor calculations
- Verify multipliers match frontend expectations (×1.0, ×1.5, ×2.0, ×0.3, ×0.6, ×1.0)
- Test with sample data to ensure accurate calculations

### [ ] 4. Verify CSV export functionality
- Ensure salary_factor field is properly included in CSV export
- Test Hebrew text encoding in CSV

## Implementation Notes
- Keep changes minimal and focused on adding salary_factor calculation
- Use existing hour calculations, just apply the multipliers
- Maintain Hebrew RTL support and proper formatting