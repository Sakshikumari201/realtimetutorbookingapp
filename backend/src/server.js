import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

import authRoutes from './routes/auth.js';
import tutorRoutes from './routes/tutors.js';
import bookingRoutes from './routes/bookings.js';
import feedbackRoutes from './routes/feedback.js';
import adminRoutes from './routes/admin.js';
import statsRoutes from './routes/stats.js';
import chatRoutes from './routes/chat.js';
import profileRoutes from './routes/profile.js';
import resourceRoutes from './routes/resources.js';

import { initSocket } from './socket.js';

dotenv.config();

import connectDB from './db/mongoose.js';
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);

// CORS configuration for auth support
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded avatars
app.use('/uploads', express.static('uploads'));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resources', resourceRoutes); // Added resourceRoutes

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Init Socket.io
initSocket(httpServer);

// Start server
httpServer.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log('Tutor Booking API Server');
  console.log('='.repeat(50));
  console.log(`Server:    http://localhost:${PORT}`);
  console.log(`API Base:  http://localhost:${PORT}/api`);
  console.log(`Health:    http://localhost:${PORT}/health`);
  console.log('-'.repeat(50));
  console.log('Routes:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/tutors');
  console.log('='.repeat(50));
  console.log('Ready for requests...');
  console.log('');
});
