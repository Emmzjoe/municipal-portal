/**
 * User Management Routes
 * Handles user profile, account management, and admin user operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireStaff } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.queryOne(
            `SELECT
                id,
                account_number,
                name,
                email,
                phone,
                address,
                property_type,
                role,
                verified,
                created_at,
                last_login
            FROM users
            WHERE id = ?`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        // Convert snake_case to camelCase
        const userProfile = {
            id: user.id,
            accountNumber: user.account_number,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            propertyType: user.property_type,
            role: user.role,
            verified: user.verified,
            createdAt: user.created_at,
            lastLogin: user.last_login
        };

        res.json({
            success: true,
            data: userProfile
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch user profile'
            }
        });
    }
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
        const { name, email, phone, address } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'No fields to update'
                }
            });
        }

        // If email is being updated, check if it's already in use
        if (email) {
            const existingEmail = await db.queryOne(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Email already in use'
                    }
                });
            }
        }

        // Update user profile
        await db.update('users', updateData, 'id = ?', [req.user.id]);

        // Fetch updated profile
        const updatedUser = await db.queryOne(
            `SELECT
                id,
                account_number,
                name,
                email,
                phone,
                address,
                property_type,
                role,
                verified,
                updated_at
            FROM users
            WHERE id = ?`,
            [req.user.id]
        );

        // Convert snake_case to camelCase
        const updatedProfile = {
            id: updatedUser.id,
            accountNumber: updatedUser.account_number,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            propertyType: updatedUser.property_type,
            role: updatedUser.role,
            verified: updatedUser.verified,
            updatedAt: updatedUser.updated_at
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update profile'
            }
        });
    }
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
                created_at
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

        // Convert snake_case to camelCase for each user
        const formattedUsers = users.map(user => ({
            id: user.id,
            accountNumber: user.account_number,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            propertyType: user.property_type,
            role: user.role,
            verified: user.verified,
            createdAt: user.created_at
        }));

        res.json({
            success: true,
            users: formattedUsers,
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
 * GET /api/users/:accountNumber (Staff only)
 * Get specific user details
 */
router.get('/:accountNumber', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const { accountNumber } = req.params;

        // Fetch user details
        const user = await db.queryOne(
            `SELECT
                id,
                account_number,
                name,
                email,
                phone,
                address,
                property_type,
                role,
                verified,
                created_at,
                last_login
            FROM users
            WHERE account_number = ?`,
            [accountNumber]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        // Fetch total outstanding bills
        const outstandingResult = await db.queryOne(
            `SELECT COALESCE(SUM(amount), 0) as total_outstanding
            FROM bills
            WHERE account_number = ? AND status != 'Paid'`,
            [accountNumber]
        );

        // Fetch recent payment history (last 5 payments)
        const paymentHistory = await db.query(
            `SELECT
                created_at as date,
                service,
                amount,
                payment_method as method,
                payment_reference as reference,
                status
            FROM payments
            WHERE account_number = ?
            ORDER BY created_at DESC
            LIMIT 5`,
            [accountNumber]
        );

        // Fetch active service requests
        const serviceRequests = await db.query(
            `SELECT
                id,
                type,
                status,
                created_at
            FROM service_requests
            WHERE account_number = ? AND status IN ('Open', 'In Progress')
            ORDER BY created_at DESC`,
            [accountNumber]
        );

        // Convert snake_case to camelCase
        const userDetails = {
            id: user.id,
            accountNumber: user.account_number,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            propertyType: user.property_type,
            role: user.role,
            verified: user.verified,
            createdAt: user.created_at,
            lastLogin: user.last_login,
            totalOutstanding: outstandingResult.total_outstanding,
            paymentHistory: paymentHistory.map(p => ({
                date: p.date,
                service: p.service,
                amount: p.amount,
                method: p.method,
                reference: p.reference,
                status: p.status
            })),
            serviceRequests: serviceRequests.map(sr => ({
                id: sr.id,
                type: sr.type,
                status: sr.status,
                createdAt: sr.created_at
            }))
        };

        res.json({
            success: true,
            data: userDetails
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch user details'
            }
        });
    }
});

/**
 * PUT /api/users/:accountNumber (Staff only)
 * Update user details
 */
router.put('/:accountNumber', [
    authenticateToken,
    requireStaff,
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional(),
    body('address').optional(),
    body('role').optional().isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
    body('verified').optional().isBoolean().withMessage('Verified must be a boolean')
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
        const { accountNumber } = req.params;
        const { name, email, phone, address, role, verified } = req.body;

        // Check if user exists
        const existingUser = await db.queryOne(
            'SELECT id, account_number FROM users WHERE account_number = ?',
            [accountNumber]
        );

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'User not found'
                }
            });
        }

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (role !== undefined) updateData.role = role;
        if (verified !== undefined) updateData.verified = verified;

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'No fields to update'
                }
            });
        }

        // If email is being updated, check if it's already in use
        if (email) {
            const existingEmail = await db.queryOne(
                'SELECT id FROM users WHERE email = ? AND account_number != ?',
                [email, accountNumber]
            );

            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Email already in use'
                    }
                });
            }
        }

        // Update user
        await db.update('users', updateData, 'account_number = ?', [accountNumber]);

        // Fetch updated user
        const updatedUser = await db.queryOne(
            `SELECT
                id,
                account_number,
                name,
                email,
                phone,
                address,
                property_type,
                role,
                verified,
                updated_at
            FROM users
            WHERE account_number = ?`,
            [accountNumber]
        );

        // Convert snake_case to camelCase
        const userResponse = {
            id: updatedUser.id,
            accountNumber: updatedUser.account_number,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            propertyType: updatedUser.property_type,
            role: updatedUser.role,
            verified: updatedUser.verified,
            updatedAt: updatedUser.updated_at
        };

        res.json({
            success: true,
            message: 'User updated successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update user'
            }
        });
    }
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
