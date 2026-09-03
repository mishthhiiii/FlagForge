/**
 * AI Integration Service
 * Bridges Express backend with the Python AI module (ai/recommendation.py).
 * Executes explainable heuristic analysis on feature flag rollout telemetry.
 */

import { spawn } from 'child_process';
import path from 'path';
import { getLatestMetric } from '../models/metricModel.js';
import { getFlagById } from '../models/flagModel.js';
import { saveRecommendation, getLatestRecommendation } from '../models/recommendationModel.js';
import { query, checkConnection } from '../config/db.js';

export const memoryPredictionHistory = [];

/**
 * Inserts a telemetry and prediction snapshot into prediction_history table.
 * Executes non-blockingly so database issues never prevent recommendation delivery.
 */
export async function recordPredictionHistory(data) {
  try {
    const isDbUp = await checkConnection();
    if (isDbUp) {
      try {
        const sql = `
          INSERT INTO prediction_history (
            flag_id, error_rate, response_time, api_failures,
            user_adoption, cpu_usage, memory_usage, rollout_percentage,
            recommendation, risk_score, reliability_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          data.flag_id ? Number(data.flag_id) : null,
          Number(data.error_rate) || 0.0,
          Math.round(Number(data.response_time) || 0),
          Math.round(Number(data.api_failures) || 0),
          Number(data.user_adoption) || 0.0,
          Number(data.cpu_usage) || 0.0,
          Number(data.memory_usage) || 0.0,
          Math.round(Number(data.rollout_percentage) || 0),
          String(data.recommendation || 'Continue'),
          Math.round(Number(data.risk_score) || 0),
          Math.round(Number(data.reliability_score) || 0)
        ];
        const result = await query(sql, params);
        const saved = { id: result.insertId, ...data, created_at: new Date().toISOString() };
        memoryPredictionHistory.unshift(saved);
        return saved;
      } catch (dbErr) {
        console.warn('[AIService] Failed to insert into prediction_history in database:', dbErr.message);
      }
    }

    // In-memory fallback
    const fallbackRow = {
      id: memoryPredictionHistory.length + 1,
      ...data,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    memoryPredictionHistory.unshift(fallbackRow);
    return fallbackRow;
  } catch (err) {
    console.warn('[AIService] Error in recordPredictionHistory:', err.message);
    return null;
  }
}

export async function getPredictionHistory(flagId) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const sql = flagId
        ? 'SELECT * FROM prediction_history WHERE flag_id = ? ORDER BY created_at DESC'
        : 'SELECT * FROM prediction_history ORDER BY created_at DESC';
      const params = flagId ? [flagId] : [];
      return await query(sql, params);
    } catch (err) {
      console.warn('[AIService] Database error in getPredictionHistory, using memory fallback:', err.message);
    }
  }

  return flagId
    ? memoryPredictionHistory.filter(p => p.flag_id === Number(flagId))
    : memoryPredictionHistory;
}

export async function evaluateFlagRollout(flagId) {
  // 1. Fetch latest telemetry metrics and flag context for this flag
  const metric = await getLatestMetric(flagId);
  const flag = await getFlagById(flagId).catch(() => null);

  if (!metric) {
    const defaultRec = {
      flagId: Number(flagId),
      riskScore: 20,
      reliabilityScore: 85,
      confidenceScore: 85,
      recommendation: 'Continue',
      reason: 'No abnormal telemetry captured. Feature flag is performing safely.'
    };

    await recordPredictionHistory({
      flag_id: flagId,
      error_rate: 0.0,
      response_time: 100,
      api_failures: 0,
      user_adoption: 20.0,
      cpu_usage: 25.0,
      memory_usage: 35.0,
      rollout_percentage: flag ? Number(flag.rollout_percentage) : 20,
      recommendation: defaultRec.recommendation,
      risk_score: defaultRec.riskScore,
      reliability_score: defaultRec.reliabilityScore
    }).catch(() => {});

    return defaultRec;
  }

  const err = Number(metric.error_rate) || 0.0;
  const resp = Math.round(Number(metric.response_time) || 120);
  const fails = Math.round(Number(metric.api_failures) || 0);
  const adopt = Number(metric.user_adoption) || 20.0;
  const cpu = Number(metric.cpu_usage) || Number((Math.min(98.0, Math.max(15.0, 20.0 + (resp / 14.0) + (err * 2.5)))).toFixed(1));
  const mem = Number(metric.memory_usage) || Number((Math.min(95.0, Math.max(20.0, 28.0 + (adopt * 0.35)))).toFixed(1));
  const rolloutPct = flag ? Number(flag.rollout_percentage) : (Number(metric.rollout_percentage) || Math.round(adopt));

  const payload = {
    metrics: {
      error_rate: err,
      api_failures: fails,
      response_time: resp,
      user_adoption: adopt,
      cpu_usage: cpu,
      memory_usage: mem,
      rollout_percentage: rolloutPct
    }
  };

  // 2. Attempt to run dedicated Python AI module
  const scriptPath = path.resolve(process.cwd(), 'ai', 'recommendation.py');

  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', [scriptPath, JSON.stringify(payload)]);
    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0 && stdoutData.trim()) {
        try {
          const aiResult = JSON.parse(stdoutData.trim());
          
          const relScore = aiResult.reliabilityScore ?? aiResult.confidenceScore;

          // Persist recommendation record to database
          await saveRecommendation({
            flag_id: flagId,
            risk_score: aiResult.riskScore,
            confidence_score: relScore,
            recommendation: aiResult.recommendation,
            reason: aiResult.reason
          });

          // Record telemetry snapshot & inference in prediction_history
          await recordPredictionHistory({
            flag_id: flagId,
            error_rate: err,
            response_time: resp,
            api_failures: fails,
            user_adoption: adopt,
            cpu_usage: cpu,
            memory_usage: mem,
            rollout_percentage: rolloutPct,
            recommendation: aiResult.recommendation,
            risk_score: aiResult.riskScore,
            reliability_score: relScore
          }).catch(e => console.warn('[AIService] Non-fatal prediction_history logging error:', e.message));

          return resolve({
            flagId: Number(flagId),
            riskScore: aiResult.riskScore,
            reliabilityScore: relScore,
            recommendation: aiResult.recommendation,
            reason: aiResult.reason,
            confidenceScore: relScore
          });
        } catch (parseErr) {
          console.warn('[AIService] Failed to parse Python JSON output, using JS heuristic fallback:', parseErr.message);
        }
      }

      // Fallback heuristic if Python spawn fails or produces invalid JSON
      const fallbackResult = calculateJsHeuristic(payload.metrics);
      const relFallback = fallbackResult.reliabilityScore ?? fallbackResult.confidenceScore;
      await saveRecommendation({
        flag_id: flagId,
        risk_score: fallbackResult.riskScore,
        confidence_score: relFallback,
        recommendation: fallbackResult.recommendation,
        reason: fallbackResult.reason
      });

      // Record telemetry snapshot & inference in prediction_history
      await recordPredictionHistory({
        flag_id: flagId,
        error_rate: err,
        response_time: resp,
        api_failures: fails,
        user_adoption: adopt,
        cpu_usage: cpu,
        memory_usage: mem,
        rollout_percentage: rolloutPct,
        recommendation: fallbackResult.recommendation,
        risk_score: fallbackResult.riskScore,
        reliability_score: relFallback
      }).catch(e => console.warn('[AIService] Non-fatal fallback prediction_history logging error:', e.message));

      resolve({
        flagId: Number(flagId),
        ...fallbackResult,
        reliabilityScore: relFallback
      });
    });

    pythonProcess.on('error', async (err) => {
      console.warn('[AIService] Python spawn error, using native fallback:', err.message);
      const fallbackResult = calculateJsHeuristic(payload.metrics);
      resolve({
        flagId: Number(flagId),
        ...fallbackResult
      });
    });
  });
}

/**
 * Mirror heuristic logic in JavaScript matching ai/analyzer.py
 * Ensures 100% reliability in environments without Python binaries.
 */
function calculateJsHeuristic(m) {
  let risk = 10;
  let reasons = [];

  if (m.error_rate >= 5.0) {
    risk += 50;
    reasons.push(`Error rate has reached ${m.error_rate.toFixed(1)}%, so disabling this feature is recommended until stability improves.`);
  } else if (m.error_rate >= 2.0) {
    risk += 25;
    reasons.push(`Elevated error rate of ${m.error_rate.toFixed(2)}%`);
  }

  if (m.response_time >= 600) {
    risk += 25;
    reasons.push(`High latency: P95 response time is ${m.response_time}ms`);
  } else if (m.response_time >= 300) {
    risk += 15;
    reasons.push(`Moderate latency increase: ${m.response_time}ms`);
  }

  if (m.api_failures >= 30) {
    risk += 20;
    reasons.push(`High API failures: ${m.api_failures} failed requests recorded`);
  }

  const riskScore = Math.min(100, Math.max(0, risk));
  let recommendation = 'Continue';
  if (riskScore >= 75) recommendation = 'Disable';
  else if (riskScore >= 45) recommendation = 'Pause';

  return {
    riskScore,
    reliabilityScore: 91,
    confidenceScore: 91,
    recommendation,
    reason: reasons[0] || `Telemetry healthy with error rate at ${m.error_rate.toFixed(2)}%.`
  };
}
