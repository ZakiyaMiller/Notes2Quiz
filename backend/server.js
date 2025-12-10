/**
 * Main Express server entry point
 */
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/users');
const { firebaseAuthMiddleware } = require('./auth/middleware');

const app = express();

// ==============================================================================
// Middleware
// ==============================================================================

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Firebase authentication middleware
app.use(firebaseAuthMiddleware);

// ==============================================================================
// Routes
// ==============================================================================

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Notes2QA API!' });
});

// User routes
app.use('/users', userRoutes);

// API routes
app.use('/api', apiRoutes);

// ==============================================================================
// Error handling middleware
// ==============================================================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        detail: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ==============================================================================
// Start server
// ==============================================================================

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Notes2QA API server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
