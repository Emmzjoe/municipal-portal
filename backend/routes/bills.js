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
router.get('/', authenticateToken, async (req, res) => {
    try {
        const accountNumber = req.user.accountNumber;

        // Query bills from database
        const bills = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                total_amount AS totalAmount,
                created_at AS createdAt
            FROM bills
            WHERE account_number = ?
            AND status IN ('Pending', 'Due Soon', 'Overdue')
            ORDER BY due_date ASC
        `, [accountNumber]);

        // Calculate summary
        const summary = {
            totalOutstanding: bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0),
            totalBills: bills.length,
            overdueBills: bills.filter(b => new Date(b.dueDate) < new Date()).length
        };

        res.json({
            success: true,
            data: {
                bills,
                summary
            }
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch bills',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/bills/all (Admin only)
 * Get all bills from all users
 * IMPORTANT: This route must come BEFORE /:id route to avoid matching "all" as an ID
 */
router.get('/all', [authenticateToken, requireAdmin], async (req, res) => {
    try {
        const sql = `
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                total_amount AS totalAmount,
                created_at AS createdAt,
                updated_at AS updatedAt
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
        res.json({
            success: false,
            error: {
                message: 'Failed to fetch bills'
            }
        });
    }
});

/**
 * GET /api/bills/:id
 * Get specific bill details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const billId = parseInt(req.params.id);
        const accountNumber = req.user.accountNumber;

        // Query bill from database
        const billResult = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                vat_amount AS vatAmount,
                total_amount AS totalAmount,
                paid_date AS paidDate,
                created_at AS createdAt
            FROM bills
            WHERE id = ? AND account_number = ?
        `, [billId, accountNumber]);

        if (!billResult || billResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Bill not found',
                    status: 404
                }
            });
        }

        const bill = billResult[0];

        // Get payment history for this bill
        const paymentHistory = await db.query(`
            SELECT
                id,
                amount,
                payment_method AS paymentMethod,
                payment_reference AS paymentReference,
                status,
                created_at AS createdAt
            FROM payments
            WHERE bill_id = ?
            ORDER BY created_at DESC
        `, [billId]);

        bill.paymentHistory = paymentHistory || [];

        res.json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('Error fetching bill details:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch bill details',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/bills/service/:serviceName
 * Get bills for specific service
 */
router.get('/service/:serviceName', authenticateToken, async (req, res) => {
    try {
        const serviceName = req.params.serviceName;
        const accountNumber = req.user.accountNumber;

        // Query bills for specific service from database
        const bills = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                total_amount AS totalAmount,
                paid_date AS paidDate,
                created_at AS createdAt
            FROM bills
            WHERE account_number = ? AND service = ?
            ORDER BY created_at DESC
        `, [accountNumber, serviceName]);

        res.json({
            success: true,
            data: bills
        });
    } catch (error) {
        console.error('Error fetching service bills:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch service bills',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/bills/outstanding/summary
 * Get summary of all outstanding bills
 */
router.get('/outstanding/summary', authenticateToken, async (req, res) => {
    try {
        const accountNumber = req.user.accountNumber;

        // Query outstanding bills grouped by service
        const serviceBills = await db.query(`
            SELECT
                service,
                SUM(amount) as amount,
                MIN(due_date) as dueDate,
                MIN(due_date) < CURDATE() as isOverdue
            FROM bills
            WHERE account_number = ?
            AND status IN ('Pending', 'Due Soon', 'Overdue')
            GROUP BY service
            ORDER BY service
        `, [accountNumber]);

        // Query totals
        const totals = await db.query(`
            SELECT
                SUM(amount) as totalOutstanding,
                SUM(CASE WHEN due_date < CURDATE() THEN amount ELSE 0 END) as overdueAmount,
                MIN(due_date) as nextDueDate
            FROM bills
            WHERE account_number = ?
            AND status IN ('Pending', 'Due Soon', 'Overdue')
        `, [accountNumber]);

        const summary = {
            accountNumber: accountNumber,
            totalOutstanding: totals.length > 0 ? parseFloat(totals[0].totalOutstanding || 0) : 0,
            services: serviceBills.map(bill => ({
                service: bill.service,
                amount: parseFloat(bill.amount || 0),
                dueDate: bill.dueDate,
                isOverdue: Boolean(bill.isOverdue)
            })),
            overdueAmount: totals.length > 0 ? parseFloat(totals[0].overdueAmount || 0) : 0,
            nextDueDate: totals.length > 0 ? totals[0].nextDueDate : null
        };

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching outstanding summary:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch outstanding summary',
                details: error.message
            }
        });
    }
});

/**
 * POST /api/bills (Staff only)
 * Create new bill
 */
router.post('/', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const { accountNumber, service, amount, dueDate, billingPeriod, details } = req.body;

        if (!accountNumber || !service || !amount || !dueDate) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Missing required fields: accountNumber, service, amount, dueDate'
                }
            });
        }

        // Prepare bill data for insertion
        const billData = {
            account_number: accountNumber,
            service: service,
            amount: parseFloat(amount),
            due_date: dueDate,
            status: 'Pending',
            billing_period: billingPeriod || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };

        // Add optional fields if provided in details
        if (details) {
            if (details.previousReading) billData.previous_reading = parseFloat(details.previousReading);
            if (details.currentReading) billData.current_reading = parseFloat(details.currentReading);
            if (details.unitsConsumed) billData.units_consumed = parseFloat(details.unitsConsumed);
            if (details.ratePerUnit) billData.rate_per_unit = parseFloat(details.ratePerUnit);
            if (details.baseCharge) billData.base_charge = parseFloat(details.baseCharge);
            if (details.vatAmount) billData.vat_amount = parseFloat(details.vatAmount);
            if (details.totalAmount) billData.total_amount = parseFloat(details.totalAmount);
        }

        // Insert bill into database
        const billId = await db.insert('bills', billData);

        // Fetch the created bill
        const createdBill = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                vat_amount AS vatAmount,
                total_amount AS totalAmount,
                created_at AS createdAt
            FROM bills
            WHERE id = ?
        `, [billId]);

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            data: createdBill[0]
        });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to create bill',
                details: error.message
            }
        });
    }
});

