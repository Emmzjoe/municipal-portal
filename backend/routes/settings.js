/**
 * Settings Routes
 * Handles system settings, user preferences, and configuration
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/settings/user
 * Get user settings and preferences
 */
router.get('/user', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock user settings - replace with database query
    const settings = {
        accountNumber,
        theme: 'light',
        language: 'en',
        currency: 'NAD',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',

        notifications: {
            email: true,
            sms: false,
            push: true,
            paymentReminders: true,
            billAlerts: true,
            serviceUpdates: true
        },

        privacy: {
            shareUsageData: false,
            publicProfile: false
        },

        billing: {
            autoPay: false,
            preferredPaymentMethod: 'card',
            emailStatements: true,
            paperlessStatements: true
        },

        display: {
            dashboardView: 'detailed',
            chartType: 'line',
            showConsumptionTrends: true
        }
    };

    res.json({
        success: true,
        data: settings
    });
});

/**
 * PUT /api/settings/user
 * Update user settings and preferences
 */
router.put('/user', authenticateToken, (req, res) => {
    const { theme, language, notifications, privacy, billing, display } = req.body;
    const accountNumber = req.user.accountNumber;

    // Mock settings update - replace with database update
    const updatedSettings = {
        accountNumber,
        theme: theme || 'light',
        language: language || 'en',
        notifications: notifications || {},
        privacy: privacy || {},
        billing: billing || {},
        display: display || {},
        updatedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
    });
});

/**
 * GET /api/settings/system (Admin only)
 * Get system-wide settings
 */
router.get('/system', [authenticateToken, requireAdmin], (req, res) => {
    // Mock system settings - replace with database query
    const systemSettings = {
        application: {
            name: 'Okahandja Municipality Portal',
            version: '1.0.0',
            maintenanceMode: false,
            registrationEnabled: true,
            loginEnabled: true
        },

        billing: {
            billingCycle: 'monthly',
            gracePeriod: 7,
            lateFeePercentage: 5,
            minimumPayment: 10.00,
            currency: 'NAD',
            taxRate: 15
        },

        payments: {
            enabledGateways: ['nampost', 'banktransfer', 'card', 'mobilemoney', 'cash'],
            cardProcessingFee: 2.5,
            mobileMoneyFee: 3.00,
            minimumPayment: 10.00,
            maximumPayment: 100000.00
        },

        notifications: {
            enableEmail: true,
            enableSMS: false,
            enablePush: true,
            emailProvider: 'smtp',
            smsProvider: null,
            pushProvider: 'firebase'
        },

        serviceRequests: {
            autoAssignment: true,
            requiresApproval: false,
            allowAnonymous: false,
            maxAttachments: 5,
            maxAttachmentSize: 5242880
        },

        security: {
            passwordMinLength: 8,
            passwordRequireUppercase: true,
            passwordRequireNumbers: true,
            passwordRequireSpecial: true,
            sessionTimeout: 3600,
            maxLoginAttempts: 5,
            lockoutDuration: 900,
            twoFactorEnabled: false
        },

        api: {
            rateLimit: 100,
            rateLimitWindow: 900000,
            corsEnabled: true,
            apiVersion: 'v1'
        }
    };

    res.json({
        success: true,
        data: systemSettings
    });
});

/**
 * PUT /api/settings/system (Admin only)
 * Update system-wide settings
 */
router.put('/system', [
    authenticateToken,
    requireAdmin,
    body('application').optional().isObject().withMessage('Application settings must be an object'),
    body('billing').optional().isObject().withMessage('Billing settings must be an object')
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

    const { application, billing, payments, notifications, serviceRequests, security, api } = req.body;

    // Mock system settings update - replace with database update
    const updatedSettings = {
        application: application || {},
        billing: billing || {},
        payments: payments || {},
        notifications: notifications || {},
        serviceRequests: serviceRequests || {},
        security: security || {},
        api: api || {},
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
    };

    res.json({
        success: true,
        message: 'System settings updated successfully',
        data: updatedSettings
    });
});

/**
 * GET /api/settings/tariffs (Admin only)
 * Get service tariffs and rates
 */
router.get('/tariffs', [authenticateToken, requireAdmin], (req, res) => {
    // Mock tariffs - replace with database query
    const tariffs = {
        water: {
            basicCharge: 150.00,
            tiers: [
                { from: 0, to: 50, rate: 5.50, unit: 'm³' },
                { from: 51, to: 100, rate: 7.00, unit: 'm³' },
                { from: 101, to: 200, rate: 8.50, unit: 'm³' },
                { from: 201, to: null, rate: 10.00, unit: 'm³' }
            ],
            sanitationFee: 100.00
        },

        electricity: {
            basicCharge: 180.00,
            tiers: [
                { from: 0, to: 100, rate: 1.80, unit: 'kWh' },
                { from: 101, to: 300, rate: 2.50, unit: 'kWh' },
                { from: 301, to: 600, rate: 3.20, unit: 'kWh' },
                { from: 601, to: null, rate: 4.00, unit: 'kWh' }
            ]
        },

        propertyRates: {
            residentialRate: 0.0015,
            commercialRate: 0.0025,
            industrialRate: 0.0030,
            minimumCharge: 500.00
        },

        refuseCollection: {
            residential: 548.00,
            commercial: 1200.00,
            industrial: 2500.00,
            frequency: 'weekly'
        },

        effectiveDate: '2024-01-01',
        nextReview: '2025-01-01'
    };

    res.json({
        success: true,
        data: tariffs
    });
});

