/**
 * CSRF Protection Middleware
 * Modern implementation without deprecated packages
 */

const crypto = require('crypto');

// Store valid tokens (in production, use Redis or database)
const csrfTokens = new Map();

// Token expiry time (30 minutes)
const TOKEN_EXPIRY = 30 * 60 * 1000;

/**
 * Generate a CSRF token
 * @returns {string} Generated CSRF token
 */
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Create CSRF token endpoint middleware
 */
function createCsrfToken(req, res) {
    const token = generateToken();
    const expiry = Date.now() + TOKEN_EXPIRY;

    // Store token with expiry
    csrfTokens.set(token, {
        expiry,
        used: false
    });

    // Clean up expired tokens periodically
    cleanExpiredTokens();

    res.json({
        success: true,
        data: {
            csrfToken: token,
            expiresIn: TOKEN_EXPIRY
        }
    });
}

/**
 * Verify CSRF token middleware
 */
function verifyCsrfToken(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Get token from header or body
    const token = req.headers['x-csrf-token'] || req.body._csrf;

    if (!token) {
        return res.status(403).json({
            success: false,
            error: {
                message: 'CSRF token missing',
                status: 403
            }
        });
    }

    // Verify token exists and is valid
    const tokenData = csrfTokens.get(token);

    if (!tokenData) {
        return res.status(403).json({
            success: false,
            error: {
                message: 'Invalid CSRF token',
                status: 403
            }
        });
    }

    // Check if token has expired
    if (Date.now() > tokenData.expiry) {
        csrfTokens.delete(token);
        return res.status(403).json({
            success: false,
            error: {
                message: 'CSRF token expired',
                status: 403
            }
        });
    }

    // Check if token has been used (single-use tokens)
    if (tokenData.used) {
        csrfTokens.delete(token);
        return res.status(403).json({
            success: false,
            error: {
                message: 'CSRF token already used',
                status: 403
            }
        });
    }

    // Mark token as used
    tokenData.used = true;

    // Token is valid, proceed
    next();
}

/**
 * Clean up expired tokens
 */
function cleanExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
        if (now > data.expiry || data.used) {
            csrfTokens.delete(token);
        }
    }
}

// Clean up every 5 minutes
setInterval(cleanExpiredTokens, 5 * 60 * 1000);

module.exports = {
    createCsrfToken,
    verifyCsrfToken,
    generateToken
};