/**
 * PUT /api/bills/:id (Staff only)
 * Update bill
 */
router.put('/:id', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const billId = parseInt(req.params.id);
        const { amount, dueDate, status, billingPeriod, details } = req.body;

        // Verify bill exists
        const existingBill = await db.query(`
            SELECT id FROM bills WHERE id = ?
        `, [billId]);

        if (!existingBill || existingBill.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Bill not found'
                }
            });
        }

        // Prepare update data
        const updateData = {};
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (dueDate !== undefined) updateData.due_date = dueDate;
        if (status !== undefined) updateData.status = status;
        if (billingPeriod !== undefined) updateData.billing_period = billingPeriod;

        // Add optional fields from details
        if (details) {
            if (details.previousReading !== undefined) updateData.previous_reading = parseFloat(details.previousReading);
            if (details.currentReading !== undefined) updateData.current_reading = parseFloat(details.currentReading);
            if (details.unitsConsumed !== undefined) updateData.units_consumed = parseFloat(details.unitsConsumed);
            if (details.ratePerUnit !== undefined) updateData.rate_per_unit = parseFloat(details.ratePerUnit);
            if (details.baseCharge !== undefined) updateData.base_charge = parseFloat(details.baseCharge);
            if (details.vatAmount !== undefined) updateData.vat_amount = parseFloat(details.vatAmount);
            if (details.totalAmount !== undefined) updateData.total_amount = parseFloat(details.totalAmount);
        }

        // Update bill in database
        await db.update('bills', updateData, 'id = ?', [billId]);

        // Fetch updated bill
        const updatedBill = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                vat_amount AS vatAmount,
                total_amount AS totalAmount,
                updated_at AS updatedAt
            FROM bills
            WHERE id = ?
        `, [billId]);

        res.json({
            success: true,
            message: 'Bill updated successfully',
            data: updatedBill[0]
        });
    } catch (error) {
        console.error('Error updating bill:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to update bill',
                details: error.message
            }
        });
    }
});

/**
 * DELETE /api/bills/:id (Staff only)
 * Delete/void bill
 */
router.delete('/:id', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const billId = parseInt(req.params.id);

        // Verify bill exists
        const existingBill = await db.query(`
            SELECT id, status FROM bills WHERE id = ?
        `, [billId]);

        if (!existingBill || existingBill.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Bill not found'
                }
            });
        }

        // Check if bill is already paid
        if (existingBill[0].status === 'Paid') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Cannot delete a paid bill'
                }
            });
        }

        // Delete bill from database
        await db.delete('bills', 'id = ?', [billId]);

        res.json({
            success: true,
            message: `Bill ${billId} has been deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to delete bill',
                details: error.message
            }
        });
    }
});

/**
 * PUT /api/bills/:id/pay (Staff only)
 * Mark bill as paid
 */
router.put('/:id/pay', [authenticateToken, requireStaff], async (req, res) => {
    try {
        const billId = parseInt(req.params.id);

        // Verify bill exists
        const existingBill = await db.query(`
            SELECT id, status FROM bills WHERE id = ?
        `, [billId]);

        if (!existingBill || existingBill.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Bill not found'
                }
            });
        }

        // Check if bill is already paid
        if (existingBill[0].status === 'Paid') {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Bill is already marked as paid'
                }
            });
        }

        // Update bill status to Paid
        await db.update('bills', {
            status: 'Paid',
            paid_date: new Date()
        }, 'id = ?', [billId]);

        // Fetch updated bill
        const updatedBill = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                paid_date AS paidDate,
                updated_at AS updatedAt
            FROM bills
            WHERE id = ?
        `, [billId]);

        res.json({
            success: true,
            message: 'Bill marked as paid successfully',
            data: updatedBill[0]
        });
    } catch (error) {
        console.error('Error marking bill as paid:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to mark bill as paid',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/bills/history/all
 * Get complete billing history
 */
router.get('/history/all', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const accountNumber = req.user.accountNumber;
        const offset = (page - 1) * limit;

        // Query total count
        const countResult = await db.query(`
            SELECT COUNT(*) as total
            FROM bills
            WHERE account_number = ?
        `, [accountNumber]);
        const total = countResult[0].total;

        // Query paginated bills
        const bills = await db.query(`
            SELECT
                id,
                account_number AS accountNumber,
                service,
                amount,
                due_date AS dueDate,
                status,
                billing_period AS billingPeriod,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                total_amount AS totalAmount,
                paid_date AS paidDate,
                created_at AS createdAt
            FROM bills
            WHERE account_number = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [accountNumber, limit, offset]);

        res.json({
            success: true,
            data: {
                bills: bills,
                pagination: {
                    page: page,
                    limit: limit,
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching billing history:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch billing history',
                details: error.message
            }
        });
    }
});

module.exports = router;
