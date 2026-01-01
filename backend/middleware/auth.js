/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token and authenticate user
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Access token required',
                status: 401
            }
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: {
                    message: 'Invalid or expired token',
                    status: 403
                }
            });
        }

        req.user = user;
        next();
    });
};

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required',
                status: 401
            }
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Admin access required',
                status: 403
            }
        });
    }

    next();
};

/**
 * Check if user has staff role or higher
 */
const requireStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Authentication required',
                status: 401
            }
        });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Staff access required',
                status: 403
            }
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireStaff
};
