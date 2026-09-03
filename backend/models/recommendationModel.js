/**
 * AI Recommendation Model
 * Manages decision-support logs in ai_recommendations table.
 */

import { query, checkConnection } from '../config/db.js';

let memoryRecommendations = [
  {
    id: 1,
    flag_id: 1,
    risk_score: 18,
    confidence_score: 92,
    recommendation: 'Continue',
    reason: 'Error rate is stable at 0.48% with average response time of 125ms. Rollout can safely proceed.',
    created_at: '2026-08-18 12:05:00'
  },
  {
    id: 2,
    flag_id: 2,
    risk_score: 28,
    confidence_score: 88,
    recommendation: 'Continue',
    reason: 'Metrics within acceptable bounds for Testing environment. Monitor API failures above 80%.',
    created_at: '2026-08-18 11:05:00'
  },
  {
    id: 3,
    flag_id: 3,
    risk_score: 82,
    confidence_score: 91,
    recommendation: 'Pause',
    reason: 'Error rate increased from 1% to 8.20% and API failures spiked to 89 requests in last window.',
    created_at: '2026-08-18 10:15:00'
  }
];

export async function getLatestRecommendation(flagId) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = 'SELECT * FROM ai_recommendations WHERE flag_id = ? ORDER BY created_at DESC LIMIT 1';
      const rows = await query(sql, [flagId]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[RecommendationModel] Database error, fallback to memory:', err.message);
    }
  }

  const matches = memoryRecommendations
    .filter(r => r.flag_id === Number(flagId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return matches[0] || null;
}

export async function saveRecommendation(recData) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = `
        INSERT INTO ai_recommendations (flag_id, risk_score, confidence_score, recommendation, reason)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [
        recData.flag_id,
        recData.risk_score,
        recData.confidence_score,
        recData.recommendation,
        recData.reason
      ];
      const result = await query(sql, params);
      return { id: result.insertId, ...recData, created_at: new Date().toISOString() };
    } catch (err) {
      console.warn('[RecommendationModel] Database insert error, fallback to memory:', err.message);
    }
  }

  const newEntry = {
    id: Date.now(),
    flag_id: Number(recData.flag_id),
    risk_score: Number(recData.risk_score),
    confidence_score: Number(recData.confidence_score),
    recommendation: recData.recommendation,
    reason: recData.reason,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  memoryRecommendations.unshift(newEntry);
  return newEntry;
}
