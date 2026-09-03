/**
 * Flag Controller
 * Handles HTTP request validation, invokes FlagService and AIService,
 * and produces standard RESTful responses.
 */

import * as flagService from '../services/flagService.js';
import * as aiService from '../services/aiService.js';
import * as metricModel from '../models/metricModel.js';
import * as auditLogModel from '../models/auditLogModel.js';

export async function getFlags(req, res, next) {
  try {
    const { environment, status } = req.query;
    const flags = await flagService.listFlags({ environment, status });
    return res.status(200).json({
      success: true,
      count: flags.length,
      data: flags
    });
  } catch (err) {
    next(err);
  }
}

export async function createFlag(req, res, next) {
  try {
    const userId = req.user ? req.user.userId : 1;
    const newFlag = await flagService.createNewFlag(req.body, userId);
    return res.status(201).json({
      success: true,
      message: 'Feature flag created successfully',
      data: newFlag
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFlag(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : 1;
    const updated = await flagService.modifyFlag(id, req.body, userId);

    return res.status(200).json({
      success: true,
      message: 'Feature flag updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFlag(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : 1;
    await flagService.deleteFlag(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Feature flag deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function getFlagMetrics(req, res, next) {
  try {
    const { id } = req.params;
    const history = await metricModel.getMetricsByFlagId(id);
    const latest = await metricModel.getLatestMetric(id);

    return res.status(200).json({
      success: true,
      flagId: Number(id),
      latest,
      history
    });
  } catch (err) {
    next(err);
  }
}

export async function getFlagRecommendation(req, res, next) {
  try {
    const { id } = req.params;
    const recommendation = await aiService.evaluateFlagRollout(id);

    return res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await auditLogModel.getAllAuditLogs();
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    next(err);
  }
}
