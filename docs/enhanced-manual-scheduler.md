# Enhanced Manual Scheduler - Implementation Tasks

## 🎯 Project Overview

Create a drag-and-drop manual scheduler interface with:
- Guide cards showing real-time statistics
- Constraint visualization (pre-determined + dynamic)
- Dual-slot calendar (normal + overlap)
- Real-time salary factor calculations

## 📋 Detailed Task Breakdown

### Phase 1: Research & Analysis ✅
- [x] **1.1** Analyze existing manual scheduling API (`POST /api/schedule/manual`)
- [x] **1.2** Study current constraint system (constraints, fixed_constraints, vacations tables)
- [x] **1.3** Research salary factor calculations from reports.html
- [x] **1.4** Map guide statistics queries and data structure
- [x] **1.5** Document existing calendar rendering patterns
- [x] **1.6** Identify database schema requirements (no new tables needed)

### Phase 2: Backend API Development ✅
- [x] **2.1** Create `/backend/routes/enhanced-manual.js` route file
- [x] **2.2** Implement `GET /api/enhanced-manual/guides/:year/:month` (guide data with stats)
- [x] **2.3** Implement `GET /api/enhanced-manual/constraints/:guideId/:year/:month` (all constraints)
- [x] **2.4** Implement `POST /api/enhanced-manual/validate-assignment` (constraint checking)
- [x] **2.5** Implement `POST /api/enhanced-manual/assign` (create manual assignment)
- [x] **2.6** Implement `DELETE /api/enhanced-manual/assignment/:date/:slot` (remove assignment)
- [x] **2.7** Create `/backend/services/constraint-checker.js` (centralized validation)
- [x] **2.8** Create `/backend/services/salary-calculator.js` (factor calculations)
- [x] **2.9** Add API routes to main app.js

### Phase 3: Frontend HTML Structure ✅
- [x] **3.1** Create `/backend/public/enhanced-manual-scheduler.html` base structure
- [x] **3.2** Design Hebrew RTL layout with header navigation
- [x] **3.3** Create functionality buttons area (save, clear, etc.)
- [x] **3.4** Build guide cards container (horizontal strip)
- [x] **3.5** Design calendar grid with dual slots per day
- [x] **3.6** Add month/year navigation controls
- [x] **3.7** Style responsive layout for different screen sizes

### Phase 4: Guide Cards System ✅
- [x] **4.1** Create GuideCard component structure
- [x] **4.2** Implement guide selection/active state styling
- [x] **4.3** Add shift counter badge display
- [x] **4.4** Add salary factor hours display beneath name
- [x] **4.5** Implement real-time statistics updates
- [x] **4.6** Add drag handle and drag start functionality
- [x] **4.7** Handle disabled/constrained state styling
- [x] **4.8** Add click to select/highlight constraints feature

### Phase 5: Calendar & Drop Zones ✅
- [x] **5.1** Build calendar grid with Hebrew day names
- [x] **5.2** Create dual drop zones per day (normal + overlap)
- [x] **5.3** Implement drop zone visual feedback
- [x] **5.4** Add valid/invalid drop zone styling
- [x] **5.5** Handle assignment display in calendar slots
- [x] **5.6** Implement weekend/holiday visual indicators
- [x] **5.7** Add Israeli weekend logic (Fri/Sat)

### Phase 6: Constraint Visualization ✅
- [x] **6.1** Load and display pre-determined constraints
  - [x] Regular constraints from constraints table
  - [x] Fixed weekly constraints (fixed_constraints)
  - [x] Vacation periods (vacations table)
- [x] **6.2** Implement dynamic constraint generation
  - [x] Consecutive day prevention (day before/after)
  - [x] Weekend pairing rules for closed weekends
- [x] **6.3** Create constraint highlighting on calendar
- [x] **6.4** Add constraint reason tooltips
- [x] **6.5** Handle constraint updates after assignments
- [x] **6.6** Visual differentiation between constraint types

### Phase 7: Drag & Drop Implementation ✅
- [x] **7.1** Implement HTML5 drag and drop API
- [x] **7.2** Add drag start event handling
- [x] **7.3** Create drag over/enter/leave event handlers
- [x] **7.4** Implement drop event validation and processing
- [x] **7.5** Add visual drag feedback (ghost image, drop preview)
- [x] **7.6** Handle drag cancellation (ESC key, invalid drops)
- [x] **7.7** Add mobile touch support for drag operations

