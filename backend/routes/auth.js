/**
 * Authentication Routes
 * Handles user login, logout, registration, and password reset
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

/**
 * POST /api/auth/login
 * User login endpoint
 */
router.post('/login', [
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { accountNumber, password } = req.body;

        // Find user in database
        const user = await db.queryOne(
            'SELECT * FROM users WHERE account_number = ?',
            [accountNumber]
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid credentials',
                    status: 401
                }
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid credentials',
                    status: 401
                }
            });
        }

        // Update last login
        await db.update(
            'users',
            { last_login: new Date() },
            'id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                accountNumber: user.account_number,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        // Return success with token
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    accountNumber: user.account_number,
                    name: user.name,
                    firstName: user.first_name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    verified: user.verified,
                    propertyType: user.property_type
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * POST /api/auth/register
 * New user registration
 */
router.post('/register', [
    body('accountNumber').notEmpty().withMessage('Account number is required')
        .isLength({ min: 8, max: 50 }).withMessage('Account number must be 8-50 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('name').notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('phone').notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
    body('address').optional().isLength({ max: 500 }).withMessage('Address too long'),
    body('propertyType').optional().isIn(['Residential', 'Commercial', 'Industrial', 'Government'])
        .withMessage('Invalid property type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { accountNumber, email, password, name, firstName, phone, address, propertyType } = req.body;

        // Check if account number exists
        const existingAccount = await db.queryOne(
            'SELECT id FROM users WHERE account_number = ?',
            [accountNumber]
        );

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Account number already registered',
                    status: 400
                }
            });
        }

        // Check if email exists
        const existingEmail = await db.queryOne(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Email already registered',
                    status: 400
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = jwt.sign(
            { email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Insert new user into database
        const userId = await db.insert('users', {
            account_number: accountNumber,
            email: email,
            password_hash: hashedPassword,
            name: name,
            first_name: firstName,
            phone: phone,
            address: address || null,
            property_type: propertyType || 'Residential',
            role: 'customer',
            verified: false,
            verification_token: verificationToken
        });

        // Log registration activity
        await db.insert('activity_log', {
            account_number: accountNumber,
            action: 'User Registration',
            entity_type: 'user',
            entity_id: userId,
            details: `New user registered: ${name} (${email})`,
            ip_address: req.ip || req.connection.remoteAddress
        });

        // Generate login token
        const token = jwt.sign(
            {
                id: userId,
                accountNumber: accountNumber,
                email: email,
                role: 'customer'
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        // Send verification email (in production)
        // await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: userId,
                    accountNumber: accountNumber,
                    name: name,
                    firstName: firstName,
                    email: email,
                    phone: phone,
                    role: 'customer',
                    verified: false,
                    propertyType: propertyType || 'Residential'
                }
            },
            message: 'Registration successful. Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
router.post('/verify-email', [
    body('token').notEmpty().withMessage('Verification token is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { token } = req.body;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid or expired verification token',
                    status: 400
                }
            });
        }

        // Find user and update verification status
        const result = await db.update(
            'users',
            {
                verified: true,
                verification_token: null
            },
            'email = ? AND verification_token = ?',
            [decoded.email, token]
        );

        if (result === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found or already verified',
                    status: 404
                }
            });
        }

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * POST /api/auth/logout
 * User logout (token invalidation handled client-side)
 */
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // Log logout activity
        await db.insert('activity_log', {
            account_number: req.user.accountNumber,
            action: 'User Logout',
            entity_type: 'user',
            entity_id: req.user.id,
            details: 'User logged out',
            ip_address: req.ip || req.connection.remoteAddress
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { email } = req.body;

        const user = await db.queryOne(
            'SELECT id, account_number, name, email FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            // Return success even if user not found (security best practice)
            return res.json({
                success: true,
                message: 'If that email is registered, a password reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Store reset token in database
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
        await db.update(
            'users',
            {
                reset_token: resetToken,
                reset_token_expires: resetTokenExpires
            },
            'id = ?',
            [user.id]
        );

        // Log activity
        await db.insert('activity_log', {
            account_number: user.account_number,
            action: 'Password Reset Requested',
            entity_type: 'user',
            entity_id: user.id,
            details: 'Password reset link sent to email',
            ip_address: req.ip || req.connection.remoteAddress
        });

        // In production, send email with reset link
        console.log(`Password reset link: ${process.env.APP_URL}/reset-password?token=${resetToken}`);

        res.json({
            success: true,
            message: 'If that email is registered, a password reset link has been sent',
            // For demo purposes, include token (remove in production)
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { token, newPassword } = req.body;

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid or expired reset token',
                    status: 400
                }
            });
        }

        // Find user with valid reset token
        const user = await db.queryOne(
            'SELECT id, account_number FROM users WHERE id = ? AND reset_token = ? AND reset_token_expires > NOW()',
            [decoded.id, token]
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid or expired reset token',
                    status: 400
                }
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await db.update(
            'users',
            {
                password_hash: hashedPassword,
                reset_token: null,
                reset_token_expires: null
            },
            'id = ?',
            [user.id]
        );

        // Log activity
        await db.insert('activity_log', {
            account_number: user.account_number,
            action: 'Password Reset',
            entity_type: 'user',
            entity_id: user.id,
            details: 'Password was reset successfully',
            ip_address: req.ip || req.connection.remoteAddress
        });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.queryOne(
            'SELECT id, account_number, email, name, first_name, phone, address, property_type, role, verified, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found',
                    status: 404
                }
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                accountNumber: user.account_number,
                name: user.name,
                firstName: user.first_name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                propertyType: user.property_type,
                role: user.role,
                verified: user.verified,
                createdAt: user.created_at,
                lastLogin: user.last_login
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
router.put('/update-profile', [
    authenticateToken,
    body('name').optional().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
    body('phone').optional().matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
    body('address').optional().isLength({ max: 500 }).withMessage('Address too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors.array()
                }
            });
        }

        const { name, phone, address } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'No fields to update',
                    status: 400
                }
            });
        }

        await db.update('users', updateData, 'id = ?', [req.user.id]);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                status: 500
            }
        });
    }
});

module.exports = router;
