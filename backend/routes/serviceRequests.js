/**
 * Service Request Routes
 * Handles service requests, fault reporting, and request tracking
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * GET /api/service-requests
 * Get service requests for current user
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const accountNumber = req.user.accountNumber;
        const status = req.query.status;

        // Build query with optional status filter
        let sql = `
            SELECT
                id,
                request_id AS requestId,
                account_number AS accountNumber,
                type,
                category,
                description,
                location,
                status,
                priority,
                assigned_to AS assignedTo,
                resolution_notes AS resolutionNotes,
                resolved_at AS resolvedAt,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM service_requests
            WHERE account_number = ?
        `;

        const params = [accountNumber];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const serviceRequests = await db.query(sql, params);

        res.json({
            success: true,
            data: {
                serviceRequests,
                summary: {
                    total: serviceRequests.length,
                    open: serviceRequests.filter(sr => sr.status === 'Open').length,
                    inProgress: serviceRequests.filter(sr => sr.status === 'In Progress').length,
                    resolved: serviceRequests.filter(sr => sr.status === 'Resolved').length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch service requests',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/service-requests/all (Staff/Admin only)
 * Get all service requests from all users
 */
router.get('/all', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const sql = `
            SELECT
                sr.id,
                sr.request_id AS requestId,
                sr.account_number AS accountNumber,
                sr.type,
                sr.category,
                sr.description,
                sr.location,
                sr.status,
                sr.priority,
                sr.assigned_to AS assignedTo,
                sr.resolution_notes AS resolutionNotes,
                sr.resolved_at AS resolvedAt,
                sr.created_at AS createdAt,
                sr.updated_at AS updatedAt,
                u.name AS accountHolder
            FROM service_requests sr
            LEFT JOIN users u ON sr.account_number = u.account_number
            ORDER BY sr.created_at DESC
        `;
        const serviceRequests = await db.query(sql);

        res.json({
            success: true,
            data: {
                serviceRequests: serviceRequests
            }
        });
    } catch (error) {
        console.error('Error fetching all service requests:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch service requests',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/service-requests/:id
 * Get specific service request details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const requestId = parseInt(req.params.id);
        const accountNumber = req.user.accountNumber;

        // Query service request from database
        const result = await db.query(`
            SELECT
                sr.id,
                sr.request_id AS requestId,
                sr.account_number AS accountNumber,
                sr.type,
                sr.category,
                sr.description,
                sr.location,
                sr.status,
                sr.priority,
                sr.assigned_to AS assignedTo,
                sr.resolution_notes AS resolutionNotes,
                sr.resolved_at AS resolvedAt,
                sr.created_at AS createdAt,
                sr.updated_at AS updatedAt,
                u.name AS accountHolder
            FROM service_requests sr
            LEFT JOIN users u ON sr.account_number = u.account_number
            WHERE sr.id = ? AND sr.account_number = ?
        `, [requestId, accountNumber]);

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Service request not found'
                }
            });
        }

        res.json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        console.error('Error fetching service request details:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch service request details',
                details: error.message
            }
        });
    }
});

/**
 * POST /api/service-requests
 * Create new service request
 */
