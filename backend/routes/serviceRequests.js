/**
 * Service Request Routes
 * Handles service requests, fault reporting, and request tracking
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/service-requests
 * Get service requests for current user
 */
router.get('/', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;
    const status = req.query.status;

    // Mock service requests - replace with database query
    let serviceRequests = [
        {
            id: 1,
            accountNumber,
            type: 'Water Leak',
            category: 'Water',
            description: 'Water leak on the main road near my property',
            status: 'In Progress',
            priority: 'High',
            location: '123 Main Street, Okahandja',
            createdAt: '2024-12-10T08:00:00.000Z',
            updatedAt: '2024-12-12T14:30:00.000Z',
            assignedTo: 'Water Department',
            estimatedCompletion: '2024-12-15T17:00:00.000Z'
        },
        {
            id: 2,
            accountNumber,
            type: 'Streetlight Not Working',
            category: 'Electricity',
            description: 'Streetlight outside my house has not been working for 3 days',
            status: 'Pending',
            priority: 'Medium',
            location: '123 Main Street, Okahandja',
            createdAt: '2024-12-08T16:45:00.000Z',
            updatedAt: '2024-12-08T16:45:00.000Z',
            assignedTo: null,
            estimatedCompletion: null
        },
        {
            id: 3,
            accountNumber,
            type: 'Refuse Not Collected',
            category: 'Refuse Collection',
            description: 'Refuse was not collected on scheduled day (Monday)',
            status: 'Resolved',
            priority: 'Low',
            location: '123 Main Street, Okahandja',
            createdAt: '2024-11-25T07:00:00.000Z',
            updatedAt: '2024-11-26T10:15:00.000Z',
            assignedTo: 'Sanitation Department',
            estimatedCompletion: '2024-11-26T17:00:00.000Z',
            resolvedAt: '2024-11-26T10:15:00.000Z',
            resolution: 'Collection completed on Tuesday morning. Apologies for the delay.'
        }
    ];

    // Filter by status if provided
    if (status) {
        serviceRequests = serviceRequests.filter(sr =>
            sr.status.toLowerCase() === status.toLowerCase()
        );
    }

    res.json({
        success: true,
        data: {
            serviceRequests,
            summary: {
                total: serviceRequests.length,
                pending: serviceRequests.filter(sr => sr.status === 'Pending').length,
                inProgress: serviceRequests.filter(sr => sr.status === 'In Progress').length,
                resolved: serviceRequests.filter(sr => sr.status === 'Resolved').length
            }
        }
    });
});

/**
 * GET /api/service-requests/:id
 * Get specific service request details
 */
router.get('/:id', authenticateToken, (req, res) => {
    const requestId = parseInt(req.params.id);

    // Mock service request detail - replace with database query
    const serviceRequest = {
        id: requestId,
        accountNumber: req.user.accountNumber,
        accountHolder: 'John Doe',
        type: 'Water Leak',
        category: 'Water',
        description: 'Water leak on the main road near my property. Water is flowing continuously.',
        status: 'In Progress',
        priority: 'High',
        location: '123 Main Street, Okahandja',
        coordinates: {
            lat: -21.9835,
            lng: 16.9205
        },
        createdAt: '2024-12-10T08:00:00.000Z',
        updatedAt: '2024-12-12T14:30:00.000Z',
        assignedTo: 'Water Department',
        assignedStaff: {
            name: 'Mike Johnson',
            phone: '+26462503001',
            email: 'mike.j@okahandja.gov.na'
        },
        estimatedCompletion: '2024-12-15T17:00:00.000Z',
        attachments: [],
        updates: [
            {
                date: '2024-12-12T14:30:00.000Z',
                message: 'Team dispatched to assess the situation',
                updatedBy: 'Mike Johnson'
            },
            {
                date: '2024-12-10T09:15:00.000Z',
                message: 'Request received and assigned to Water Department',
                updatedBy: 'System'
            }
        ]
    };

    res.json({
        success: true,
        data: serviceRequest
    });
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

    const { type, category, description, location, priority, coordinates } = req.body;
    const accountNumber = req.user.accountNumber;

    // Mock service request creation - replace with database insert
    const newRequest = {
        id: Date.now(),
        accountNumber,
        type,
        category,
        description,
        status: 'Pending',
        priority: priority || 'Medium',
        location,
        coordinates: coordinates || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedTo: null,
        estimatedCompletion: null
    };

    res.status(201).json({
        success: true,
        message: 'Service request created successfully',
        data: newRequest
    });
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
    body('status').isIn(['Pending', 'In Progress', 'Resolved', 'Cancelled']).withMessage('Invalid status')
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
    const { status, resolution, estimatedCompletion } = req.body;

    // Mock status update - replace with database update
    const updatedRequest = {
        id: requestId,
        status,
        resolution: resolution || null,
        estimatedCompletion: estimatedCompletion || null,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
    };

    res.json({
        success: true,
        message: 'Service request status updated successfully',
        data: updatedRequest
    });
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
