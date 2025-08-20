'use strict';

const express = require('express');
const router = express.Router();

const ClaudeHaikuAgent = require('../ai-scheduler/ClaudeHaikuAgent');
const PromptTemplates = require('../ai-scheduler/PromptTemplates');
const CacheManager = require('../ai-scheduler/CacheManager');
const { validateMonthlyProposal } = require('../ai-scheduler/Validator');
const { buildMonthContext } = require('../services/context-builder');
const { pool } = require('../database/postgresql');

const cache = new CacheManager();
const sessions = new Map(); // sessionId -> { house_id, year, month, proposal, createdAt }

// Helper: enrich assignments with guide_name for UI rendering
async function attachGuideNames(proposal) {
  try {
    const res = await pool.query('SELECT id, name FROM users');
    const idToName = new Map(res.rows.map(r => [r.id, r.name]));
    return (proposal || []).map(d => ({
      ...d,
      assignments: (d.assignments || []).map(a => ({ ...a, guide_name: idToName.get(a.guide_id) || null }))
    }));
  } catch (e) {
    return proposal;
  }
}

// Persist sessions to DB so they survive restarts
let tablesReadyPromise;
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_sessions (
      id TEXT PRIMARY KEY,
      house_id VARCHAR(50),
      year INT,
      month INT,
      proposal JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
}
function ensureTablesOnce() {
  if (!tablesReadyPromise) tablesReadyPromise = ensureTables();
  return tablesReadyPromise;
}
async function saveSessionToDb(session) {
  await ensureTablesOnce();
  const { id, house_id, year, month, proposal } = session;
  await pool.query(
    `INSERT INTO ai_sessions (id, house_id, year, month, proposal)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (id) DO UPDATE SET house_id = EXCLUDED.house_id, year = EXCLUDED.year, month = EXCLUDED.month, proposal = EXCLUDED.proposal`,
    [id, house_id || null, year, month, JSON.stringify(proposal || [])]
  );
}
async function getSessionFromDb(sessionId) {
  await ensureTablesOnce();
  const r = await pool.query(`SELECT * FROM ai_sessions WHERE id = $1`, [sessionId]);
  return r.rows[0] || null;
}

// Attempt to repair a truncated JSON array by trimming to the last balanced index
function repairJsonArrayOutput(rawText) {
  if (!rawText || rawText[0] !== '[') return rawText;
  // Fast path
  try { JSON.parse(rawText); return rawText; } catch (_) {}
  let inString = false;
  let escape = false;
  let depth = 0;
  let lastBalancedIdx = -1;
  for (let i = 0; i < rawText.length; i++) {
    const ch = rawText[i];
    if (inString) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = false; continue; }
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[' || ch === '{') depth++;
    if (ch === ']' || ch === '}') depth--;
    if (depth === 0 && ch === ']') lastBalancedIdx = i;
  }
  if (lastBalancedIdx > 0) {
    const trimmed = rawText.slice(0, lastBalancedIdx + 1);
    try { JSON.parse(trimmed); return trimmed; } catch (_) {}
  }
  return rawText;
}

// Enhanced repair: normalize escaped quotes and reassemble array from complete objects
function repairJsonArrayOutputEnhanced(rawText) {
  if (typeof rawText !== 'string') return rawText;
  // Normalize escaped quotes inside strings (e.g., סופ\"ש -> סופ״ש)
  let text = rawText.replace(/\\"/g, '״');
  // Remove trailing commas before } or ]
  text = text.replace(/,(\s*[}\]])/g, '$1');
  try { JSON.parse(text); return text; } catch (_) {}
  // Try trimming to last balanced closing bracket
  const trimmed = repairJsonArrayOutput(text);
  try { JSON.parse(trimmed); return trimmed; } catch (_) {}
  // Reassemble by extracting complete top-level objects within the array
  if (!trimmed.startsWith('[')) return trimmed;
  let i = 0;
  // Skip until first '{'
  while (i < trimmed.length && trimmed[i] !== '{') i++;
  const objs = [];
  for (; i < trimmed.length; i++) {
    if (trimmed[i] === '{') {
      let depth = 0, inStr = false, esc = false;
      const start = i;
      for (; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (inStr) {
          if (esc) { esc = false; continue; }
          if (ch === '\\') { esc = true; continue; }
          if (ch === '"') { inStr = false; continue; }
        } else {
          if (ch === '"') inStr = true;
          else if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              const objStr = trimmed.slice(start, i + 1);
              objs.push(objStr);
              break;
            }
          }
        }
      }
    }
  }
  if (objs.length > 0) {
    const rebuilt = `[${objs.join(',')}]`;
    try { JSON.parse(rebuilt); return rebuilt; } catch (_) {}
  }
  return text;
}

