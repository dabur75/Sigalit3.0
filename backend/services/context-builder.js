'use strict';

const { pool } = require('../database/postgresql');

/**
 * Build compact month context for AI proposals
 * Minimizes tokens: use IDs and short strings; avoid PII beyond name
 */
async function buildMonthContext({ house_id, year, month }) {
  let guides;
  try {
    guides = (await pool.query(
      `SELECT id, name, role FROM users WHERE house_id = $1 AND is_active = true AND role = 'מדריך' ORDER BY name`,
      [house_id]
    )).rows;
    
    // If no results and house_id filtering didn't work, fallback to all users
    if (guides.length === 0) {
      guides = (await pool.query(
        `SELECT id, name, role FROM users WHERE is_active = true AND role = 'מדריך' ORDER BY name`
      )).rows;
    }
  } catch (e) {
    // Fallback for DBs without house_id column
    try {
      guides = (await pool.query(
        `SELECT id, name, role FROM users WHERE is_active = true AND role = 'מדריך' ORDER BY name`
      )).rows;
    } catch (e2) {
      throw new Error('context:guides:' + e.message);
    }
  }

  let constraints;
  try {
    constraints = (await pool.query(
      `SELECT c.user_id, c.date::text as date
       FROM constraints c
       JOIN users u ON u.id = c.user_id
       WHERE u.house_id = $1 AND EXTRACT(YEAR FROM c.date) = $2 AND EXTRACT(MONTH FROM c.date) = $3`,
      [house_id, year, month]
    )).rows;
    
    // If no results and house_id filtering didn't work, fallback to all constraints
    if (constraints.length === 0) {
      constraints = (await pool.query(
        `SELECT user_id, date::text as date FROM constraints WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
        [year, month]
      )).rows;
    }
  } catch (e) {
    // Fallback if users.house_id not present
    try {
      constraints = (await pool.query(
        `SELECT user_id, date::text as date FROM constraints WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
        [year, month]
      )).rows;
    } catch (e2) {
      throw new Error('context:constraints:' + e.message);
    }
  }

  let fixedConstraints;
  try {
    fixedConstraints = (await pool.query(
      `SELECT fc.user_id, fc.weekday
       FROM fixed_constraints fc
       JOIN users u ON u.id = fc.user_id
       WHERE u.house_id = $1`,
      [house_id]
    )).rows;
  } catch (e) {
    try {
      fixedConstraints = (await pool.query(
        `SELECT user_id, weekday FROM fixed_constraints`
      )).rows;
    } catch (e2) {
      throw new Error('context:fixed:' + e.message);
    }
  }

  let vacations;
  try {
    vacations = (await pool.query(
      `SELECT v.user_id, v.date_start::text as date_start, v.date_end::text as date_end
       FROM vacations v
       JOIN users u ON u.id = v.user_id
       WHERE u.house_id = $1
         AND v.status = 'approved'
         AND (EXTRACT(YEAR FROM v.date_start) = $2 OR EXTRACT(YEAR FROM v.date_end) = $2)`,
      [house_id, year]
    )).rows;
  } catch (e) {
    try {
      vacations = (await pool.query(
        `SELECT user_id, date_start::text as date_start, date_end::text as date_end FROM vacations WHERE status = 'approved' AND (EXTRACT(YEAR FROM date_start) = $1 OR EXTRACT(YEAR FROM date_end) = $1)`,
        [year]
      )).rows;
    } catch (e2) {
      throw new Error('context:vacations:' + e.message);
    }
  }

  let coordinatorRules;
  try {
    coordinatorRules = (await pool.query(
      `SELECT cr.rule_type, cr.guide1_id, cr.guide2_id, cr.is_active
       FROM coordinator_rules cr
       LEFT JOIN users u1 ON u1.id = cr.guide1_id
       WHERE cr.is_active = true AND (u1.house_id = $1 OR cr.guide1_id IS NULL)`,
      [house_id]
    )).rows;
  } catch (e) {
    try {
      coordinatorRules = (await pool.query(
        `SELECT rule_type, guide1_id, guide2_id, is_active FROM coordinator_rules WHERE is_active = true`
      )).rows;
    } catch (e2) {
      throw new Error('context:coordinator_rules:' + e.message);
    }
  }

  let weekendRows;
  try {
    weekendRows = (await pool.query(
      `SELECT date::text as date, is_closed FROM weekend_types WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
      [year, month]
    )).rows;
  } catch (e) {
    throw new Error('context:weekend_types:' + e.message);
  }
  const weekendTypes = {};
  for (const row of weekendRows) {
    weekendTypes[row.date] = row.is_closed === true;
  }

  // Existing manual assignments for the month
  let manualAssignments;
  try {
    manualAssignments = (await pool.query(
      `SELECT s.date::text as date, s.guide1_id, s.guide1_role, s.guide2_id, s.guide2_role
       FROM schedule s
       LEFT JOIN users u1 ON u1.id = s.guide1_id
       LEFT JOIN users u2 ON u2.id = s.guide2_id
       WHERE EXTRACT(YEAR FROM s.date) = $2 AND EXTRACT(MONTH FROM s.date) = $3
         AND (u1.house_id = $1 OR u2.house_id = $1)
         AND s.is_manual = true`,
      [house_id, year, month]
    )).rows;
  } catch (e) {
    try {
      manualAssignments = (await pool.query(
        `SELECT date::text as date, guide1_id, guide1_role, guide2_id, guide2_role
         FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND is_manual = true`,
        [year, month]
      )).rows;
    } catch (e2) {
      throw new Error('context:manual_assignments:' + e.message);
    }
  }

  // All existing assignments (manual + automatic) for context
  let allExistingAssignments;
  try {
    allExistingAssignments = (await pool.query(
      `SELECT s.date::text as date, s.guide1_id, s.guide1_role, s.guide2_id, s.guide2_role, s.is_manual
       FROM schedule s
       LEFT JOIN users u1 ON u1.id = s.guide1_id
       LEFT JOIN users u2 ON u2.id = s.guide2_id
       WHERE EXTRACT(YEAR FROM s.date) = $2 AND EXTRACT(MONTH FROM s.date) = $3
         AND (u1.house_id = $1 OR u2.house_id = $1)`,
      [house_id, year, month]
    )).rows;
  } catch (e) {
    try {
      allExistingAssignments = (await pool.query(
        `SELECT date::text as date, guide1_id, guide1_role, guide2_id, guide2_role, is_manual
         FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2`,
        [year, month]
      )).rows;
    } catch (e2) {
      allExistingAssignments = [];
    }
  }

  // Guide workload statistics for balancing
  let guideWorkload;
  try {
    guideWorkload = (await pool.query(
      `SELECT 
         s.guide1_id as guide_id, 
         COUNT(*) as total_shifts,
         SUM(CASE WHEN EXTRACT(DOW FROM s.date) IN (5,6) THEN 1 ELSE 0 END) as weekend_shifts,
         SUM(CASE WHEN s.guide1_role = 'כונן' THEN 1 ELSE 0 END) as standby_shifts
       FROM schedule s
       LEFT JOIN users u ON u.id = s.guide1_id
       WHERE EXTRACT(YEAR FROM s.date) = $2 AND EXTRACT(MONTH FROM s.date) = $3
         AND (u.house_id = $1 OR s.guide1_id IN (SELECT id FROM users WHERE house_id = $1))
         AND s.guide1_id IS NOT NULL
       GROUP BY s.guide1_id
       UNION ALL
       SELECT 
         s.guide2_id as guide_id, 
         COUNT(*) as total_shifts,
         SUM(CASE WHEN EXTRACT(DOW FROM s.date) IN (5,6) THEN 1 ELSE 0 END) as weekend_shifts,
         SUM(CASE WHEN s.guide2_role = 'כונן' THEN 1 ELSE 0 END) as standby_shifts
       FROM schedule s
       LEFT JOIN users u ON u.id = s.guide2_id
       WHERE EXTRACT(YEAR FROM s.date) = $2 AND EXTRACT(MONTH FROM s.date) = $3
         AND (u.house_id = $1 OR s.guide2_id IN (SELECT id FROM users WHERE house_id = $1))
         AND s.guide2_id IS NOT NULL
       GROUP BY s.guide2_id`,
      [house_id, year, month]
    )).rows;
  } catch (e) {
    try {
      guideWorkload = (await pool.query(
        `SELECT 
           guide_id, 
           SUM(total_shifts) as total_shifts,
           SUM(weekend_shifts) as weekend_shifts,
           SUM(standby_shifts) as standby_shifts
         FROM (
           SELECT guide1_id as guide_id, COUNT(*) as total_shifts,
                  SUM(CASE WHEN EXTRACT(DOW FROM date) IN (5,6) THEN 1 ELSE 0 END) as weekend_shifts,
                  SUM(CASE WHEN guide1_role = 'כונן' THEN 1 ELSE 0 END) as standby_shifts
           FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND guide1_id IS NOT NULL
           GROUP BY guide1_id
           UNION ALL
           SELECT guide2_id as guide_id, COUNT(*) as total_shifts,
                  SUM(CASE WHEN EXTRACT(DOW FROM date) IN (5,6) THEN 1 ELSE 0 END) as weekend_shifts,
                  SUM(CASE WHEN guide2_role = 'כונן' THEN 1 ELSE 0 END) as standby_shifts
           FROM schedule WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2 AND guide2_id IS NOT NULL
           GROUP BY guide2_id
         ) combined GROUP BY guide_id`,
        [year, month]
      )).rows;
    } catch (e2) {
      guideWorkload = [];
    }
  }

  // Convert workload to map for easy lookup
  const workloadMap = new Map();
  guideWorkload.forEach(w => {
    const existing = workloadMap.get(w.guide_id) || { total_shifts: 0, weekend_shifts: 0, standby_shifts: 0 };
    workloadMap.set(w.guide_id, {
      total_shifts: existing.total_shifts + parseInt(w.total_shifts || 0),
      weekend_shifts: existing.weekend_shifts + parseInt(w.weekend_shifts || 0),
      standby_shifts: existing.standby_shifts + parseInt(w.standby_shifts || 0)
    });
  });

  // Convert to array for context
  const workloadStats = Array.from(workloadMap.entries()).map(([guide_id, stats]) => ({
    guide_id: parseInt(guide_id),
    ...stats
  }));

  // Calculate month date range for AI context
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  
  // Count manual vs auto assignments
  const manualCount = manualAssignments.length;
  const autoCount = allExistingAssignments.length - manualCount;

  return {
    house_id,
    year,
    month,
    guides,
    constraints,
    fixedConstraints,
    vacations,
    coordinatorRules,
    weekendTypes,
    manualAssignments,
    allExistingAssignments,
    workloadStats,
    monthRange: {
      start: monthStart,
      end: monthEnd,
      daysInMonth,
      manualCount,
      autoCount,
      gapsToFill: daysInMonth - allExistingAssignments.length
    }
  };
}

module.exports = { buildMonthContext };


