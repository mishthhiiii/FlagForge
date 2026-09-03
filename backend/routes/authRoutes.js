/**
 * Auth Routes
 * Mounts authentication and session verification routes.
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// POST /login (or /api/login)
router.post('/login', authController.login);

// GET /auth/me & /me - Validate token and return current session profile
router.get('/auth/me', authenticateJWT, authController.getCurrentUser);
router.get('/me', authenticateJWT, authController.getCurrentUser);

export default router;
