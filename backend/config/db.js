/**
 * Database Configuration (MySQL2 Connection Pool)
 * Configures connection pooling for MySQL with fallback support for local sandbox testing.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'flagforge_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool(poolConfig);
} catch (err) {
  console.warn('[DB] MySQL pool initialization error, will use in-memory store:', err.message);
}

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  const [results] = await pool.execute(sql, params);
  return results;
}

export async function checkConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    return false;
  }
}

export { pool, isConnected };
