/**
 * Express Application Configuration
 * Assembles middleware, routes, and error handling.
 */

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import flagRoutes from './routes/flagRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Core Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'FlagForge Express Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes (mounted at root and /api for versatility)
app.use('/', authRoutes);
app.use('/api', authRoutes);

// Feature Flag Routes (mounted at /flags and /api/flags)
app.use('/flags', flagRoutes);
app.use('/api/flags', flagRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
