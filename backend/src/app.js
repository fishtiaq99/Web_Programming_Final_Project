const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const alertRoutes = require('./routes/alerts');
const inquiryRoutes = require('./routes/inquiries');
const searchRoutes = require('./routes/search');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Public routes — no auth needed
app.use('/api/auth', authRoutes);

// Protected routes — all require valid JWT (handled inside each route file)
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/search', searchRoutes);

// Admin routes — require JWT + admin role (handled in admin.js with router.use)
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;