### Phase 8: Assignment Management ✅
- [x] **8.1** Implement assignment creation via drag-drop
- [x] **8.2** Add assignment removal functionality (right-click menu)
- [x] **8.3** Handle assignment conflict resolution
- [x] **8.4** Implement undo/redo functionality
- [x] **8.5** Add bulk assignment operations
- [x] **8.6** Create assignment validation before save
- [x] **8.7** Handle assignment persistence to database

### Phase 9: Real-time Statistics
- [ ] **9.1** Calculate salary factors with correct multipliers:
  - [ ] Regular shifts: ×1.0
  - [ ] Night shifts: ×1.5
  - [ ] Shabbat shifts: ×2.0
  - [ ] On-call (כונן): ×0.3
  - [ ] On-call Shabbat: ×0.6
  - [ ] Motzash: ×1.0
- [ ] **9.2** Update guide card counters after each assignment
- [ ] **9.3** Implement fairness indicators and warnings
- [ ] **9.4** Add month totals and averages display
- [ ] **9.5** Create workload balance visualization
- [ ] **9.6** Handle statistics export functionality

### Phase 10: User Experience Enhancements
- [ ] **10.1** Add keyboard shortcuts (Del for remove, ESC for cancel)
- [ ] **10.2** Implement context menus (right-click options)
- [ ] **10.3** Add loading states and progress indicators
- [ ] **10.4** Create confirmation dialogs for destructive actions
- [ ] **10.5** Add success/error notifications
- [ ] **10.6** Implement auto-save functionality
- [ ] **10.7** Handle offline/connection error scenarios

### Phase 11: Integration & Testing
- [ ] **11.1** Test integration with existing schedule system
- [ ] **11.2** Verify constraint validation works correctly
- [ ] **11.3** Test salary calculation accuracy vs reports page
- [ ] **11.4** Validate consecutive day prevention rules
- [ ] **11.5** Test Israeli weekend/holiday handling
- [ ] **11.6** Browser compatibility testing
- [ ] **11.7** Mobile responsiveness testing
- [ ] **11.8** Performance testing with large datasets

### Phase 12: Polish & Documentation
- [ ] **12.1** Finalize UI polish and animations
- [ ] **12.2** Add helpful user tooltips and guidance
- [ ] **12.3** Create user documentation/help system
- [ ] **12.4** Add accessibility features (ARIA labels, keyboard nav)
- [ ] **12.5** Optimize performance and loading times
- [ ] **12.6** Code cleanup and commenting
- [ ] **12.7** Add error logging and debugging tools

## 🎨 Design Specifications

### Guide Cards
- **Size**: Compact cards (~100px width)
- **Content**: Guide name, shift counter badge, salary hours
- **States**: Default, Selected, Disabled, Dragging
- **Layout**: Horizontal scrollable strip

### Calendar Slots
- **Structure**: 7 columns × ~5 rows for monthly view
- **Slots per day**: 2 (Normal shift, Overlap/חפיפה)
- **Visual feedback**: Green (valid), Red (invalid), Blue (assigned)
- **Hebrew support**: RTL layout, Hebrew day names

### Constraints Display
- **Pre-determined**: Red background with icon
- **Dynamic**: Orange background with reason
- **Tooltips**: Detailed constraint explanation
- **Visual hierarchy**: Clear differentiation between types

## 🔧 Technical Requirements

### Database Integration
- Use existing PostgreSQL schema
- Leverage `schedule` table with `is_manual=true`
- Query constraints from multiple tables
- No new migrations required

### API Design
- RESTful endpoints following existing patterns
- Hebrew error messages
- Proper validation and error handling
- Session-based state management

### Frontend Architecture
- Vanilla JavaScript (no frameworks)
- HTML5 drag-and-drop API
- CSS Grid for calendar layout
- Responsive design principles

## ⚠️ Critical Considerations

### Israeli Localization
- Weekend logic: Friday-Saturday
- Hebrew calendar integration
- RTL text direction
- Date format: dd-mm-yyyy

### Performance
- Efficient constraint checking
- Optimized DOM updates
- Minimal API calls
- Smooth drag operations

### Data Integrity
- Validation before database writes
- Conflict resolution
- Rollback mechanisms
- Audit trail maintenance

---

## 📝 Implementation Notes

This comprehensive task list breaks down the enhanced manual scheduler into manageable, specific tasks. Each task should be completed sequentially within phases, with testing after each major phase completion.

The implementation will build upon the existing codebase patterns while introducing the new drag-and-drop functionality and enhanced constraint visualization system.