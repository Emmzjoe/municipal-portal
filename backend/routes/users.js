/**
 * User Management Routes
 * Handles user profile, account management, and admin user operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticateToken, (req, res) => {
    // Mock user data - replace with database query
    const userProfile = {
        id: req.user.id,
        accountNumber: req.user.accountNumber,
        name: 'John Doe',
        email: req.user.email,
        phone: '+264811234567',
        address: '123 Main Street, Okahandja',
        role: req.user.role,
        verified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
    };

    res.json({
        success: true,
        data: userProfile
    });
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', [
    authenticateToken,
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty')
], (req, res) => {
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

    const { name, email, phone, address } = req.body;

    // Mock update - replace with database update
    const updatedProfile = {
        id: req.user.id,
        accountNumber: req.user.accountNumber,
        name: name || 'John Doe',
        email: email || req.user.email,
        phone: phone || '+264811234567',
        address: address || '123 Main Street, Okahandja',
        role: req.user.role,
        verified: true,
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
    });
});

/**
 * POST /api/users/change-password
 * Change user password
 */
router.post('/change-password', [
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    // Mock password change - replace with actual password verification and update
    // In production: verify currentPassword, hash newPassword, update database

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

/**
 * GET /api/users/account-summary
 * Get user's account summary
 */
router.get('/account-summary', authenticateToken, (req, res) => {
    // Mock account summary - replace with database queries
    const accountSummary = {
        accountNumber: req.user.accountNumber,
        name: 'John Doe',
        totalOutstanding: 4853.50,
        lastPaymentDate: '2024-12-01',
        lastPaymentAmount: 1245.00,
        services: [
            {
                service: 'Water',
                outstanding: 1245.00,
                dueDate: '2025-01-15'
            },
            {
                service: 'Electricity',
                outstanding: 1785.50,
                dueDate: '2025-01-15'
            },
            {
                service: 'Property Rates',
                outstanding: 1275.00,
                dueDate: '2025-01-20'
            },
            {
                service: 'Refuse Collection',
                outstanding: 548.00,
                dueDate: '2025-01-15'
            }
        ],
        pendingServiceRequests: 2,
        unreadNotifications: 5
    };

    res.json({
        success: true,
        data: accountSummary
    });
});

/**
 * GET /api/users (Admin only)
 * Get all users with pagination
 */
router.get('/', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000; // Default to 1000 to get all users
        const search = req.query.search || '';

        // Build WHERE clause for search
        let whereClause = '';
        let queryParams = [];

        if (search) {
            whereClause = 'WHERE name LIKE ? OR account_number LIKE ? OR email LIKE ?';
            const searchPattern = `%${search}%`;
            queryParams = [searchPattern, searchPattern, searchPattern];
        }

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResults = await db.query(countSql, queryParams);
        const total = countResults[0].total;

        // Get users with pagination
        const offset = (page - 1) * limit;
        const sql = `
            SELECT
                id,
                account_number,
                name,
                email,
                phone,
                address,
                property_type,
                role,
                verified,
                created_at as createdAt
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        // Build params array for query
        let usersQueryParams = [];
        if (search) {
            usersQueryParams = [queryParams[0], queryParams[1], queryParams[2], limit, offset];
        } else {
            usersQueryParams = [limit, offset];
        }
        const users = await db.query(sql, usersQueryParams);

        res.json({
            success: true,
            users: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch users'
            }
        });
    }
});

/**
 * POST /api/users (Admin only)
 * Create a new user
 */
router.post('/', [
    authenticateToken,
    requireAdmin,
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('address').optional(),
    body('propertyType').optional(),
    body('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role')
], async (req, res) => {
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

    try {
        const { accountNumber, email, password, name, firstName, address, propertyType, role, phone } = req.body;

        // Check if account number already exists
        const existingUser = await db.queryOne(
            'SELECT id FROM users WHERE account_number = ?',
            [accountNumber]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Account number already exists'
                }
            });
        }

        // Check if email already exists
        const existingEmail = await db.queryOne(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Email already exists'
                }
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user
        const userId = await db.insert('users', {
            account_number: accountNumber,
            email: email,
            password_hash: passwordHash,
            name: name,
            first_name: firstName,
            phone: phone || null,
            address: address || null,
            property_type: propertyType || 'Residential',
            role: role || 'customer',
            verified: true
        });

        // Fetch the created user
        const newUser = await db.queryOne(
            'SELECT id, account_number, name, email, phone, address, property_type, role, verified, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: newUser.id,
                accountNumber: newUser.account_number,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                propertyType: newUser.property_type,
                role: newUser.role,
                verified: newUser.verified,
                createdAt: newUser.created_at
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create user',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/users/:id (Admin only)
 * Get specific user details
 */
router.get('/:id', [authenticateToken, requireAdmin], (req, res) => {
    const userId = parseInt(req.params.id);

    // Mock user detail - replace with database query
    const user = {
        id: userId,
        accountNumber: '12345678',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+264811234567',
        address: '123 Main Street, Okahandja',
        role: 'customer',
        verified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: '2024-12-14T10:30:00.000Z',
        totalOutstanding: 4853.50,
        paymentHistory: [
            {
                date: '2024-12-01',
                service: 'Water',
                amount: 1245.00,
                method: 'Card Payment',
                reference: 'CARD-1733068800000',
                status: 'Success'
            }
        ],
        serviceRequests: [
            {
                id: 1,
                type: 'Water Leak',
                status: 'In Progress',
                createdAt: '2024-12-10T08:00:00.000Z'
            }
        ]
    };

    res.json({
        success: true,
        data: user
    });
});

/**
 * PUT /api/users/:id (Admin only)
 * Update user details
 */
router.put('/:id', [
    authenticateToken,
    requireAdmin,
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role')
], (req, res) => {
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

    const userId = parseInt(req.params.id);
    const { name, email, phone, role, verified } = req.body;

    // Mock update - replace with database update
    const updatedUser = {
        id: userId,
        accountNumber: '12345678',
        name: name || 'John Doe',
        email: email || 'john.doe@example.com',
        phone: phone || '+264811234567',
        role: role || 'customer',
        verified: verified !== undefined ? verified : true,
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
    });
});

/**
 * DELETE /api/users/:id (Admin only)
 * Delete/deactivate user account
 */
router.delete('/:id', [authenticateToken, requireAdmin], (req, res) => {
    const userId = parseInt(req.params.id);

    // Mock deletion - replace with database soft delete or deactivation
    res.json({
        success: true,
        message: `User ${userId} has been deactivated`
    });
});

module.exports = router;
