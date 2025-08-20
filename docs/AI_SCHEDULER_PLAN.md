## AI Monthly Scheduling – Proposal Workspace Plan (Claude 3 Haiku)

### Goals
- Replace complex in-code auto-scheduler with an AI proposer that drafts a full month and refines by day via chat.
- AI is proposer-only. Backend Validator is the law (zero hard-rule violations).
- Output is saved as a draft in the existing workflow once approved by the coordinator (רכז).
- Targets: 95%+ accurate, Hebrew explanations per day, <2s responses, 80%+ cache hit, cost < $0.10/month.

### Constraints and Conventions
- Frontend pages live under `backend/public/` (project rule).
- Israeli weekend logic (Fri/Sat), date display dd-mm-yyyy, local-midnight handling.
- No prod deploy or git push unless explicitly requested.

---

### Architecture Overview
- Proposer: Claude 3 Haiku (temperature 0, strict JSON schema, compact prompts).
- Validator (backend): deterministic enforcement of MUST rules, corrects or rejects.
- Caching: month context hash + per-day refinement cache to minimize token use.
- Storage: Use existing `drafts`/`workflow_status` tables; add AI session logs.
- UI: New page `backend/public/ai_scheduler.html` with month grid + chat panel.

---

### Endpoints (New)
1) POST `/api/schedule/ai/propose-month`
   - Input: `{ year, month, house_id }`
   - Behavior: Build compact month context → call Haiku → validate proposal → return `{ sessionId, proposal[], explanations[], stats, tokens, cost }`.
2) POST `/api/schedule/ai/refine-day`
   - Input: `{ sessionId, date, instructions }`
   - Behavior: Re-prompt only for that date with constraints → validate → update session state.
3) POST `/api/schedule/ai/approve-as-draft`
   - Input: `{ sessionId, draftName, notes }`
   - Behavior: Convert current session proposal to a workflow draft (uses existing create-draft flow) and return draft metadata.
4) GET `/api/schedule/ai/session/:sessionId`
   - Retrieve current proposal state, explanations, and chat history for reload.

5) POST `/api/schedule/ai/chat`
   - Input: `{ sessionId, message, date? }` (optional `date` to focus discussion/refinement on a specific day)
   - Behavior: Appends message to conversation, calls AI with conversation + context, may propose an updated day; backend validates any proposed change before returning. Returns `{ reply, updatedDay?, tokens, cost }`.
6) GET `/api/schedule/ai/chat/:sessionId`
   - Returns full chat transcript with timestamps and any associated changes per message.

Existing kept: `/api/workflow/*`, `/api/schedule-draft*`, `/api/schedule/remove-auto-scheduled/*`.

---

### Validator (MUST rules)
- No personal constraints violations (fixed, personal, vacations).
- No back-to-back days for a guide (closed Fri→Sat pairing exception if/when defined in bible).
- Weekend logic: Friday/Saturday roles and quantities as per bible and `weekend_types`.
- Coordinator rules: `no_auto_scheduling`, `manual_only`, `no_weekends`, `no_together`, `prevent_pair`, `no_conan`.
- House scoping; active guides only.
- On violation: drop offending assignment and record reason; never persist invalid.

### Heuristics (SHOULD rules – scored but not mandatory)
- Fair workload distribution (monthly) and recent-history cooling.
- Prefer diverse pairings and avoid repeatedly pairing the same two.
- Respect learned preferences where available.

---

### Chat and Interactive Refinement
- UI: The `ai_scheduler.html` page includes a right-side chat panel with:
  - Message input box (Hebrew), send button, and quick actions (e.g., “תעדף את אלדד”, “אל תזמן בסופי שבוע”, “החלף בין X ל-Y ביום 14”).
  - Day chips: clicking a date adds `date` context to the next message (focus refinement).
  - System shows AI replies with concise Hebrew reasoning and highlights updated days.
- Behavior:
  - Each chat message persists to a conversation store linked to `sessionId`.
  - If AI proposes changes, backend runs Validator; invalid assignments are dropped/annotated with reasons.
  - Users can explicitly say “זה לא נכון”/“יש פה בעיה” and describe corrections; AI re-proposes for that date.
- Storage (DB tables):
  - `ai_sessions(id TEXT PK, house_id INT, year INT, month INT, created_at TIMESTAMP, last_active TIMESTAMP, current_proposal JSONB)`
  - `ai_chat_messages(id SERIAL PK, session_id TEXT, ts TIMESTAMP, role VARCHAR(10), message TEXT, date TEXT NULL, model TEXT, input_tokens INT, output_tokens INT)`
  - Optionally link to `ai_usage` rows for per-message cost.

---

### Prompting and Schema
- Temperature 0, JSON-only completion.
- Minimal PII: use `id`, `name` only where needed.
- Proposal item schema:
```json
{
  "date": "YYYY-MM-DD",
  "assignments": [
    { "guide_id": number, "role": "רגיל|חפיפה|כונן|מוצ״ש" }
  ],
  "explanation_he": "string (Hebrew)"
}
```

---

### Budget and Performance Guardrails
- Cache invariant month context by hash (guides, constraints, weekend types, manual locks).
- Day refinements re-call only that day.
- Retry only on schema violations (once).
- Track tokens/cost per session; env caps: `AI_SOFT_CAP_USD` (e.g., 2), `AI_HARD_CAP_USD` (e.g., 4). Circuit break when exceeded.

---

