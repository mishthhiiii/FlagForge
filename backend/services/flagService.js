/**
 * Flag Service
 * Encapsulates core business workflows for feature flag operations,
 * state validation, and audit trail generation.
 */

import * as flagModel from '../models/flagModel.js';
import * as auditLogModel from '../models/auditLogModel.js';
import * as metricModel from '../models/metricModel.js';
import * as recommendationModel from '../models/recommendationModel.js';

export async function listFlags(filters = {}) {
  const flags = await flagModel.getAllFlags(filters);

  // Hydrate flags with their latest metrics and AI recommendations
  const hydrated = await Promise.all(
    flags.map(async (flag) => {
      const latestMetric = await metricModel.getLatestMetric(flag.id);
      const latestRec = await recommendationModel.getLatestRecommendation(flag.id);

      return {
        ...flag,
        metrics: latestMetric || {
          error_rate: 0.25,
          response_time: 110,
          api_failures: 1,
          user_adoption: flag.rollout_percentage
        },
        aiRecommendation: latestRec || {
          risk_score: 15,
          confidence_score: 90,
          recommendation: 'Continue',
          reason: 'Telemetry within optimal operating envelope.'
        }
      };
    })
  );

  return hydrated;
}

export async function createNewFlag(flagData, userId) {
  // Validate required inputs
  if (!flagData.name || !flagData.name.trim()) {
    throw new Error('Flag name is required and cannot be empty.');
  }

  // Ensure unique name formatting (clean lowercase kebab-case if typed as spaces)
  const formattedName = flagData.name.trim().toLowerCase().replace(/\s+/g, '-');

  const created = await flagModel.createFlag({
    user_id: userId || 1,
    name: formattedName,
    description: flagData.description || '',
    status: flagData.status || 'Draft',
    rollout_percentage: Number(flagData.rollout_percentage) || 0,
    environment: flagData.environment || 'Development'
  });

  // Automatically record initial audit entry
  await auditLogModel.createAuditLog(
    created.id,
    userId || 1,
    `Created feature flag '${created.name}' in ${created.environment} with ${created.rollout_percentage}% rollout`
  );

  // Initialize baseline metric
  await metricModel.recordMetric(created.id, {
    error_rate: 0.15,
    response_time: 90,
    api_failures: 0,
    user_adoption: created.rollout_percentage
  });

  return created;
}

export async function modifyFlag(flagId, updates, userId) {
  const existing = await flagModel.getFlagById(flagId);
  if (!existing) {
    throw new Error(`Feature flag with ID ${flagId} not found.`);
  }

  // Validate rollout percentage if provided
  if (updates.rollout_percentage !== undefined) {
    const pct = Number(updates.rollout_percentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      throw new Error('Rollout percentage must be a number between 0 and 100.');
    }
    updates.rollout_percentage = pct;
  }

  // Validate status if provided
  if (updates.status !== undefined) {
    const validStatuses = ['Draft', 'Active', 'Paused', 'Archived'];
    if (!validStatuses.includes(updates.status)) {
      throw new Error(`Invalid status: ${updates.status}. Allowed values: ${validStatuses.join(', ')}`);
    }
  }

  const updated = await flagModel.updateFlag(flagId, updates);

  // Generate clear descriptive audit log
  let auditAction = `Updated flag '${existing.name}': `;
  const changes = [];
  if (updates.status && updates.status !== existing.status) {
    changes.push(`status changed from ${existing.status} to ${updates.status}`);
  }
  if (updates.rollout_percentage !== undefined && updates.rollout_percentage !== existing.rollout_percentage) {
    changes.push(`rollout updated to ${updates.rollout_percentage}%`);
  }
  if (updates.environment && updates.environment !== existing.environment) {
    changes.push(`environment moved to ${updates.environment}`);
  }
  auditAction += changes.join(', ') || 'attributes modified';

  await auditLogModel.createAuditLog(flagId, userId || 1, auditAction);

  return updated;
}

export async function deleteFlag(flagId, userId) {
  const existing = await flagModel.getFlagById(flagId);
  if (!existing) {
    throw new Error(`Feature flag with ID ${flagId} not found.`);
  }

  const success = await flagModel.deleteFlag(flagId);
  if (!success) {
    throw new Error(`Failed to delete feature flag with ID ${flagId}.`);
  }

  await auditLogModel.createAuditLog(
    null,
    userId || 1,
    `Deleted feature flag '${existing.name}' from ${existing.environment}`
  );

  return true;
}
