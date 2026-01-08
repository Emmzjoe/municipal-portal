/**
 * Okahandja Municipality API Server
 * Main server file with Express configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const { createCsrfToken, verifyCsrfToken } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined')); // Logging

// Rate limiting - General API protection
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        error: {
            message: 'Too many login attempts. Please try again after 15 minutes.',
            status: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Import routes
const authRoutes = require('./routes/auth-hybrid');
const userRoutes = require('./routes/users');
const billRoutes = require('./routes/bills');
const paymentRoutes = require('./routes/payments');
const statementRoutes = require('./routes/statements');
const serviceRequestRoutes = require('./routes/serviceRequests');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');

// API Routes
app.use('/api/auth', authLimiter, authRoutes); // Apply strict rate limiting to auth
app.use('/api/users', userRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// CSRF token endpoint
app.get('/api/csrf-token', createCsrfToken);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Okahandja Municipality API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            bills: '/api/bills',
            payments: '/api/payments',
            statements: '/api/statements',
            serviceRequests: '/api/service-requests',
            notifications: '/api/notifications',
            reports: '/api/reports',
            settings: '/api/settings',
            health: '/api/health'
        },
        documentation: '/api/docs'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Endpoint not found',
            status: 404,
            path: req.path
        }
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🏛️  Okahandja Municipality API Server`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);

    // Test database connection
    console.log(`\n📊 Initializing database connection...`);
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
        console.log(`⚠️  Database not connected. Using mock data mode.`);
    }
});

module.exports = app;