// Helper: record usage cost
async function recordUsage({ house_id, sessionId, endpoint, model, usage, durationMs }) {
  try {
    const inPrice = parseFloat(process.env.AI_PRICE_INPUT_PER_MTOK || '0.15');
    const outPrice = parseFloat(process.env.AI_PRICE_OUTPUT_PER_MTOK || '0.60');
    const cost = (usage.input_tokens / 1_000_000) * inPrice + (usage.output_tokens / 1_000_000) * outPrice;
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ai_usage (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        house_id INT,
        session_id TEXT,
        endpoint TEXT,
        model TEXT,
        input_tokens INT,
        output_tokens INT,
        duration_ms INT,
        cost_usd NUMERIC(10,4)
      )`);
    const houseIdNum = Number(house_id);
    await pool.query(
      `INSERT INTO ai_usage (house_id, session_id, endpoint, model, input_tokens, output_tokens, duration_ms, cost_usd)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [Number.isFinite(houseIdNum) ? houseIdNum : null, sessionId || null, endpoint, model, usage.input_tokens, usage.output_tokens, durationMs || null, cost.toFixed(4)]
    );
    return cost;
  } catch (e) {
    console.error('ai_usage insert failed:', e.message);
    return 0;
  }
}

// Soft/hard cap check
async function checkBudgetCap() {
  try {
    const hardCap = parseFloat(process.env.AI_HARD_CAP_USD || '4');
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        house_id INT,
        session_id TEXT,
        endpoint TEXT,
        model TEXT,
        input_tokens INT,
        output_tokens INT,
        duration_ms INT,
        cost_usd NUMERIC(10,4)
      );
      SELECT COALESCE(SUM(cost_usd),0) AS total FROM ai_usage WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE);
    `);
    const total = parseFloat(result[1]?.rows?.[0]?.total || '0');
    if (total >= hardCap) {
      return { allowed: false, total, hardCap };
    }
    return { allowed: true, total, hardCap };
  } catch (e) {
    console.error('Budget cap check failed:', e.message);
    return { allowed: true, total: 0, hardCap: parseFloat(process.env.AI_HARD_CAP_USD || '4') };
  }
}

// POST /api/schedule/ai/propose-month
router.post('/propose-month', async (req, res) => {
  const start = Date.now();
  try {
    const { year, month, house_id = 1, force = false } = req.body;

    const cap = await checkBudgetCap();
    if (!cap.allowed) {
      return res.status(429).json({ success: false, error: `AI monthly budget exceeded (${cap.total.toFixed(2)} / ${cap.hardCap})` });
    }

    // Build context (cache by hash)
    let context;
    try {
      context = await buildMonthContext({ house_id, year, month });
    } catch (e) {
      return res.status(500).json({ success: false, error: `context-build-failed: ${e.message}` });
    }
    const cacheKey = cache.keyFromObject({ k: 'propose-month', context });
    const cached = !force && cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, cached: true, ...cached });
    }

    // Compose AI call
    const agent = new ClaudeHaikuAgent();
    const system = PromptTemplates.systemMonthly();
    // Reduce output length and risk by requesting in two halves (1-15, 16-31)
    const firstHalf = PromptTemplates.userMonthlyRange(context, `${year}-${String(month).padStart(2,'0')}-01`, `${year}-${String(month).padStart(2,'0')}-15`);
    const secondHalf = PromptTemplates.userMonthlyRange(context, `${year}-${String(month).padStart(2,'0')}-16`, `${year}-${String(month).padStart(2,'0')}-31`);

    const r1 = await agent.sendMessage({ system, messages: [{ role: 'user', content: firstHalf }] });
    const r2 = await agent.sendMessage({ system, messages: [{ role: 'user', content: secondHalf }] });
    const usage = { input_tokens: (r1.usage.input_tokens||0)+(r2.usage.input_tokens||0), output_tokens: (r1.usage.output_tokens||0)+(r2.usage.output_tokens||0) };
    const text = `[${[r1.text, r2.text].map(t => t && t.trim().replace(/^\[/,'').replace(/\]$/,'')).join(',')}]`;

    // Parse JSON output
    let rawProposal = [];
    let parseFailed = false;
    try {
      rawProposal = JSON.parse(text);
    } catch (e) {
      parseFailed = true;
      const repaired = repairJsonArrayOutputEnhanced(text);
      try {
        rawProposal = JSON.parse(repaired);
        parseFailed = false;
      } catch (_) {
        // keep parseFailed = true and continue to fallback below
      }
    }

    // Fallback: day-by-day if monthly parse failed or suspicious output
    if (parseFailed || !Array.isArray(rawProposal) || rawProposal.length < 10) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const refined = [];
      let fallbackUsage = { input_tokens: 0, output_tokens: 0 };
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const systemRef = PromptTemplates.systemRefine();
        const userRef = PromptTemplates.userRefine({ date: dateStr, instructions: '', context, currentDay: null });
        try {
          const r = await agent.sendMessage({ system: systemRef, messages: [{ role: 'user', content: userRef }] });
          fallbackUsage.input_tokens += r.usage.input_tokens || 0;
          fallbackUsage.output_tokens += r.usage.output_tokens || 0;
          let obj = null;
          // Try direct parse
          try {
            obj = JSON.parse(r.text);
          } catch (_) {
            // Attempt minimal repairs for single object
            let t = r.text.replace(/\\"/g, '״').replace(/,(\s*[}\]])/g, '$1');
            // Extract first balanced object
            const startIdx = t.indexOf('{');
            if (startIdx >= 0) {
              let depth = 0, inStr = false, esc = false;
              for (let i = startIdx; i < t.length; i++) {
                const ch = t[i];
                if (inStr) {
                  if (esc) { esc = false; continue; }
                  if (ch === '\\') { esc = true; continue; }
                  if (ch === '"') { inStr = false; continue; }
                } else {
                  if (ch === '"') inStr = true;
                  else if (ch === '{') depth++;
                  else if (ch === '}') { depth--; if (depth === 0) { const slice = t.slice(startIdx, i+1); try { obj = JSON.parse(slice); } catch(_){}; break; } }
                }
              }
            }
          }
          if (obj && obj.date === dateStr && Array.isArray(obj.assignments)) {
            refined.push(obj);
          }
        } catch (err) {
          // skip this day on error
        }
      }
      if (refined.length > 0) {
        rawProposal = refined;
        usage.input_tokens += fallbackUsage.input_tokens;
        usage.output_tokens += fallbackUsage.output_tokens;
      } else if (parseFailed) {
        return res.status(502).json({ success: false, error: 'Invalid AI JSON output', details: 'Failed to parse monthly and daily outputs', raw: text });
      }
    }

    // Pre-sanitize: if a day has empty assignments but explanation mentions numeric IDs, extract up to 2 valid guide IDs
    const guideIdSet = new Set(context.guides.map(g => g.id));
    const repaired = (rawProposal || []).map(d => {
      if (d && Array.isArray(d.assignments) && d.assignments.length > 0) return d;
      const text = (d && d.explanation_he) || '';
      const ids = Array.from(text.matchAll(/\b(\d{1,6})\b/g)).map(m => Number(m[1]))
        .filter(n => guideIdSet.has(n));
      const unique = Array.from(new Set(ids)).slice(0, 2);
      if (unique.length > 0) {
        return { ...d, assignments: unique.map(id => ({ guide_id: id, role: 'רגיל' })) };
      }
      return d;
    });

    // Validate & sanitize
    const { proposal, warnings, stats } = validateMonthlyProposal(context, repaired);

    // Attach guide names for UI convenience
    const proposalWithNames = await attachGuideNames(proposal);

    // Session id (opaque)
    const sessionId = `${house_id}-${year}-${month}-${Date.now().toString(36)}`;

    const durationMs = Date.now() - start;
    const cost = await recordUsage({ house_id, sessionId, endpoint: 'propose-month', model: agent.model, usage, durationMs });

    const payload = { sessionId, proposal: proposalWithNames, warnings, stats, usage, cost, durationMs };
    cache.set(cacheKey, payload, 2 * 60 * 1000); // 2 min
    const sessionObj = { id: sessionId, house_id, year, month, proposal: proposalWithNames, createdAt: new Date().toISOString() };
    sessions.set(sessionId, sessionObj);
    await saveSessionToDb(sessionObj);

    res.json({ success: true, ...payload });
  } catch (error) {
    console.error('propose-month error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/schedule/ai/refine-day
router.post('/refine-day', async (req, res) => {
  const start = Date.now();
  try {
    const { sessionId, date, instructions = '' } = req.body;
    if (!sessionId || !date) return res.status(400).json({ success: false, error: 'sessionId and date are required' });
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const context = await buildMonthContext({ house_id: session.house_id, year: session.year, month: session.month });
    // If day is manual, do not allow AI refinement
    const isManual = (context.manualAssignments || []).some(m => m.date === date && (m.guide1_id || m.guide2_id));
    if (isManual) {
      const durationMs = Date.now() - start;
      await recordUsage({ house_id: session.house_id, sessionId, endpoint: 'refine-day', model: 'skip-manual', usage: { input_tokens: 0, output_tokens: 0 }, durationMs });
      return res.json({ success: true, updated: false, warnings: [{ date, type: 'manual_day' }] });
    }
    const agent = new ClaudeHaikuAgent();
    const system = PromptTemplates.systemRefine();
    const user = PromptTemplates.userRefine({ date, instructions, context, currentDay: null });
    const { text, usage } = await agent.sendMessage({ system, messages: [{ role: 'user', content: user }] });

    let obj;
    try { obj = JSON.parse(text); } catch (_) {
      const t = text.replace(/\\"/g, '״').replace(/,(\s*[}\]])/g, '$1');
      try { obj = JSON.parse(t); } catch (e2) {
        return res.status(502).json({ success: false, error: 'Invalid AI JSON output', details: e2.message, raw: text });
      }
    }

    // Validate single day by wrapping into proposal
    const { proposal, warnings } = validateMonthlyProposal(context, [obj]);
    if (proposal.length === 0) {
      const durationMs = Date.now() - start;
      await recordUsage({ house_id: session.house_id, sessionId, endpoint: 'refine-day', model: agent.model, usage, durationMs });
      return res.json({ success: true, updated: false, warnings });
    }

    // Update session proposal for that date
    const idx = (session.proposal || []).findIndex(d => d.date === date);
    if (idx >= 0) session.proposal[idx] = proposal[0]; else (session.proposal || (session.proposal = [])).push(proposal[0]);

    const durationMs = Date.now() - start;
    await recordUsage({ house_id: session.house_id, sessionId, endpoint: 'refine-day', model: agent.model, usage, durationMs });

    res.json({ success: true, updated: true, day: proposal[0], warnings });
  } catch (error) {
    console.error('refine-day error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/schedule/ai/approve-as-draft
router.post('/approve-as-draft', async (req, res) => {
  try {
    const { sessionId, draftName = '', notes = '' } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const monthStr = `${session.year}-${String(session.month).padStart(2,'0')}`;
    const scheduleData = session.proposal || [];

    // Compute next version for this month
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Avoid parameter inference: compute next version using literal
      const verSql = `SELECT COALESCE(MAX(version), 0)::int + 1 AS next_ver FROM drafts WHERE month = '${monthStr}'::varchar`;
      const verRes = await client.query(verSql);
      const nextVer = verRes.rows[0]?.next_ver || 1;
      // Insert draft using 'data' column (jsonb)
      try {
        const safeName = (draftName || `AI Proposal ${monthStr}`).replace(/'/g, "''");
        const jsonStr = JSON.stringify(scheduleData);
        const insertDraftSql = `INSERT INTO drafts (month, version, name, data, created_by)
           VALUES ('${monthStr}'::varchar, ${nextVer}::int, '${safeName}'::varchar, ($$${jsonStr}$$)::jsonb, NULL)`;
        await client.query(insertDraftSql);
      } catch (e) {
        console.error('approve-as-draft insert drafts error:', e.message);
        throw e;
      }
      try {
        const upsertWsSql = `INSERT INTO workflow_status (month, current_draft_version, is_finalized)
           VALUES ('${monthStr}'::varchar, ${nextVer}::int, false)
           ON CONFLICT (month) DO UPDATE SET current_draft_version = ${nextVer}::int, updated_at = NOW()`;
        await client.query(upsertWsSql);
      } catch (e) {
        console.error('approve-as-draft upsert workflow_status error:', e.message);
        throw e;
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    res.json({ success: true, month: monthStr });
  } catch (error) {
    console.error('approve-as-draft error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/schedule/ai/overwrite-draft
// Quick robust path: overwrite latest draft for the month with current session proposal
router.post('/overwrite-draft', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: 'sessionId is required' });
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const monthStr = `${session.year}-${String(session.month).padStart(2,'0')}`;
    if (!/^\d{4}-\d{2}$/.test(monthStr)) return res.status(400).json({ success: false, error: 'Invalid month format' });
    const scheduleData = session.proposal || [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Get latest draft version for month
      const verRes = await client.query(`SELECT MAX(version) AS ver FROM drafts WHERE month = '${monthStr}'::varchar`);
      const ver = verRes.rows[0]?.ver;
      if (!ver) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, error: 'No draft exists for this month. Create one first.' });
      }
      // Update only data using a single parameter (json) to avoid type inference issues
      const jsonStr = JSON.stringify(scheduleData);
      const updateSql = `UPDATE drafts SET data = ($$${jsonStr}$$)::jsonb WHERE month = '${monthStr}'::varchar AND version = ${ver}::int`;
      await client.query(updateSql);
      await client.query('COMMIT');
      res.json({ success: true, month: monthStr, version: ver });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('overwrite-draft error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/schedule/ai/session/:sessionId
router.get('/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  let s = sessions.get(sessionId);
  if (!s) s = await getSessionFromDb(sessionId);
  if (!s) return res.status(404).json({ success: false, error: 'Session not found' });
  return res.json({ success: true, session: s });
});

// GET /api/schedule/ai/existing-schedule/:year/:month/:house_id
router.get('/existing-schedule/:year/:month/:house_id', async (req, res) => {
  try {
    const { year, month, house_id } = req.params;
    
    // Get manual assignments from schedule table
    const manualQuery = `
      SELECT 
        s.date::text as date,
        s.guide1_id,
        s.guide2_id,
        u1.name as guide1_name,
        u2.name as guide2_name,
        'רגיל' as guide1_role,
        'רגיל' as guide2_role
      FROM schedule s
      LEFT JOIN users u1 ON s.guide1_id = u1.id
      LEFT JOIN users u2 ON s.guide2_id = u2.id
      WHERE EXTRACT(YEAR FROM s.date) = $1 
        AND EXTRACT(MONTH FROM s.date) = $2
        AND (s.guide1_id IS NOT NULL OR s.guide2_id IS NOT NULL)
      ORDER BY s.date
    `;
    
    const manualResult = await pool.query(manualQuery, [year, month]);
    
    // Transform to calendar format
    const schedule = manualResult.rows.map(row => {
      const assignments = [];
      
      if (row.guide1_id) {
        assignments.push({
          guide_id: row.guide1_id,
          guide_name: row.guide1_name,
          role: row.guide1_role
        });
      }
      
      if (row.guide2_id) {
        assignments.push({
          guide_id: row.guide2_id,
          guide_name: row.guide2_name,
          role: row.guide2_role
        });
      }
      
      return {
        date: row.date,
        assignments,
        explanation_he: 'שיבוץ קיים מוגן',
        is_manual: true,
        is_protected: true
      };
    });
    
    res.json({ success: true, schedule, count: schedule.length });
    
  } catch (error) {
    console.error('Get existing schedule error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/schedule/ai/usage/summary?house_id&from&to
router.get('/usage/summary', async (req, res) => {
  try {
    const { house_id, from, to } = req.query;
    const where = [];
    if (house_id) where.push(`house_id = '${house_id}'`);
    if (from) where.push(`created_at >= '${from}'::date`);
    if (to) where.push(`created_at < ('${to}'::date + INTERVAL '1 day')`);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalsSql = `SELECT COALESCE(SUM(input_tokens),0) AS in_tok, COALESCE(SUM(output_tokens),0) AS out_tok, COALESCE(SUM(cost_usd),0) AS cost FROM ai_usage ${whereSql}`;
    const byEndpointSql = `SELECT endpoint, COALESCE(SUM(input_tokens),0) AS in_tok, COALESCE(SUM(output_tokens),0) AS out_tok, COALESCE(SUM(cost_usd),0) AS cost FROM ai_usage ${whereSql} GROUP BY endpoint ORDER BY endpoint`;
    const [totals, byEndpoint] = await Promise.all([
      pool.query(totalsSql),
      pool.query(byEndpointSql),
    ]);
    res.json({
      success: true,
      total_input_tokens: parseInt(totals.rows[0].in_tok, 10),
      total_output_tokens: parseInt(totals.rows[0].out_tok, 10),
      total_cost_usd: Number(totals.rows[0].cost),
      by_endpoint: byEndpoint.rows,
      range: { from: from || null, to: to || null },
      house_id: house_id || null,
    });
  } catch (error) {
    console.error('usage/summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/schedule/ai/usage/sessions?house_id&from&to
router.get('/usage/sessions', async (req, res) => {
  try {
    const { house_id, from, to } = req.query;
    const where = [];
    if (house_id) where.push(`house_id = '${house_id}'`);
    if (from) where.push(`created_at >= '${from}'::date`);
    if (to) where.push(`created_at < ('${to}'::date + INTERVAL '1 day')`);
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const sql = `
      SELECT session_id,
             MIN(created_at) AS started_at,
             MAX(created_at) AS last_used_at,
             COALESCE(SUM(input_tokens),0) AS in_tok,
             COALESCE(SUM(output_tokens),0) AS out_tok,
             COALESCE(SUM(cost_usd),0) AS cost
      FROM ai_usage
      ${whereSql}
      GROUP BY session_id
      ORDER BY last_used_at DESC NULLS LAST
    `;
    const r = await pool.query(sql);
    res.json({ success: true, sessions: r.rows });
  } catch (error) {
    console.error('usage/sessions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/schedule/ai/enhance-existing
// New endpoint for enhancement mode - takes existing schedule and enhances it
// DISABLED - These enhancement endpoints were causing consecutive day violations
// Use propose-month for clean scheduling instead
/*
router.post('/enhance-existing', async (req, res) => {
  const start = Date.now();
  try {
    const { year, month, house_id = 1, existingSchedule = [], force = false } = req.body;

    const cap = await checkBudgetCap();
    if (!cap.allowed) {
      return res.status(429).json({ success: false, error: `AI monthly budget exceeded (${cap.total.toFixed(2)} / ${cap.hardCap})` });
    }

    // Build context (cache by hash)
    let context;
    try {
      context = await buildMonthContext({ house_id, year, month });
    } catch (e) {
      return res.status(500).json({ success: false, error: `context-build-failed: ${e.message}` });
    }

    // Add existing schedule to context for enhancement mode
    context.existingSchedule = existingSchedule;
    context.allExistingAssignments = existingSchedule || [];

    const cacheKey = cache.keyFromObject({ k: 'enhance-existing', context });
    const cached = !force && cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, cached: true, ...cached });
    }

    // Compose AI call for enhancement mode
    const agent = new ClaudeHaikuAgent();
    const system = PromptTemplates.systemMonthly();
    
    // Use userMonthly (not userMonthlyRange) for enhancement with existing data
    const userPrompt = PromptTemplates.userMonthly(context);

    const response = await agent.sendMessage({ system, messages: [{ role: 'user', content: userPrompt }] });
    const usage = { input_tokens: response.usage.input_tokens || 0, output_tokens: response.usage.output_tokens || 0 };
    const text = response.text;

    // Parse JSON output with enhanced repair
    let rawProposal = [];
    let parseFailed = false;
    try {
      rawProposal = JSON.parse(text);
    } catch (e) {
      parseFailed = true;
      const repaired = repairJsonArrayOutputEnhanced(text);
      try {
        rawProposal = JSON.parse(repaired);
        parseFailed = false;
      } catch (_) {
        // keep parseFailed = true and continue to fallback below
      }
    }

    // Fallback: day-by-day if monthly parse failed
    if (parseFailed || !Array.isArray(rawProposal) || rawProposal.length < 10) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const refined = [];
      let fallbackUsage = { input_tokens: 0, output_tokens: 0 };
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const currentDay = existingSchedule.find(d => d.date === dateStr) || null;
        const systemRef = PromptTemplates.systemRefine();
        const userRef = PromptTemplates.userRefine({ date: dateStr, instructions: 'שפר או מלא יום זה', context, currentDay });
        try {
          const r = await agent.sendMessage({ system: systemRef, messages: [{ role: 'user', content: userRef }] });
          fallbackUsage.input_tokens += r.usage.input_tokens || 0;
          fallbackUsage.output_tokens += r.usage.output_tokens || 0;
          let obj = null;
          try {
            obj = JSON.parse(r.text);
          } catch (_) {
            // Attempt minimal repairs for single object
            let t = r.text.replace(/\\\"/g, '״').replace(/,(\s*[}\]])/g, '$1');
            const startIdx = t.indexOf('{');
            if (startIdx >= 0) {
              let depth = 0, inStr = false, esc = false;
              for (let i = startIdx; i < t.length; i++) {
                const ch = t[i];
                if (inStr) {
                  if (esc) { esc = false; continue; }
                  if (ch === '\\') { esc = true; continue; }
                  if (ch === '"') { inStr = false; continue; }
                } else {
                  if (ch === '"') inStr = true;
                  else if (ch === '{') depth++;
                  else if (ch === '}') { depth--; if (depth === 0) { const slice = t.slice(startIdx, i+1); try { obj = JSON.parse(slice); } catch(_){}; break; } }
                }
              }
            }
          }
          if (obj && obj.date === dateStr && Array.isArray(obj.assignments)) {
            refined.push(obj);
          }
        } catch (err) {
          // skip this day on error
        }
      }
      if (refined.length > 0) {
        rawProposal = refined;
        usage.input_tokens += fallbackUsage.input_tokens;
        usage.output_tokens += fallbackUsage.output_tokens;
      } else if (parseFailed) {
        return res.status(502).json({ success: false, error: 'Invalid AI JSON output', details: 'Failed to parse monthly and daily outputs', raw: text });
      }
    }

    // Pre-sanitize: if a day has empty assignments but explanation mentions numeric IDs, extract up to 2 valid guide IDs
    const guideIdSet = new Set(context.guides.map(g => g.id));
    const repaired = (rawProposal || []).map(d => {
      if (d && Array.isArray(d.assignments) && d.assignments.length > 0) return d;
      const text = (d && d.explanation_he) || '';
      const ids = Array.from(text.matchAll(/\b(\d{1,6})\b/g)).map(m => Number(m[1]))
        .filter(n => guideIdSet.has(n));
      const unique = Array.from(new Set(ids)).slice(0, 2);
      if (unique.length > 0) {
        return { ...d, assignments: unique.map(id => ({ guide_id: id, role: 'רגיל' })) };
      }
      return d;
    });

    // Validate & sanitize with enhancement mode
    const { proposal, warnings, stats, completionStatus } = validateMonthlyProposal(context, repaired);

    // Attach guide names for UI convenience
    const proposalWithNames = await attachGuideNames(proposal);

    // Session id (opaque)
    const sessionId = `enhance-${house_id}-${year}-${month}-${Date.now().toString(36)}`;

    const durationMs = Date.now() - start;
    const cost = await recordUsage({ house_id, sessionId, endpoint: 'enhance-existing', model: agent.model, usage, durationMs });

    const payload = { sessionId, proposal: proposalWithNames, warnings, stats, completionStatus, usage, cost, durationMs };
    cache.set(cacheKey, payload, 2 * 60 * 1000); // 2 min
    const sessionObj = { id: sessionId, house_id, year, month, proposal: proposalWithNames, createdAt: new Date().toISOString() };
    sessions.set(sessionId, sessionObj);
    await saveSessionToDb(sessionObj);

    res.json({ success: true, ...payload });
  } catch (error) {
    console.error('enhance-existing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
*/

// POST /api/schedule/ai/enhance-simple
// DISABLED - Enhancement endpoints cause consecutive day violations
/*
// Simplified AI enhancement - fill empty days only, preserve manual assignments
router.post('/enhance-simple', async (req, res) => {
  const start = Date.now();
  try {
    const { year, month, house_id = 'dror', existingSchedule = [] } = req.body;

    console.log('🤖 Simple AI Enhancement requested:', { year, month, existingDays: existingSchedule.length });

    // Basic budget check
    const cap = await checkBudgetCap();
    if (!cap.allowed) {
      return res.status(429).json({ 
        success: false, 
        error: `AI budget exceeded (${cap.total.toFixed(2)} / ${cap.hardCap})` 
      });
    }

    // Build context
    let context;
    try {
      context = await buildMonthContext({ house_id, year, month });
      console.log('📊 Context built:', { guides: context.guides?.length, constraints: context.constraints?.length });
    } catch (e) {
      return res.status(500).json({ success: false, error: `Context build failed: ${e.message}` });
    }

    // Identify manual vs empty days
    const manualDays = existingSchedule.filter(d => d.is_manual);
    const emptyDays = existingSchedule.filter(d => d.is_empty || !d.assignments || d.assignments.length === 0);
    
    console.log(`📋 Schedule analysis: ${manualDays.length} manual days, ${emptyDays.length} empty days to fill`);

    // Simple AI prompt - just fill empty days
    const agent = new ClaudeHaikuAgent();
    const system = [
      '🏥 You are scheduling guides for an Israeli residential home.',
      '🎯 MISSION: Fill empty days only. DO NOT modify manual assignments.',
      '',
      '🚫 CRITICAL RULES:',
      '- No consecutive days for same guide (except Friday→Saturday כונן)',
      '- Respect personal constraints and vacations',
      '- Manual assignments are UNTOUCHABLE',
      '',
      '📝 Return JSON array with ALL days (manual + filled):',
      '[{"date":"YYYY-MM-DD","assignments":[{"guide_id":number,"role":"string"}],"explanation_he":"string","is_manual":boolean}]'
    ].join('\n');

    const userPrompt = [
      `📅 Fill empty days for ${month}/${year}:`,
      '',
      `Manual days to preserve: ${manualDays.length}`,
      `Empty days to fill: ${emptyDays.length}`,
      '',
      `Available guides: ${context.guides?.map(g => `${g.id}:${g.name}`).join(', ')}`,
      '',
      'Return complete month with manual days unchanged + empty days filled.',
      '',
      JSON.stringify({ existingSchedule, context: {
        guides: context.guides,
        constraints: context.constraints,
        weekendTypes: context.weekendTypes
      }})
    ].join('\n');

    console.log('🤖 Calling Claude for simple enhancement...');
    const { content, usage } = await agent.complete(system, userPrompt);

    // Simple parsing - no complex validation
    let aiResponse;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found in response');
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('AI response parsing failed:', e.message);
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }

    console.log('✅ AI returned', aiResponse.length, 'days');

    // Simple validation - just preserve manual assignments
    const finalSchedule = aiResponse.map(day => {
      const existingDay = existingSchedule.find(d => d.date === day.date);
      
      // If it was manual, preserve it exactly
      if (existingDay && existingDay.is_manual) {
        return {
          ...existingDay,
          explanation_he: 'שיבוץ ידני נשמר ללא שינוי'
        };
      }
      
      // Otherwise use AI suggestion
      return {
        date: day.date,
        assignments: day.assignments || [],
        explanation_he: day.explanation_he || 'מילוי AI',
        is_manual: false
      };
    });

    // Attach guide names
    const proposalWithNames = await attachGuideNames(finalSchedule);

    const durationMs = Date.now() - start;
    const sessionId = `simple-${house_id}-${year}-${month}-${Date.now().toString(36)}`;
    
    // Record usage
    const cost = await recordUsage({ 
      house_id, 
      sessionId, 
      endpoint: 'enhance-simple', 
      model: agent.model, 
      usage, 
      durationMs 
    });

    const stats = {
      total_days: finalSchedule.length,
      manual_preserved: manualDays.length,
      ai_filled: finalSchedule.filter(d => !d.is_manual && d.assignments?.length > 0).length
    };

    console.log('✅ Simple enhancement completed:', stats);

    res.json({
      success: true,
      sessionId,
      proposal: proposalWithNames,
      warnings: [],
      stats,
      usage,
      cost,
      durationMs
    });

  } catch (error) {
    console.error('Simple AI enhancement error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
*/

module.exports = router;


