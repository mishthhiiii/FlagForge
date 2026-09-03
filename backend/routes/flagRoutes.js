/**
 * Feature Flag Routes
 * Endpoints for flag CRUD, real-time rollout adjustment, metrics, and AI recommendations.
 * Enforces Role-Based Access Control (RBAC):
 * - Admin: Full access including flag creation and modification
 * - Developer: Flag updates and rollout tuning
 * - Viewer: Read-only telemetry and logs access
 */

import { Router } from 'express';
import * as flagController from '../controllers/flagController.js';
import { authenticateJWT, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /flags - Retrieve all feature flags (supports ?environment=Production&status=Active)
router.get('/', flagController.getFlags);

// POST /flags - Create a new feature flag (Admin role only)
router.post('/', authenticateJWT, requireRole('Admin'), flagController.createFlag);

// PATCH /flags/:id - Modify rollout percentage, status, or environment (Admin and Developer roles)
router.patch('/:id', authenticateJWT, requireRole('Admin', 'Developer'), flagController.updateFlag);

// DELETE /flags/:id - Remove a feature flag (Admin role only)
router.delete('/:id', authenticateJWT, requireRole('Admin'), flagController.deleteFlag);

// GET /flags/:id/metrics - Retrieve telemetry and error rates
router.get('/:id/metrics', flagController.getFlagMetrics);

// GET /flags/:id/recommendation - Run explainable AI decision-support evaluation
router.get('/:id/recommendation', flagController.getFlagRecommendation);

// GET /flags/audit/logs - Retrieve historical audit trail
router.get('/audit/logs', flagController.getAuditLogs);
router.get('/audit-logs', flagController.getAuditLogs);

export default router;
