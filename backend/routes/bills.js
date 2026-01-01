/**
 * Bill Management Routes
 * Handles bill retrieval, updates, and bill-related operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');
const db = require('../config/database');

/**
 * GET /api/bills
 * Get current user's bills
 */
router.get('/', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock bills data - replace with database query
    const bills = [
        {
            id: 1,
            accountNumber: accountNumber,
            service: 'Water',
            amount: 1245.00,
            dueDate: '2025-01-15',
            status: 'Outstanding',
            billingPeriod: 'December 2024',
            meterReading: {
                previous: 12543,
                current: 12678,
                consumption: 135,
                unit: 'm³'
            },
            createdAt: '2024-12-01T00:00:00.000Z'
        },
        {
            id: 2,
            accountNumber: accountNumber,
            service: 'Electricity',
            amount: 1785.50,
            dueDate: '2025-01-15',
            status: 'Outstanding',
            billingPeriod: 'December 2024',
            meterReading: {
                previous: 45231,
                current: 45567,
                consumption: 336,
                unit: 'kWh'
            },
            createdAt: '2024-12-01T00:00:00.000Z'
        },
        {
            id: 3,
            accountNumber: accountNumber,
            service: 'Property Rates',
            amount: 1275.00,
            dueDate: '2025-01-20',
            status: 'Outstanding',
            billingPeriod: 'January 2025',
            propertyDetails: {
                erfNumber: 'ERF 1234',
                propertyValue: 850000,
                ratePercentage: 0.15
            },
            createdAt: '2024-12-15T00:00:00.000Z'
        },
        {
            id: 4,
            accountNumber: accountNumber,
            service: 'Refuse Collection',
            amount: 548.00,
            dueDate: '2025-01-15',
            status: 'Outstanding',
            billingPeriod: 'December 2024',
            serviceDetails: {
                binSize: '240L',
                frequency: 'Weekly'
            },
            createdAt: '2024-12-01T00:00:00.000Z'
        }
    ];

    res.json({
        success: true,
        data: {
            bills,
            summary: {
                totalOutstanding: bills.reduce((sum, bill) => sum + bill.amount, 0),
                totalBills: bills.length,
                overdueBills: bills.filter(b => new Date(b.dueDate) < new Date()).length
            }
        }
    });
});

/**
 * GET /api/bills/:id
 * Get specific bill details
 */
router.get('/:id', authenticateToken, (req, res) => {
    const billId = parseInt(req.params.id);
    const accountNumber = req.user.accountNumber;

    // Mock bill detail - replace with database query
    const bill = {
        id: billId,
        accountNumber: accountNumber,
        service: 'Water',
        amount: 1245.00,
        dueDate: '2025-01-15',
        status: 'Outstanding',
        billingPeriod: 'December 2024',
        meterReading: {
            previous: 12543,
            current: 12678,
            consumption: 135,
            unit: 'm³',
            readingDate: '2024-11-30'
        },
        breakdown: [
            { description: 'Water Consumption (135 m³)', amount: 945.00 },
            { description: 'Basic Charge', amount: 150.00 },
            { description: 'Sanitation Fee', amount: 100.00 },
            { description: 'VAT (15%)', amount: 50.00 }
        ],
        createdAt: '2024-12-01T00:00:00.000Z',
        paymentHistory: []
    };

    res.json({
        success: true,
        data: bill
    });
});

/**
 * GET /api/bills/service/:serviceName
 * Get bills for specific service
 */
router.get('/service/:serviceName', authenticateToken, (req, res) => {
    const serviceName = req.params.serviceName;
    const accountNumber = req.user.accountNumber;

    // Mock service bills - replace with database query
    const bills = [
        {
            id: 1,
            accountNumber: accountNumber,
            service: serviceName,
            amount: 1245.00,
            dueDate: '2025-01-15',
            status: 'Outstanding',
            billingPeriod: 'December 2024',
            createdAt: '2024-12-01T00:00:00.000Z'
        },
        {
            id: 5,
            accountNumber: accountNumber,
            service: serviceName,
            amount: 1180.00,
            dueDate: '2024-12-15',
            status: 'Paid',
            billingPeriod: 'November 2024',
            paidDate: '2024-12-10',
            createdAt: '2024-11-01T00:00:00.000Z'
        }
    ];

    res.json({
        success: true,
        data: bills
    });
});