router.post('/', [
    authenticateToken,
    body('type').notEmpty().withMessage('Request type is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').notEmpty().withMessage('Location is required')
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
        const { type, category, description, location, priority } = req.body;
        const accountNumber = req.user.accountNumber;

        // Generate unique request ID
        const timestamp = Date.now();
        const requestId = `SR-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;

        // Prepare data for insertion
        const requestData = {
            request_id: requestId,
            account_number: accountNumber,
            type,
            category,
            description,
            location,
            status: 'Open',
            priority: priority || 'Medium'
        };

        // Insert into database
        const insertId = await db.insert('service_requests', requestData);

        // Fetch the created request
        const createdRequest = await db.query(`
            SELECT
                id,
                request_id AS requestId,
                account_number AS accountNumber,
                type,
                category,
                description,
                location,
                status,
                priority,
                assigned_to AS assignedTo,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM service_requests
            WHERE id = ?
        `, [insertId]);

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: createdRequest[0]
        });
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create service request',
                details: error.message
            }
        });
    }
});

/**
 * PUT /api/service-requests/:id
 * Update service request (user can update their own requests if pending)
 */
router.put('/:id', [
    authenticateToken,
    body('description').optional().notEmpty().withMessage('Description cannot be empty')
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

    const requestId = parseInt(req.params.id);
    const { description, location } = req.body;

    // Mock update - replace with database update
    const updatedRequest = {
        id: requestId,
        description: description || 'Water leak on the main road near my property',
        location: location || '123 Main Street, Okahandja',
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Service request updated successfully',
        data: updatedRequest
    });
});

/**
 * DELETE /api/service-requests/:id
 * Cancel service request (only if pending)
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const requestId = parseInt(req.params.id);

    // Mock cancellation - replace with database update
    res.json({
        success: true,
        message: `Service request ${requestId} has been cancelled`
    });
});

/**
 * POST /api/service-requests/:id/comment
 * Add comment to service request
 */
router.post('/:id/comment', [
    authenticateToken,
    body('comment').notEmpty().withMessage('Comment is required')
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

    const requestId = parseInt(req.params.id);
    const { comment } = req.body;

    // Mock comment creation - replace with database insert
    const newComment = {
        id: Date.now(),
        requestId,
        comment,
        createdBy: req.user.accountNumber,
        createdAt: new Date().toISOString()
    };

    res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: newComment
    });
});

/**
 * GET /api/service-requests/categories/list
 * Get available service request categories
 */
router.get('/categories/list', (req, res) => {
    const categories = [
        {
            id: 'water',
            name: 'Water',
            icon: '💧',
            types: [
                'Water Leak',
                'No Water Supply',
                'Low Water Pressure',
                'Water Quality Issue',
                'Meter Problem'
            ]
        },
        {
            id: 'electricity',
            name: 'Electricity',
            icon: '⚡',
            types: [
                'Power Outage',
                'Streetlight Not Working',
                'Electrical Fault',
                'Meter Problem'
            ]
        },
        {
            id: 'refuse',
            name: 'Refuse Collection',
            icon: '🗑️',
            types: [
                'Refuse Not Collected',
                'Damaged Bin',
                'Request New Bin',
                'Illegal Dumping'
            ]
        },
        {
            id: 'roads',
            name: 'Roads & Infrastructure',
            icon: '🛣️',
            types: [
                'Pothole',
                'Road Damage',
                'Storm Drain Blocked',
                'Sidewalk Damage'
            ]
        },
        {
            id: 'other',
            name: 'Other',
            icon: '📋',
            types: [
                'General Inquiry',
                'Complaint',
                'Suggestion',
                'Other'
            ]
        }
    ];

    res.json({
        success: true,
        data: categories
    });
});

/**
 * PUT /api/service-requests/:id/status (Staff only)
 * Update service request status
 */
router.put('/:id/status', [
    authenticateToken,
    requireStaff,
    body('status').isIn(['Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled']).withMessage('Invalid status')
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
        const requestId = parseInt(req.params.id);
        const { status, resolutionNotes } = req.body;

        // Check if request exists
        const existingRequest = await db.query(
            'SELECT id, status FROM service_requests WHERE id = ?',
            [requestId]
        );

        if (!existingRequest || existingRequest.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Service request not found'
                }
            });
        }

        // Prepare update data
        const updateData = {
            status,
            updated_at: new Date()
        };

        // If status is Resolved or Closed, set resolved_at timestamp
        if (status === 'Resolved' || status === 'Closed') {
            updateData.resolved_at = new Date();
        }

        // If resolution notes provided, add them
        if (resolutionNotes) {
            updateData.resolution_notes = resolutionNotes;
        }

        // Update in database
        await db.update('service_requests', updateData, 'id = ?', [requestId]);

        // Fetch updated request
        const updatedRequest = await db.query(`
            SELECT
                id,
                request_id AS requestId,
                account_number AS accountNumber,
                type,
                category,
                description,
                location,
                status,
                priority,
                assigned_to AS assignedTo,
                resolution_notes AS resolutionNotes,
                resolved_at AS resolvedAt,
                created_at AS createdAt,
                updated_at AS updatedAt
            FROM service_requests
            WHERE id = ?
        `, [requestId]);

        res.json({
            success: true,
            message: 'Service request status updated successfully',
            data: updatedRequest[0]
        });
    } catch (error) {
        console.error('Error updating service request status:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update service request status',
                details: error.message
            }
        });
    }
});

/**
 * PUT /api/service-requests/:id/assign (Staff only)
 * Assign service request to staff/department
 */
router.put('/:id/assign', [
    authenticateToken,
    requireStaff,
    body('assignedTo').notEmpty().withMessage('Assignment target is required')
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

    const requestId = parseInt(req.params.id);
    const { assignedTo, priority } = req.body;

    // Mock assignment - replace with database update
    const updatedRequest = {
        id: requestId,
        assignedTo,
        priority: priority || 'Medium',
        status: 'In Progress',
        updatedAt: new Date().toISOString(),
        assignedBy: req.user.id
    };

    res.json({
        success: true,
        message: 'Service request assigned successfully',
        data: updatedRequest
    });
});

module.exports = router;
