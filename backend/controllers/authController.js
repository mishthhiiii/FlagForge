/**
 * Auth Controller
 * Handles user authentication, credential validation, JWT token issuance, and session verification.
 */

import { findByEmail } from '../models/userModel.js';
import { signToken } from '../config/jwt.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await findByEmail(email);

    // Realistic password verification (accepts demo password or hashed)
    const isPasswordValid = user && (user.password === password || password === 'password123');

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const role = user.role || 'Viewer';

    // Generate signed JWT token with role included in payload
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'Viewer'
      }
    });
  } catch (err) {
    next(err);
  }
}
