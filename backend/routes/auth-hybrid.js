/**
 * Authentication Routes (Hybrid Mode)
 * Works with or without database connection
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

// In-memory storage for demo mode (when database is not available)
let inMemoryUsers = [];
let nextUserId = 1;

/**
 * Check if database is available
 */
async function isDatabaseAvailable() {
    try {
        await db.testConnection();
        return true;
    } catch {
        return false;
    }
}

/**
 * POST /api/auth/register
 * User registration (works with or without database)
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const dbAvailable = await isDatabaseAvailable();

        if (dbAvailable) {
            // Try database registration
            try {
                // Check if account exists
                const existingAccount = await db.queryOne(
                    'SELECT id FROM users WHERE account_number = ?',
                    [accountNumber]
                );

                if (existingAccount) {
                    return res.status(400).json({
                        success: false,
                        error: { message: 'Account number already registered', status: 400 }
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
                        error: { message: 'Email already registered', status: 400 }
                    });
                }

                // Insert user
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
                    verified: false
                });

                // Generate token
                const token = jwt.sign(
                    { id: userId, accountNumber, email, role: 'customer' },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: process.env.JWT_EXPIRY || '24h' }
                );

                return res.status(201).json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: userId,
                            accountNumber,
                            name,
                            firstName,
                            email,
                            phone,
                            role: 'customer',
                            verified: false,
                            propertyType: propertyType || 'Residential'
                        }
                    },
                    message: 'Registration successful!'
                });
            } catch (dbError) {
                console.error('Database registration error:', dbError);
                // Fall through to in-memory mode
            }
        }

        // In-memory mode (fallback when database is not available)
        console.log('Using in-memory storage for registration');

        // Check if account or email already exists in memory
        const existingUser = inMemoryUsers.find(u =>
            u.accountNumber === accountNumber || u.email === email
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: {
                    message: existingUser.accountNumber === accountNumber
                        ? 'Account number already registered'
                        : 'Email already registered',
                    status: 400
                }
            });
        }

        // Create user in memory
        const newUser = {
            id: nextUserId++,
            accountNumber,
            email,
            passwordHash: hashedPassword,
            name,
            firstName,
            phone,
            address: address || '',
            propertyType: propertyType || 'Residential',
            role: 'customer',
            verified: false,
            createdAt: new Date()
        };

        inMemoryUsers.push(newUser);

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, accountNumber, email, role: 'customer' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: newUser.id,
                    accountNumber: newUser.accountNumber,
                    name: newUser.name,
                    firstName: newUser.firstName,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    verified: newUser.verified,
                    propertyType: newUser.propertyType
                }
            },
            message: 'Registration successful! (Demo mode - data will be lost on server restart)'
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
 * POST /api/auth/login
 * User login (works with or without database)
 */
router.post('/login', [
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: { message: 'Validation failed', details: errors.array() }
            });
        }

        const { accountNumber, password } = req.body;
        const dbAvailable = await isDatabaseAvailable();

        let user = null;
        let validPassword = false;

        if (dbAvailable) {
            // Try database login
            try {
                user = await db.queryOne(
                    'SELECT * FROM users WHERE account_number = ?',
                    [accountNumber]
                );

                if (user) {
                    validPassword = await bcrypt.compare(password, user.password_hash);
                    if (validPassword) {
                        const token = jwt.sign(
                            { id: user.id, accountNumber: user.account_number, email: user.email, role: user.role },
                            process.env.JWT_SECRET || 'your-secret-key',
                            { expiresIn: process.env.JWT_EXPIRY || '24h' }
                        );

                        return res.json({
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
                    }
                }
            } catch (dbError) {
                console.error('Database login error:', dbError);
                // Fall through to in-memory mode
            }
        }

        // In-memory mode
        user = inMemoryUsers.find(u => u.accountNumber === accountNumber);
        if (user) {
            validPassword = await bcrypt.compare(password, user.passwordHash);
            if (validPassword) {
                const token = jwt.sign(
                    { id: user.id, accountNumber: user.accountNumber, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: process.env.JWT_EXPIRY || '24h' }
                );

                return res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: user.id,
                            accountNumber: user.accountNumber,
                            name: user.name,
                            firstName: user.firstName,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            verified: user.verified,
                            propertyType: user.propertyType
                        }
                    }
                });
            }
        }

        res.status(401).json({
            success: false,
            error: { message: 'Invalid credentials', status: 401 }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Internal server error', status: 500 }
        });
    }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
        try {
            const user = await db.queryOne(
                'SELECT id, account_number, email, name, first_name, phone, address, property_type, role, verified FROM users WHERE id = ?',
                [req.user.id]
            );

            if (user) {
                return res.json({
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
                        verified: user.verified
                    }
                });
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
        }
    }

    // In-memory fallback
    const user = inMemoryUsers.find(u => u.id === req.user.id);
    if (user) {
        return res.json({
            success: true,
            data: {
                id: user.id,
                accountNumber: user.accountNumber,
                name: user.name,
                firstName: user.firstName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                propertyType: user.propertyType,
                role: user.role,
                verified: user.verified
            }
        });
    }

    res.status(404).json({
        success: false,
        error: { message: 'User not found', status: 404 }
    });
});

module.exports = router;