/**
 * GET /api/bills/outstanding/summary
 * Get summary of all outstanding bills
 */
router.get('/outstanding/summary', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock outstanding summary
    const summary = {
        accountNumber: accountNumber,
        totalOutstanding: 4853.50,
        services: [
            {
                service: 'Water',
                amount: 1245.00,
                dueDate: '2025-01-15',
                isOverdue: false
            },
            {
                service: 'Electricity',
                amount: 1785.50,
                dueDate: '2025-01-15',
                isOverdue: false
            },
            {
                service: 'Property Rates',
                amount: 1275.00,
                dueDate: '2025-01-20',
                isOverdue: false
            },
            {
                service: 'Refuse Collection',
                amount: 548.00,
                dueDate: '2025-01-15',
                isOverdue: false
            }
        ],
        overdueAmount: 0,
        nextDueDate: '2025-01-15'
    };

    res.json({
        success: true,
        data: summary
    });
});

/**
 * POST /api/bills (Staff only)
 * Create new bill
 */
router.post('/', [authenticateToken, requireStaff], (req, res) => {
    const { accountNumber, service, amount, dueDate, billingPeriod, details } = req.body;

    if (!accountNumber || !service || !amount || !dueDate) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Missing required fields: accountNumber, service, amount, dueDate'
            }
        });
    }

    // Mock bill creation - replace with database insert
    const newBill = {
        id: Date.now(),
        accountNumber,
        service,
        amount,
        dueDate,
        status: 'Outstanding',
        billingPeriod: billingPeriod || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        details: details || {},
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
    };

    res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: newBill
    });
});

/**
 * PUT /api/bills/:id (Staff only)
 * Update bill
 */
router.put('/:id', [authenticateToken, requireStaff], (req, res) => {
    const billId = parseInt(req.params.id);
    const { amount, dueDate, status } = req.body;

    // Mock bill update - replace with database update
    const updatedBill = {
        id: billId,
        amount: amount || 1245.00,
        dueDate: dueDate || '2025-01-15',
        status: status || 'Outstanding',
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
    };

    res.json({
        success: true,
        message: 'Bill updated successfully',
        data: updatedBill
    });
});

/**
 * DELETE /api/bills/:id (Staff only)
 * Delete/void bill
 */
router.delete('/:id', [authenticateToken, requireStaff], (req, res) => {
    const billId = parseInt(req.params.id);

    // Mock bill deletion - replace with database soft delete
    res.json({
        success: true,
        message: `Bill ${billId} has been voided`
    });
});

/**
 * GET /api/bills/history/all
 * Get complete billing history
 */
router.get('/history/all', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const accountNumber = req.user.accountNumber;

    // Mock billing history - replace with database query
    const allBills = [
        {
            id: 1,
            service: 'Water',
            amount: 1245.00,
            dueDate: '2025-01-15',
            status: 'Outstanding',
            billingPeriod: 'December 2024'
        },
        {
            id: 5,
            service: 'Water',
            amount: 1180.00,
            dueDate: '2024-12-15',
            status: 'Paid',
            billingPeriod: 'November 2024',
            paidDate: '2024-12-10'
        },
        {
            id: 9,
            service: 'Water',
            amount: 1220.00,
            dueDate: '2024-11-15',
            status: 'Paid',
            billingPeriod: 'October 2024',
            paidDate: '2024-11-12'
        }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBills = allBills.slice(startIndex, endIndex);

    res.json({
        success: true,
        data: {
            bills: paginatedBills,
            pagination: {
                page,
                limit,
                total: allBills.length,
                totalPages: Math.ceil(allBills.length / limit)
            }
        }
    });
});

/**
 * GET /api/bills/all (Admin only)
 * Get all bills from all users
 */
router.get('/all', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const sql = `
            SELECT
                bill_id,
                account_number,
                service,
                amount,
                due_date,
                status,
                billing_period,
                previous_reading,
                current_reading,
                units_consumed,
                rate_per_unit,
                total_amount,
                created_at,
                updated_at
            FROM bills
            ORDER BY created_at DESC
        `;
        const bills = await db.query(sql);

        res.json({
            success: true,
            bills: bills
        });
    } catch (error) {
        console.error('Error fetching all bills:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch bills'
            }
        });
    }
});

module.exports = router;
