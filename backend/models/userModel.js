/**
 * User Model
 * Data access operations for users table with in-memory sandbox store fallback.
 */

import { query, checkConnection } from '../config/db.js';

// Fallback in-memory dataset matching database/seed.sql
const memoryUsers = [
  {
    id: 1,
    name: 'Project Admin',
    email: 'admin@flagforge.local',
    role: 'Admin',
    password: 'password123',
    created_at: new Date('2026-08-01T09:00:00Z')
  },
  {
    id: 2,
    name: 'Developer',
    email: 'developer@flagforge.local',
    role: 'Developer',
    password: 'password123',
    created_at: new Date('2026-08-02T10:15:00Z')
  },
  {
    id: 3,
    name: 'Viewer',
    email: 'viewer@flagforge.local',
    role: 'Viewer',
    password: 'password123',
    created_at: new Date('2026-08-02T11:00:00Z')
  }
];

export async function findByEmail(email) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[UserModel] Database query error, using memory fallback:', err.message);
    }
  }
  return memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findById(id) {
  const isDbUp = await checkConnection();
  if (isDbUp) {
    try {
      const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      console.warn('[UserModel] Database query error, using memory fallback:', err.message);
    }
  }
  const user = memoryUsers.find(u => u.id === Number(id));
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}
