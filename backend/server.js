/**
 * FlagForge Backend Server Entry Point
 * Starts HTTP listener on specified port.
 */

import app from './app.js';
import { checkConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  const isDbConnected = await checkConnection();
  if (isDbConnected) {
    console.log('[DB] Connected to MySQL database.');
  } else {
    console.log('[DB] Running with high-performance in-memory persistence layer.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FlagForge Server] Express backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
