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

        const { billId, service, amount, paymentMethod, paymentDetails } = req.body;
        const accountNumber = req.user.accountNumber;

        // Generate payment reference
        const reference = generatePaymentReference(paymentMethod);

        // Process payment based on gateway
        let paymentResult;
        switch (paymentMethod) {
            case 'nampost':
                paymentResult = await processNamPostPayment(paymentDetails, amount);
                break;
            case 'banktransfer':
                paymentResult = await processBankTransfer(paymentDetails, amount);
                break;
            case 'card':
                paymentResult = await processCardPayment(paymentDetails, amount);
                break;
            case 'mobilemoney':
                paymentResult = await processMobileMoney(paymentDetails, amount);
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

        // Create payment record
        const payment = {
            id: Date.now(),
            accountNumber,
            billId: billId || null,
            service,
            amount,
            paymentMethod,
            reference,
            status: paymentResult.status || 'success',
            transactionId: paymentResult.transactionId || reference,
            createdAt: new Date().toISOString(),
            processedAt: paymentResult.status === 'success' ? new Date().toISOString() : null
        };

        // If payment successful, update bill status
        if (paymentResult.status === 'success' && billId) {
            // Mock bill update - replace with database update
            console.log(`Bill ${billId} marked as paid`);
        }

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
router.get('/history', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const accountNumber = req.user.accountNumber;

    // Mock payment history - replace with database query
    const allPayments = [
        {
            id: 1,
            date: '2024-12-10',
            service: 'Water',
            amount: 1180.00,
            method: 'Card Payment (****1234)',
            reference: 'CARD-1702195200000',
            status: 'Success'
        },
        {
            id: 2,
            date: '2024-11-12',
            service: 'Electricity',
            amount: 1650.00,
            method: 'MTC Mobile Money',
            reference: 'MM-1699776000000',
            status: 'Success'
        },
        {
            id: 3,
            date: '2024-10-15',
            service: 'Property Rates',
            amount: 1275.00,
            method: 'Bank Transfer (FNB)',
            reference: 'BT-1697328000000',
            status: 'Success'
        },
        {
            id: 4,
            date: '2024-09-20',
            service: 'Refuse Collection',
            amount: 548.00,
            method: 'Nam Post Mobile Money',
            reference: 'NMMP-1695168000000',
            status: 'Success'
        }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = allPayments.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            payments: paginatedPayments,
            pagination: {
                page,
                limit,
                total: allPayments.length,
                totalPages: Math.ceil(allPayments.length / limit)
            },
            summary: {
                totalPaid: allPayments.reduce((sum, p) => sum + p.amount, 0),
                lastPaymentDate: allPayments[0]?.date,
                lastPaymentAmount: allPayments[0]?.amount
            }
        }
    });
});

/**
 * GET /api/payments/:id
 * Get specific payment details
 */
router.get('/:id', authenticateToken, (req, res) => {
    const paymentId = parseInt(req.params.id);

    // Mock payment detail - replace with database query
    const payment = {
        id: paymentId,
        accountNumber: req.user.accountNumber,
        accountHolder: 'John Doe',
        service: 'Water',
        amount: 1180.00,
        paymentMethod: 'Card Payment',
        maskedCardNumber: '****1234',
        reference: 'CARD-1702195200000',
        transactionId: 'TXN-20241210-001',
        status: 'Success',
        billId: 5,
        billingPeriod: 'November 2024',
        createdAt: '2024-12-10T14:30:00.000Z',
        processedAt: '2024-12-10T14:30:05.000Z',
        receiptUrl: `/receipts/CARD-1702195200000.pdf`
    };

    res.json({
        success: true,
        data: payment
    });
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
router.get('/', [authenticateToken, requireStaff], (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Mock payments list - replace with database query
    const allPayments = [
        {
            id: 1,
            accountNumber: '12345678',
            accountHolder: 'John Doe',
            service: 'Water',
            amount: 1180.00,
            paymentMethod: 'Card Payment',
            reference: 'CARD-1702195200000',
            status: 'Success',
            createdAt: '2024-12-10T14:30:00.000Z'
        },
        {
            id: 2,
            accountNumber: '87654321',
            accountHolder: 'Jane Smith',
            service: 'Electricity',
            amount: 1650.00,
            paymentMethod: 'Mobile Money',
            reference: 'MM-1702281600000',
            status: 'Success',
            createdAt: '2024-12-11T09:15:00.000Z'
        }
    ];

    // Apply filters
    let filteredPayments = allPayments;
    if (status) {
        filteredPayments = filteredPayments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            payments: paginatedPayments,
            pagination: {
                page,
                limit,
                total: filteredPayments.length,
                totalPages: Math.ceil(filteredPayments.length / limit)
            },
            summary: {
                totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
                successfulPayments: filteredPayments.filter(p => p.status === 'Success').length,
                pendingPayments: filteredPayments.filter(p => p.status === 'Pending').length
            }
        }
    });
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

/**
 * GET /api/payments/all (Admin only)
 * Get all payments from all users
 */
router.get('/all', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const sql = `
            SELECT
                payment_id,
                account_number,
                amount,
                payment_method,
                payment_reference,
                service,
                status,
                created_at,
                updated_at
            FROM payments
            ORDER BY created_at DESC
        `;
        const payments = await db.query(sql);

        res.json({
            success: true,
            payments: payments
        });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch payments'
            }
        });
    }
});

module.exports = router;