/**
 * PUT /api/settings/tariffs (Admin only)
 * Update service tariffs and rates
 */
router.put('/tariffs', [
    authenticateToken,
    requireAdmin,
    body('effectiveDate').optional().isISO8601().withMessage('Invalid effective date')
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

    const { water, electricity, propertyRates, refuseCollection, effectiveDate } = req.body;

    // Mock tariff update - replace with database update
    const updatedTariffs = {
        water: water || {},
        electricity: electricity || {},
        propertyRates: propertyRates || {},
        refuseCollection: refuseCollection || {},
        effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
    };

    res.json({
        success: true,
        message: 'Tariffs updated successfully',
        data: updatedTariffs
    });
});

/**
 * GET /api/settings/holidays (Admin only)
 * Get public holidays
 */
router.get('/holidays', [authenticateToken, requireAdmin], (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Mock public holidays - replace with database query
    const holidays = [
        { date: `${year}-01-01`, name: "New Year's Day" },
        { date: `${year}-03-21`, name: 'Independence Day' },
        { date: `${year}-04-18`, name: 'Good Friday' },
        { date: `${year}-04-21`, name: 'Easter Monday' },
        { date: `${year}-05-01`, name: "Workers' Day" },
        { date: `${year}-05-04`, name: 'Cassinga Day' },
        { date: `${year}-05-25`, name: 'Africa Day' },
        { date: `${year}-08-26`, name: "Heroes' Day" },
        { date: `${year}-12-10`, name: 'International Human Rights Day' },
        { date: `${year}-12-25`, name: 'Christmas Day' },
        { date: `${year}-12-26`, name: 'Family Day' }
    ];

    res.json({
        success: true,
        data: {
            year,
            holidays
        }
    });
});

/**
 * GET /api/settings/office-hours (Admin only)
 * Get office hours and locations
 */
router.get('/office-hours', [authenticateToken, requireAdmin], (req, res) => {
    // Mock office information - replace with database query
    const officeInfo = {
        locations: [
            {
                name: 'Main Office',
                address: 'Voortrekker Street, Okahandja',
                phone: '+264 62 503 XXX',
                email: 'info@okahandja.gov.na',
                coordinates: {
                    lat: -21.9835,
                    lng: 16.9205
                },
                hours: {
                    monday: { open: '08:00', close: '16:30' },
                    tuesday: { open: '08:00', close: '16:30' },
                    wednesday: { open: '08:00', close: '16:30' },
                    thursday: { open: '08:00', close: '16:30' },
                    friday: { open: '08:00', close: '16:30' },
                    saturday: { open: null, close: null },
                    sunday: { open: null, close: null }
                },
                services: ['Payments', 'Customer Service', 'Bill Inquiries', 'Service Requests']
            }
        ],
        emergencyContact: {
            phone: '+264 62 503 999',
            email: 'emergency@okahandja.gov.na',
            available24x7: true
        }
    };

    res.json({
        success: true,
        data: officeInfo
    });
});

/**
 * GET /api/settings/faqs
 * Get frequently asked questions
 */
router.get('/faqs', (req, res) => {
    const category = req.query.category;

    // Mock FAQs - replace with database query
    let faqs = [
        {
            id: 1,
            category: 'billing',
            question: 'When are bills generated?',
            answer: 'Bills are generated on the 1st of each month for water, electricity, and refuse collection. Property rates are billed quarterly.'
        },
        {
            id: 2,
            category: 'billing',
            question: 'What is the grace period for payments?',
            answer: 'All bills have a 7-day grace period. Late payments may incur a 5% late fee.'
        },
        {
            id: 3,
            category: 'payments',
            question: 'What payment methods are accepted?',
            answer: 'We accept Nam Post Mobile Money, Bank Transfers, Debit/Credit Cards, Mobile Money (MTC, TN Mobile), and cash payments at our office.'
        },
        {
            id: 4,
            category: 'payments',
            question: 'Are there any payment fees?',
            answer: 'Card payments incur a 2.5% processing fee. Mobile Money payments have a N$ 3.00 fee. Bank transfers and cash payments are free.'
        },
        {
            id: 5,
            category: 'service_requests',
            question: 'How do I report a water leak?',
            answer: 'You can report a water leak through the service request portal. Select "Water Leak" as the type and provide details about the location.'
        },
        {
            id: 6,
            category: 'service_requests',
            question: 'How long does it take to resolve service requests?',
            answer: 'Resolution times vary by priority. High priority requests are typically resolved within 24-48 hours, medium priority within 3-5 days, and low priority within 7-10 days.'
        }
    ];

    // Filter by category if provided
    if (category) {
        faqs = faqs.filter(faq => faq.category === category);
    }

    res.json({
        success: true,
        data: {
            faqs,
            categories: ['billing', 'payments', 'service_requests', 'account', 'general']
        }
    });
});

/**
 * POST /api/settings/faqs (Admin only)
 * Add new FAQ
 */
router.post('/faqs', [
    authenticateToken,
    requireAdmin,
    body('category').notEmpty().withMessage('Category is required'),
    body('question').notEmpty().withMessage('Question is required'),
    body('answer').notEmpty().withMessage('Answer is required')
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

    const { category, question, answer } = req.body;

    // Mock FAQ creation - replace with database insert
    const newFaq = {
        id: Date.now(),
        category,
        question,
        answer,
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
    };

    res.status(201).json({
        success: true,
        message: 'FAQ added successfully',
        data: newFaq
    });
});

module.exports = router;