### Cost and Usage Tracking (Token-Level Visibility)
- Purpose: Show exact token usage and estimated USD cost; provide a button in AI scheduler UI to display totals.
- Storage (DB table): `ai_usage`
  - `id SERIAL PK`, `created_at TIMESTAMP`, `house_id INT`, `session_id TEXT`, `endpoint TEXT` (propose-month/refine-day),
    `model TEXT`, `input_tokens INT`, `output_tokens INT`, `duration_ms INT`, `cost_usd NUMERIC(10,4)`.
- Pricing via env (provider-agnostic):
  - `AI_PRICE_INPUT_PER_MTOK` (e.g., 0.15), `AI_PRICE_OUTPUT_PER_MTOK` (e.g., 0.60). Cost = input/1e6*inPrice + output/1e6*outPrice.
  - Also store `model` to support per-model pricing overrides if needed later.
- Endpoints:
  - GET `/api/schedule/ai/usage/summary?house_id&from&to`
    - Returns `{ total_input_tokens, total_output_tokens, total_cost_usd, by_session: [...], by_endpoint: [...] }`.
  - GET `/api/schedule/ai/usage/sessions?house_id&from&to`
    - Returns session-level breakdown with timestamps and last activity.
- UI (`ai_scheduler.html`):
  - Add toolbar button: “הצג עלות AI” → modal showing totals for current month and session, with token breakdown and USD equivalent.
  - Show soft-cap/hard-cap indicators, and current remaining budget.
- Enforcement:
  - Before each call, check caps based on `SUM(cost_usd)` in range; deny call with friendly message if hard-cap exceeded.

---

### Implementation Steps (Phased)
1) Foundation
   - Add env config: `ANTHROPIC_API_KEY`, `AI_SOFT_CAP_USD`, `AI_HARD_CAP_USD`.
   - Create `backend/ai-scheduler/ClaudeHaikuAgent.js` (thin wrapper), `PromptTemplates.js` (Hebrew compact), `CacheManager.js`.
   - Add `backend/services/context-builder.js` to fetch compact month context.

2) Validator and Tests
   - Implement `backend/ai-scheduler/Validator.js` with all MUST rules.
   - Unit tests for edge cases (constraints, weekend types, consecutive days, coordinator rules).

3) API Layer
   - `backend/routes/ai-scheduling.js`: implement the four endpoints; session store, logging, usage accounting.
   - Wire routes into `app.js`.

4) UI: Proposal Workspace
   - Create `backend/public/ai_scheduler.html` (month grid + chat panel).
   - Actions: Generate month, click day → refine, approve-as-draft (calls workflow draft create route under the hood).
   - Show per-day Hebrew explanations and confidence indicator.

4.1) Chat Integration
   - Add chat panel with input, send, and quick-action buttons.
   - Implement `/api/schedule/ai/chat` and `/api/schedule/ai/chat/:sessionId` consumption.
   - Visual diffs for any day updated by a chat turn; validator messages shown inline.

5) Caching and Budget Controls
   - Implement month-context hashing; memoize propose-month by identical context.
   - Add usage/cost tracker and caps; clear UX on rate/usage limits.
   - Persist per-call usage in `ai_usage`; implement usage summary endpoints; add UI button/modal.

6) Observability
   - `backend/store/ai-logs.js`: store prompt versions, responses (redacted), validator diffs, decisions.
   - GET a session endpoint for audit.

7) Rollout
   - Keep old auto endpoints disabled; new AI workspace is isolated.
   - Side-by-side evaluation for a week (optional) before enabling one-click draft approval.

---

### Acceptance Criteria
- Full month proposal produced in <2s (with cache warm).
- Validator guarantees zero hard rule violations.
- Hebrew explanations per day are concise and factual.
- Approve-as-draft creates an entry visible in existing workflow UI.
- Budget guardrails respected; logs show token/cost per session.

### Open Questions
- Closed weekend Fri→Sat exception exact wording in bible (MUST/WHEN?).
- Auto-apply after validation vs always human-approve? (Current plan: human approval.)
- Do we need per-house multi-session support simultaneously? (Default: yes; session keyed by house+month.)

---

### Answers to Open Questions (Decisions)
- Closed weekend Fri→Sat exception: MUST allow the same guide to continue from Friday כונן to Saturday closed-weekend context only as כונן continuation. Saturday may add a separate guide for מוצ״ש. No other back-to-back assignments are allowed across any two consecutive calendar days. This exception applies only WHEN `weekend_types[Friday]` is closed.
- Apply policy: Always human-approve. AI proposals (month or refinements) do not persist to `schedule` automatically. On approval, proposals are saved as a draft via the workflow. A future feature flag can enable auto-apply after validation if needed.
- Multi-session scope: YES. Support multiple concurrent sessions per house and month. Session key = `(house_id, year, month, random_suffix)`; latest-active session is default in the UI with a selector to switch. Enforce a reasonable cap (e.g., 5 active sessions per house-month) and archive older ones.

### Task Checklist
- [ ] Env vars and SDK wiring (Anthropic)
- [ ] Context builder (compact, cacheable)
- [ ] Validator + unit tests (all MUST rules)
- [ ] Claude agent wrapper + prompt templates (Hebrew, JSON-only)
- [ ] New endpoints (`propose-month`, `refine-day`, `approve-as-draft`, `session/:id`)
- [ ] Session store + logs + budget guard
- [ ] UI page `ai_scheduler.html` (calendar + chat)
- [ ] Integrate draft approval with workflow
- [ ] QA: constraints, weekend types, consecutive days, coordinator rules
- [ ] Performance check + token/cost verification


