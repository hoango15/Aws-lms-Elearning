const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (course thumbnails and avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route API description
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Online Learning Management System API.',
    version: '1.0.0'
  });
});

// Register API Route handers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// Fallback Route for undefined API resources
app.use('/api/*', (req, res, next) => {
  const err = new Error(`Resource ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Global central error handler middleware
app.use(errorHandler);

module.exports = app;
