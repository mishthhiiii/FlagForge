/**
 * Authentication & Authorization Middleware
 * Validates JWT Bearer token and enforces Role-Based Access Control (RBAC).
 */

import { verifyToken } from '../config/jwt.js';

/**
 * Validates session JWT token.
 * Returns 401 Unauthorized for missing, invalid, or expired tokens.
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No JWT token provided in Authorization header'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session token. Please log in again.'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware.
 * Returns 403 Forbidden for insufficient role permissions.
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required'
      });
    }

    const userRole = req.user.role || 'Viewer';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient permissions for role '${userRole}'. Required: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
}
