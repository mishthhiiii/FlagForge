/**
 * Feature Flag Model
 * Handles CRUD and state mutations on feature_flags table.
 */

import { query, checkConnection } from '../config/db.js';

// Fallback in-memory dataset matching database/seed.sql
let memoryFlags = [
  {
    id: 1,
    user_id: 1,
    name: 'ab-test-hero-cta',
    description: 'Evaluating conversion rate on indigo primary CTA versus emerald CTA on landing page.',
    status: 'Active',
    rollout_percentage: 50,
    environment: 'Production',
    created_at: '2026-08-10 10:00:00',
    updated_at: '2026-08-15 14:30:00'
  },
  {
    id: 2,
    user_id: 1,
    name: 'ai-code-generation',
    description: 'Assisted code generation backend endpoint powered by contextual models.',
    status: 'Active',
    rollout_percentage: 75,
    environment: 'Staging',
    created_at: '2026-08-12 11:30:00',
    updated_at: '2026-08-16 09:15:00'
  },
  {
    id: 3,
    user_id: 2,
    name: 'stripe-billing-v3',
    description: 'Migration to multi-currency Stripe Billing API v3 webhooks.',
    status: 'Paused',
    rollout_percentage: 10,
    environment: 'Production',
    created_at: '2026-08-14 14:00:00',
    updated_at: '2026-08-17 16:45:00'
  },
  {
    id: 4,
    user_id: 1,
    name: 'dashboard-analytics-v2',
    description: 'High-throughput Recharts visualization for edge latency monitoring.',
    status: 'Active',
    rollout_percentage: 100,
    environment: 'Development',
    created_at: '2026-08-15 16:00:00',
    updated_at: '2026-08-18 11:20:00'
  },
  {
    id: 5,
    user_id: 2,
    name: 'realtime-websocket-bus',
    description: 'Low latency bidirectional event streaming layer for instant flag invalidation.',
    status: 'Draft',
    rollout_percentage: 0,
    environment: 'Development',
    created_at: '2026-08-18 08:30:00',
    updated_at: '2026-08-18 08:30:00'
  }
];

export async function getAllFlags(filters = {}) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      let sql = 'SELECT * FROM feature_flags';
      const params = [];
      const conditions = [];

      if (filters.environment) {
        conditions.push('environment = ?');
        params.push(filters.environment);
      }
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY updated_at DESC';

      return await query(sql, params);
    } catch (err) {
      console.warn('[FlagModel] Database error, falling back to memory store:', err.message);
    }
  }

  let result = [...memoryFlags];
  if (filters.environment) {
    const envFilter = filters.environment.toLowerCase();
    result = result.filter(f => {
      const fEnv = f.environment.toLowerCase();
      return fEnv === envFilter ||
        (envFilter === 'staging' && fEnv === 'testing') ||
        (envFilter === 'testing' && fEnv === 'staging');
    });
  }
  if (filters.status) {
    result = result.filter(f => f.status.toLowerCase() === filters.status.toLowerCase());
  }
  return result;
}

export async function getFlagById(id) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const rows = await query('SELECT * FROM feature_flags WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[FlagModel] Database error, fallback to memory:', err.message);
    }
  }
  return memoryFlags.find(f => f.id === Number(id)) || null;
}

export async function createFlag(flagData) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = `
        INSERT INTO feature_flags (user_id, name, description, status, rollout_percentage, environment)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const params = [
        flagData.user_id || 1,
        flagData.name,
        flagData.description || '',
        flagData.status || 'Draft',
        flagData.rollout_percentage || 0,
        flagData.environment || 'Development'
      ];
      const result = await query(sql, params);
      return await getFlagById(result.insertId);
    } catch (err) {
      console.warn('[FlagModel] Database insert error, fallback to memory:', err.message);
    }
  }

  const newFlag = {
    id: Date.now(),
    user_id: flagData.user_id || 1,
    name: flagData.name,
    description: flagData.description || '',
    status: flagData.status || 'Draft',
    rollout_percentage: Number(flagData.rollout_percentage) || 0,
    environment: flagData.environment || 'Development',
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  memoryFlags.unshift(newFlag);
  return newFlag;
}

export async function updateFlag(id, updates) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const fields = [];
      const params = [];

      if (updates.status !== undefined) {
        fields.push('status = ?');
        params.push(updates.status);
      }
      if (updates.rollout_percentage !== undefined) {
        fields.push('rollout_percentage = ?');
        params.push(Number(updates.rollout_percentage));
      }
      if (updates.environment !== undefined) {
        fields.push('environment = ?');
        params.push(updates.environment);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        params.push(updates.description);
      }

      if (fields.length > 0) {
        fields.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        const sql = `UPDATE feature_flags SET ${fields.join(', ')} WHERE id = ?`;
        await query(sql, params);
        return await getFlagById(id);
      }
    } catch (err) {
      console.warn('[FlagModel] Database update error, fallback to memory:', err.message);
    }
  }

  const index = memoryFlags.findIndex(f => f.id === Number(id));
  if (index === -1) return null;

  memoryFlags[index] = {
    ...memoryFlags[index],
    ...updates,
    updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  return memoryFlags[index];
}

export async function deleteFlag(id) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      await query('DELETE FROM feature_flags WHERE id = ?', [id]);
      return true;
    } catch (err) {
      console.warn('[FlagModel] Database delete error, fallback to memory:', err.message);
    }
  }

  const prevLen = memoryFlags.length;
  memoryFlags = memoryFlags.filter(f => f.id !== Number(id));
  return memoryFlags.length < prevLen;
}
