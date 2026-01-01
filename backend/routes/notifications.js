/**
 * Notification Routes
 * Handles user notifications, alerts, and notification preferences
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/notifications
 * Get notifications for current user
 */
router.get('/', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const accountNumber = req.user.accountNumber;

    // Mock notifications - replace with database query
    let allNotifications = [
        {
            id: 1,
            accountNumber,
            type: 'payment_reminder',
            title: 'Payment Due Reminder',
            message: 'Your water bill of N$ 1,245.00 is due on January 15, 2025',
            priority: 'high',
            read: false,
            actionUrl: '/bills',
            createdAt: '2024-12-14T08:00:00.000Z'
        },
        {
            id: 2,
            accountNumber,
            type: 'service_request_update',
            title: 'Service Request Update',
            message: 'Your water leak service request has been assigned to the Water Department',
            priority: 'medium',
            read: false,
            actionUrl: '/service-requests/1',
            createdAt: '2024-12-12T14:30:00.000Z'
        },
        {
            id: 3,
            accountNumber,
            type: 'bill_generated',
            title: 'New Bill Generated',
            message: 'Your December 2024 electricity bill is now available',
            priority: 'medium',
            read: true,
            actionUrl: '/bills/2',
            createdAt: '2024-12-01T00:00:00.000Z'
        },
        {
            id: 4,
            accountNumber,
            type: 'payment_confirmation',
            title: 'Payment Received',
            message: 'Payment of N$ 1,180.00 for Water has been successfully processed',
            priority: 'low',
            read: true,
            actionUrl: '/payments/1',
            createdAt: '2024-11-10T15:20:00.000Z'
        },
        {
            id: 5,
            accountNumber,
            type: 'system_announcement',
            title: 'Scheduled Water Maintenance',
            message: 'Water supply will be interrupted on December 20 from 8:00 AM to 2:00 PM in your area',
            priority: 'high',
            read: false,
            actionUrl: null,
            createdAt: '2024-12-13T10:00:00.000Z'
        }
    ];

    // Filter unread if requested
    if (unreadOnly) {
        allNotifications = allNotifications.filter(n => !n.read);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = allNotifications.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            notifications: paginatedNotifications,
            pagination: {
                page,
                limit,
                total: allNotifications.length,
                totalPages: Math.ceil(allNotifications.length / limit)
            },
            summary: {
                unreadCount: allNotifications.filter(n => !n.read).length,
                highPriority: allNotifications.filter(n => n.priority === 'high' && !n.read).length
            }
        }
    });
});

/**
 * GET /api/notifications/:id
 * Get specific notification
 */
router.get('/:id', authenticateToken, (req, res) => {
    const notificationId = parseInt(req.params.id);

    // Mock notification detail - replace with database query
    const notification = {
        id: notificationId,
        accountNumber: req.user.accountNumber,
        type: 'payment_reminder',
        title: 'Payment Due Reminder',
        message: 'Your water bill of N$ 1,245.00 is due on January 15, 2025. Please make payment to avoid service interruption.',
        priority: 'high',
        read: false,
        actionUrl: '/bills',
        metadata: {
            billId: 1,
            amount: 1245.00,
            service: 'Water',
            dueDate: '2025-01-15'
        },
        createdAt: '2024-12-14T08:00:00.000Z'
    };

    res.json({
        success: true,
        data: notification
    });
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', authenticateToken, (req, res) => {
    const notificationId = parseInt(req.params.id);

    // Mock mark as read - replace with database update
    res.json({
        success: true,
        message: 'Notification marked as read',
        data: {
            id: notificationId,
            read: true,
            readAt: new Date().toISOString()
        }
    });
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock mark all as read - replace with database update
    res.json({
        success: true,
        message: 'All notifications marked as read',
        data: {
            updatedCount: 3,
            updatedAt: new Date().toISOString()
        }
    });
});

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const notificationId = parseInt(req.params.id);

    // Mock deletion - replace with database delete
    res.json({
        success: true,
        message: `Notification ${notificationId} has been deleted`
    });
});

/**
 * DELETE /api/notifications/clear-all
 * Clear all read notifications
 */
router.delete('/clear-all', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock clear all - replace with database delete
    res.json({
        success: true,
        message: 'All read notifications have been cleared',
        data: {
            deletedCount: 2
        }
    });
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences
 */
router.get('/preferences/settings', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock preferences - replace with database query
    const preferences = {
        accountNumber,
        email: {
            enabled: true,
            paymentReminders: true,
            billGenerated: true,
            paymentConfirmation: true,
            serviceRequestUpdates: true,
            systemAnnouncements: true
        },
        sms: {
            enabled: false,
            paymentReminders: false,
            billGenerated: false,
            paymentConfirmation: false,
            serviceRequestUpdates: false,
            systemAnnouncements: false
        },
        push: {
            enabled: true,
            paymentReminders: true,
            billGenerated: true,
            paymentConfirmation: true,
            serviceRequestUpdates: true,
            systemAnnouncements: true
        },
        frequency: {
            dailyDigest: false,
            weeklyDigest: false,
            immediate: true
        }
    };

    res.json({
        success: true,
        data: preferences
    });
});

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
router.put('/preferences/settings', [
    authenticateToken,
    body('email').optional().isObject().withMessage('Email preferences must be an object'),
    body('sms').optional().isObject().withMessage('SMS preferences must be an object'),
    body('push').optional().isObject().withMessage('Push preferences must be an object')
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

    const { email, sms, push, frequency } = req.body;
    const accountNumber = req.user.accountNumber;

    // Mock update preferences - replace with database update
    const updatedPreferences = {
        accountNumber,
        email: email || {},
        sms: sms || {},
        push: push || {},
        frequency: frequency || {},
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: updatedPreferences
    });
});

/**
 * POST /api/notifications/send (Staff only)
 * Send notification to user(s)
 */
router.post('/send', [
    authenticateToken,
    requireStaff,
    body('accountNumbers').optional().isArray().withMessage('Account numbers must be an array'),
    body('type').notEmpty().withMessage('Notification type is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required')
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

    const { accountNumbers, type, title, message, priority, actionUrl } = req.body;

    // Mock notification sending - replace with actual notification service
    const notification = {
        id: Date.now(),
        type,
        title,
        message,
        priority: priority || 'medium',
        actionUrl: actionUrl || null,
        sentTo: accountNumbers ? accountNumbers.length : 'all',
        sentBy: req.user.id,
        createdAt: new Date().toISOString()
    };

    res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification
    });
});

/**
 * GET /api/notifications/stats/summary
 * Get notification statistics (for current user)
 */
router.get('/stats/summary', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock statistics - replace with database query
    const stats = {
        total: 15,
        unread: 3,
        byType: {
            payment_reminder: 4,
            bill_generated: 5,
            payment_confirmation: 3,
            service_request_update: 2,
            system_announcement: 1
        },
        byPriority: {
            high: 2,
            medium: 8,
            low: 5
        },
        last7Days: 5,
        last30Days: 15
    };

    res.json({
        success: true,
        data: stats
    });
});

module.exports = router;
