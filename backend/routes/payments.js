/**
 * Payment Routes
 * Handles payment processing, payment history, and gateway integration
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

/**
 * Helper function to convert snake_case to camelCase
 */
function toCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => toCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

/**
 * POST /api/payments/process
 * Process a payment
 */
router.post('/process', [
    authenticateToken,
    body('billId').optional().isInt().withMessage('Bill ID must be an integer'),
    body('service').notEmpty().withMessage('Service is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('paymentDetails').optional().isObject().withMessage('Payment details must be an object')
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

        const { billId, service, amount, paymentDetails } = req.body;
        const paymentMethod = req.body.paymentMethod.toLowerCase();
        const accountNumber = req.user.accountNumber;

        // Generate payment reference
        const reference = generatePaymentReference(paymentMethod);

        // Process payment based on gateway
        let paymentResult;
        try {
            switch (paymentMethod) {
                case 'nampost':
                    paymentResult = typeof processNamPostPayment === 'function'
                        ? await processNamPostPayment(paymentDetails, amount)
                        : { status: 'success', transactionId: reference };
                    break;
                case 'banktransfer':
                    paymentResult = typeof processBankTransfer === 'function'
                        ? await processBankTransfer(paymentDetails, amount)
                        : { status: 'success', transactionId: reference };
                    break;
                case 'card':
                    paymentResult = typeof processCardPayment === 'function'
                        ? await processCardPayment(paymentDetails, amount)
                        : { status: 'success', transactionId: reference };
                    break;
                case 'mobilemoney':
                    paymentResult = typeof processMobileMoney === 'function'
                        ? await processMobileMoney(paymentDetails, amount)
                        : { status: 'success', transactionId: reference };
                    break;
                case 'cash':
                    paymentResult = { status: 'pending', requiresVerification: true };
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Invalid payment method'
                        }
                    });
            }
        } catch (gatewayError) {
            console.error('Payment gateway error:', gatewayError);
            // If gateway fails, default to success for now (stub behavior)
            paymentResult = { status: 'success', transactionId: reference };
        }

        // Use transaction to ensure atomicity
        const result = await db.transaction(async (connection) => {
            // Insert payment record
            const paymentData = {
                account_number: accountNumber,
                bill_id: billId || null,
                service,
                amount,
                payment_method: paymentMethod,
                payment_reference: reference,
                status: paymentResult.status || 'success',
                payment_details: paymentDetails ? JSON.stringify(paymentDetails) : null,
                transaction_id: paymentResult.transactionId || reference
            };

            const [insertResult] = await connection.query(
                `INSERT INTO payments (
                    account_number, bill_id, service, amount, payment_method,
                    payment_reference, status, payment_details, transaction_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    paymentData.account_number,
                    paymentData.bill_id,
                    paymentData.service,
                    paymentData.amount,
                    paymentData.payment_method,
                    paymentData.payment_reference,
                    paymentData.status,
                    paymentData.payment_details,
                    paymentData.transaction_id
                ]
            );

            const paymentId = insertResult.insertId;

            // If payment successful and billId provided, update bill status
            if ((paymentResult.status === 'success') && billId) {
                await connection.query(
                    `UPDATE bills
                     SET status = 'Paid', paid_date = NOW()
                     WHERE id = ? AND account_number = ?`,
                    [billId, accountNumber]
                );
            }

            // Fetch the created payment record
            const [rows] = await connection.query(
                `SELECT * FROM payments WHERE id = ?`,
                [paymentId]
            );

            return rows[0];
        });

        // Convert to camelCase and return
        const payment = toCamelCase(result);

        res.status(201).json({
            success: true,
            message: paymentResult.status === 'success' ? 'Payment processed successfully' : 'Payment initiated',
            data: payment
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Payment processing failed',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/payments/history
 * Get payment history for current user
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const accountNumber = req.user.accountNumber;

        const offset = (page - 1) * limit;

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total
            FROM payments
            WHERE account_number = ?
        `;
        const countResult = await db.queryOne(countSql, [accountNumber]);
        const total = countResult.total;

        // Get paginated payments
        const sql = `
            SELECT
                id,
                service,
                amount,
                payment_method,
                payment_reference,
                status,
                transaction_id,
                created_at,
                updated_at
            FROM payments
            WHERE account_number = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const payments = await db.query(sql, [accountNumber, limit, offset]);

        // Get summary statistics
        const summarySql = `
            SELECT
                COALESCE(SUM(amount), 0) as total_paid,
                MAX(created_at) as last_payment_date
            FROM payments
            WHERE account_number = ? AND status = 'success'
        `;
        const summaryResult = await db.queryOne(summarySql, [accountNumber]);

        const lastPaymentSql = `
            SELECT amount as last_payment_amount
            FROM payments
            WHERE account_number = ? AND status = 'success'
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const lastPayment = await db.queryOne(lastPaymentSql, [accountNumber]);

        res.json({
            success: true,
            data: {
                payments: toCamelCase(payments),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                summary: {
                    totalPaid: parseFloat(summaryResult.total_paid),
                    lastPaymentDate: summaryResult.last_payment_date,
                    lastPaymentAmount: lastPayment ? parseFloat(lastPayment.last_payment_amount) : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch payment history',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/payments/all (Admin only)
 * Get all payments from all users
 * IMPORTANT: This route must come BEFORE /:id route to avoid matching "all" as an ID
 */
router.get('/all', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM payments`;
        const countResult = await db.queryOne(countSql);
        const total = countResult.total;

        // Get all payments with pagination
        const sql = `
            SELECT
                p.id,
                p.account_number,
                u.name as account_holder,
                p.bill_id,
                p.service,
                p.amount,
                p.payment_method,
                p.payment_reference,
                p.status,
                p.transaction_id,
                p.created_at,
                p.updated_at
            FROM payments p
            LEFT JOIN users u ON p.account_number = u.account_number
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const payments = await db.query(sql, [limit, offset]);

        res.json({
            success: true,
            data: {
                payments: toCamelCase(payments),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch payments',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/payments/:id
 * Get specific payment details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const paymentId = parseInt(req.params.id);
        const accountNumber = req.user.accountNumber;
        const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

        // Build query based on user role
        const sql = `
            SELECT
                p.id,
                p.account_number,
                p.bill_id,
                p.service,
                p.amount,
                p.payment_method,
                p.payment_reference,
                p.status,
                p.transaction_id,
                p.payment_details,
                p.created_at,
                p.updated_at,
                u.name as account_holder,
                b.billing_period
            FROM payments p
            LEFT JOIN users u ON p.account_number = u.account_number
            LEFT JOIN bills b ON p.bill_id = b.id
            WHERE p.id = ?
            ${!isStaffOrAdmin ? 'AND p.account_number = ?' : ''}
        `;

        const params = isStaffOrAdmin ? [paymentId] : [paymentId, accountNumber];
        const payment = await db.queryOne(sql, params);

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Payment not found'
                }
            });
        }

        // Parse JSON fields
        if (payment.payment_details) {
            try {
                payment.payment_details = JSON.parse(payment.payment_details);
            } catch (e) {
                payment.payment_details = null;
            }
        }

        res.json({
            success: true,
            data: toCamelCase(payment)
        });

    } catch (error) {
        console.error('Error fetching payment details:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch payment details',
                details: error.message
            }
        });
    }
});

/**
 * POST /api/payments/verify
 * Verify payment status (for async payments)
 */
router.post('/verify', [
    authenticateToken,
    body('reference').notEmpty().withMessage('Payment reference is required')
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

    const { reference } = req.body;

    // Mock payment verification - replace with actual gateway verification
    const paymentStatus = {
        reference,
        status: 'success',
        amount: 1245.00,
        verifiedAt: new Date().toISOString()
    };

    res.json({
        success: true,
        data: paymentStatus
    });
});

/**
 * GET /api/payments/methods
 * Get available payment methods
 */
router.get('/methods/available', (req, res) => {
    const paymentMethods = [
        {
            id: 'nampost',
            name: 'Nam Post Mobile Money',
            icon: '📱',
            enabled: true,
            description: 'Pay with Nam Post Mobile Money',
            processingTime: 'Instant',
            fees: 'N$ 5.00'
        },
        {
            id: 'banktransfer',
            name: 'Bank Transfer',
            icon: '🏦',
            enabled: true,
            description: 'Direct bank transfer (FNB, Bank Windhoek, Standard Bank)',
            processingTime: '1-2 business days',
            fees: 'Free'
        },
        {
            id: 'card',
            name: 'Debit/Credit Card',
            icon: '💳',
            enabled: true,
            description: 'Visa, Mastercard accepted',
            processingTime: 'Instant',
            fees: '2.5% of amount'
        },
        {
            id: 'mobilemoney',
            name: 'Mobile Money',
            icon: '📲',
            enabled: true,
            description: 'MTC Mobile Money, TN Mobile',
            processingTime: 'Instant',
            fees: 'N$ 3.00'
        },
        {
            id: 'cash',
            name: 'Pay at Office',
            icon: '💵',
            enabled: true,
            description: 'Visit municipal office to pay in cash',
            processingTime: 'Immediate upon office visit',
            fees: 'Free'
        }
    ];

    res.json({
        success: true,
        data: paymentMethods
    });
});

/**
 * GET /api/payments/receipts/:reference
 * Download payment receipt
 */
router.get('/receipts/:reference', authenticateToken, (req, res) => {
    const reference = req.params.reference;

    // Mock receipt generation - replace with actual PDF generation
    res.json({
        success: true,
        message: 'Receipt generated',
        data: {
            reference,
            receiptUrl: `/receipts/${reference}.pdf`,
            downloadUrl: `/api/payments/receipts/${reference}/download`
        }
    });
});

/**
 * GET /api/payments (Staff only)
 * Get all payments with filters
 */
router.get('/', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const offset = (page - 1) * limit;

        // Build WHERE clause
        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('p.status = ?');
            queryParams.push(status.toLowerCase());
        }

        if (startDate) {
            whereConditions.push('DATE(p.created_at) >= ?');
            queryParams.push(startDate);
        }

        if (endDate) {
            whereConditions.push('DATE(p.created_at) <= ?');
            queryParams.push(endDate);
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total
            FROM payments p
            ${whereClause}
        `;
        const countResult = await db.queryOne(countSql, queryParams);
        const total = countResult.total;

        // Get paginated payments
        const sql = `
            SELECT
                p.id,
                p.account_number,
                u.name as account_holder,
                p.service,
                p.amount,
                p.payment_method,
                p.payment_reference,
                p.status,
                p.transaction_id,
                p.created_at,
                p.updated_at
            FROM payments p
            LEFT JOIN users u ON p.account_number = u.account_number
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const allQueryParams = [...queryParams, limit, offset];
        const payments = await db.query(sql, allQueryParams);

        // Get summary statistics
        const summarySql = `
            SELECT
                COALESCE(SUM(amount), 0) as total_amount
            FROM payments p
            ${whereClause}
        `;
        const summaryResult = await db.queryOne(summarySql, queryParams);

        const successSql = `
            SELECT COUNT(*) as count
            FROM payments p
            ${whereClause ? whereClause + ' AND' : 'WHERE'} p.status = 'success'
        `;
        const successResult = await db.queryOne(successSql, queryParams);

        const pendingSql = `
            SELECT COUNT(*) as count
            FROM payments p
            ${whereClause ? whereClause + ' AND' : 'WHERE'} p.status = 'pending'
        `;
        const pendingResult = await db.queryOne(pendingSql, queryParams);

        res.json({
            success: true,
            data: {
                payments: toCamelCase(payments),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                summary: {
                    totalAmount: parseFloat(summaryResult.total_amount),
                    successfulPayments: successResult.count,
                    pendingPayments: pendingResult.count
                }
            }
        });

    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch payments',
                details: error.message
            }
        });
    }
});

