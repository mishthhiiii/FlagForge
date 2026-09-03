/**
 * Rollout Metrics Model
 * Telemetry data access for rollout_metrics table with fallback data.
 */

import { query, checkConnection } from '../config/db.js';

let memoryMetrics = [
  { id: 1, flag_id: 1, error_rate: 0.45, response_time: 120, api_failures: 2, user_adoption: 45, timestamp: '2026-08-18 10:00:00' },
  { id: 2, flag_id: 1, error_rate: 0.52, response_time: 118, api_failures: 3, user_adoption: 50, timestamp: '2026-08-18 11:00:00' },
  { id: 3, flag_id: 1, error_rate: 0.48, response_time: 125, api_failures: 1, user_adoption: 52, timestamp: '2026-08-18 12:00:00' },
  { id: 4, flag_id: 2, error_rate: 1.10, response_time: 310, api_failures: 8, user_adoption: 70, timestamp: '2026-08-18 10:00:00' },
  { id: 5, flag_id: 2, error_rate: 1.25, response_time: 305, api_failures: 9, user_adoption: 75, timestamp: '2026-08-18 11:00:00' },
  { id: 6, flag_id: 3, error_rate: 4.80, response_time: 480, api_failures: 34, user_adoption: 10, timestamp: '2026-08-18 09:00:00' },
  { id: 7, flag_id: 3, error_rate: 8.20, response_time: 750, api_failures: 89, user_adoption: 10, timestamp: '2026-08-18 10:00:00' },
  { id: 8, flag_id: 4, error_rate: 0.15, response_time: 85, api_failures: 0, user_adoption: 100, timestamp: '2026-08-18 12:00:00' }
];

export async function getMetricsByFlagId(flagId) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = 'SELECT * FROM rollout_metrics WHERE flag_id = ? ORDER BY timestamp ASC';
      return await query(sql, [flagId]);
    } catch (err) {
      console.warn('[MetricModel] Database error, fallback to memory:', err.message);
    }
  }

  const matches = memoryMetrics.filter(m => m.flag_id === Number(flagId));
  if (matches.length === 0) {
    // Return sensible simulated baseline for newly created flags
    return [
      {
        id: Date.now(),
        flag_id: Number(flagId),
        error_rate: 0.35,
        response_time: 95,
        api_failures: 1,
        user_adoption: 25,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }
    ];
  }
  return matches;
}

export async function getLatestMetric(flagId) {
  const all = await getMetricsByFlagId(flagId);
  return all.length > 0 ? all[all.length - 1] : null;
}

export async function recordMetric(flagId, metricData) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = `
        INSERT INTO rollout_metrics (flag_id, error_rate, response_time, api_failures, user_adoption)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [
        flagId,
        metricData.error_rate || 0,
        metricData.response_time || 0,
        metricData.api_failures || 0,
        metricData.user_adoption || 0
      ];
      const result = await query(sql, params);
      return { id: result.insertId, flag_id: flagId, ...metricData };
    } catch (err) {
      console.warn('[MetricModel] Database error, fallback to memory:', err.message);
    }
  }

  const newEntry = {
    id: Date.now(),
    flag_id: Number(flagId),
    error_rate: Number(metricData.error_rate) || 0,
    response_time: Number(metricData.response_time) || 0,
    api_failures: Number(metricData.api_failures) || 0,
    user_adoption: Number(metricData.user_adoption) || 0,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  memoryMetrics.push(newEntry);
  return newEntry;
}
