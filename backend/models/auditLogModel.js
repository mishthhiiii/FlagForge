/**
 * Audit Log Model
 * Manages immutable change logs for developer actions on feature flags.
 */

import { query, checkConnection } from '../config/db.js';

let memoryLogs = [
  {
    id: 1,
    flag_id: 1,
    user_id: 1,
    user_name: 'Project Admin',
    action: 'Created feature flag ab-test-hero-cta in Production at 0% rollout',
    timestamp: '2026-08-10 10:00:00'
  },
  {
    id: 2,
    flag_id: 1,
    user_id: 1,
    user_name: 'Project Admin',
    action: 'Updated rollout percentage to 50% for ab-test-hero-cta',
    timestamp: '2026-08-15 14:30:00'
  },
  {
    id: 3,
    flag_id: 2,
    user_id: 2,
    user_name: 'Developer',
    action: 'Created feature flag ai-code-generation in Testing at 75% rollout',
    timestamp: '2026-08-12 11:30:00'
  },
  {
    id: 4,
    flag_id: 3,
    user_id: 2,
    user_name: 'Developer',
    action: 'Created feature flag stripe-billing-v3 in Production at 10% rollout',
    timestamp: '2026-08-14 14:00:00'
  },
  {
    id: 5,
    flag_id: 3,
    user_id: 1,
    user_name: 'Project Admin',
    action: 'Paused flag stripe-billing-v3 following AI risk alert of 82/100',
    timestamp: '2026-08-17 16:45:00'
  }
];

export async function getAllAuditLogs(limit = 100) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = `
        SELECT a.id, a.flag_id, a.user_id, a.action, a.timestamp, u.name AS user_name, u.email AS user_email
        FROM audit_logs a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.timestamp DESC
        LIMIT ?
      `;
      return await query(sql, [limit]);
    } catch (err) {
      console.warn('[AuditLogModel] Database error, fallback to memory:', err.message);
    }
  }

  return [...memoryLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export async function createAuditLog(flagId, userId, action) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = 'INSERT INTO audit_logs (flag_id, user_id, action) VALUES (?, ?, ?)';
      const result = await query(sql, [flagId, userId, action]);
      return { id: result.insertId, flag_id: flagId, user_id: userId, action, timestamp: new Date().toISOString() };
    } catch (err) {
      console.warn('[AuditLogModel] Database insert error, fallback to memory:', err.message);
    }
  }

  const newLog = {
    id: Date.now(),
    flag_id: flagId ? Number(flagId) : null,
    user_id: Number(userId) || 1,
    user_name: Number(userId) === 1 ? 'Project Admin' : (Number(userId) === 2 ? 'Developer' : (Number(userId) === 3 ? 'Viewer' : 'Project Admin')),
    action,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  memoryLogs.unshift(newLog);
  return newLog;
}