// Helper functions for payment processing

function generatePaymentReference(method) {
    const prefixes = {
        'nampost': 'NMMP',
        'banktransfer': 'BT',
        'card': 'CARD',
        'mobilemoney': 'MM',
        'cash': 'CASH'
    };
    const prefix = prefixes[method] || 'PAY';
    return `${prefix}-${Date.now()}`;
}

async function processNamPostPayment(details, amount) {
    // Mock Nam Post payment processing
    // In production, integrate with Nam Post API
    return {
        status: 'success',
        transactionId: `NMMP-TXN-${Date.now()}`,
        message: 'Payment processed via Nam Post Mobile Money'
    };
}

async function processBankTransfer(details, amount) {
    // Mock bank transfer processing
    // In production, integrate with bank APIs
    return {
        status: 'pending',
        transactionId: `BT-TXN-${Date.now()}`,
        message: 'Bank transfer initiated. Processing may take 1-2 business days'
    };
}

async function processCardPayment(details, amount) {
    // Mock card payment processing
    // In production, integrate with payment gateway (e.g., Peach Payments, PayGate)
    return {
        status: 'success',
        transactionId: `CARD-TXN-${Date.now()}`,
        message: 'Card payment processed successfully'
    };
}

async function processMobileMoney(details, amount) {
    // Mock mobile money processing
    // In production, integrate with MTC or TN Mobile APIs
    return {
        status: 'success',
        transactionId: `MM-TXN-${Date.now()}`,
        message: 'Mobile money payment processed successfully'
    };
}

module.exports = router;
