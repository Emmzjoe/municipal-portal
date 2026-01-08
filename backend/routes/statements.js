/**
 * Statement Routes
 * Handles account statements, statement generation, and downloads
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, requireStaff } = require('../middleware/auth');
const db = require('../config/database');

/**
 * Helper function to convert snake_case to camelCase
 */
function toCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => toCamelCase(item));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

/**
 * Helper function to calculate opening balance for a period
 */
async function calculateOpeningBalance(accountNumber, service, periodStart) {
    try {
        // Get all bills before this period
        const billsQuery = service === 'All Services'
            ? `SELECT COALESCE(SUM(amount), 0) AS totalBills
               FROM bills
               WHERE account_number = ? AND created_at < ?`
            : `SELECT COALESCE(SUM(amount), 0) AS totalBills
               FROM bills
               WHERE account_number = ? AND service = ? AND created_at < ?`;

        const billsParams = service === 'All Services'
            ? [accountNumber, periodStart]
            : [accountNumber, service, periodStart];

        const billsResult = await db.queryOne(billsQuery, billsParams);
        const totalBills = parseFloat(billsResult.totalBills || 0);

        // Get all payments before this period
        const paymentsQuery = service === 'All Services'
            ? `SELECT COALESCE(SUM(amount), 0) AS totalPayments
               FROM payments
               WHERE account_number = ? AND status = 'success' AND created_at < ?`
            : `SELECT COALESCE(SUM(amount), 0) AS totalPayments
               FROM payments
               WHERE account_number = ? AND service = ? AND status = 'success' AND created_at < ?`;

        const paymentsParams = service === 'All Services'
            ? [accountNumber, periodStart]
            : [accountNumber, service, periodStart];

        const paymentsResult = await db.queryOne(paymentsQuery, paymentsParams);
        const totalPayments = parseFloat(paymentsResult.totalPayments || 0);

        return totalBills - totalPayments;
    } catch (error) {
        console.error('Error calculating opening balance:', error);
        return 0;
    }
}

/**
 * GET /api/statements/:service/:period
 * Generate statement for specific service and period
 * Example: /api/statements/Water/2024-12 or /api/statements/Electricity/2024-11
 */
router.get('/:service/:period', authenticateToken, async (req, res) => {
    try {
        const accountNumber = req.user.accountNumber;
        const service = req.params.service;
        const period = req.params.period; // Format: YYYY-MM

        // Validate service
        const validServices = ['Water', 'Electricity', 'Property Rates', 'Refuse Collection'];
        if (!validServices.includes(service)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid service. Must be one of: Water, Electricity, Property Rates, Refuse Collection'
                }
            });
        }

        // Validate period format
        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(period)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid period format. Use YYYY-MM (e.g., 2024-12)'
                }
            });
        }

        // Calculate period dates
        const [year, month] = period.split('-');
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0, 23, 59, 59); // Last day of month

        // Get user details
        const user = await db.queryOne(`
            SELECT name, email, address
            FROM users
            WHERE account_number = ?
        `, [accountNumber]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Account not found'
                }
            });
        }

        // Calculate opening balance
        const openingBalance = await calculateOpeningBalance(accountNumber, service, periodStart);

        // Get bills for the period
        const bills = await db.query(`
            SELECT
                id,
                service,
                amount,
                billing_period AS billingPeriod,
                due_date AS dueDate,
                status,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                vat_amount AS vatAmount,
                total_amount AS totalAmount,
                created_at AS createdAt
            FROM bills
            WHERE account_number = ?
                AND service = ?
                AND created_at >= ?
                AND created_at <= ?
            ORDER BY created_at ASC
        `, [accountNumber, service, periodStart, periodEnd]);

        // Get payments for the period
        const payments = await db.query(`
            SELECT
                id,
                bill_id AS billId,
                service,
                amount,
                payment_method AS paymentMethod,
                payment_reference AS paymentReference,
                status,
                transaction_id AS transactionId,
                created_at AS createdAt
            FROM payments
            WHERE account_number = ?
                AND service = ?
                AND created_at >= ?
                AND created_at <= ?
                AND status = 'success'
            ORDER BY created_at ASC
        `, [accountNumber, service, periodStart, periodEnd]);

        // Calculate totals
        const totalCharges = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
        const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        const closingBalance = openingBalance + totalCharges - totalPayments;

        // Build statement data
        const statement = {
            accountDetails: {
                accountNumber,
                accountHolder: user.name,
                email: user.email,
                address: user.address
            },
            periodInformation: {
                service,
                period,
                periodStart: periodStart.toISOString(),
                periodEnd: periodEnd.toISOString(),
                statementDate: new Date().toISOString()
            },
            financialSummary: {
                openingBalance: parseFloat(openingBalance.toFixed(2)),
                totalCharges: parseFloat(totalCharges.toFixed(2)),
                totalPayments: parseFloat(totalPayments.toFixed(2)),
                closingBalance: parseFloat(closingBalance.toFixed(2))
            },
            transactions: {
                charges: bills,
                payments: payments
            }
        };

        res.json({
            success: true,
            data: statement
        });

    } catch (error) {
        console.error('Error generating statement:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to generate statement',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/statements/consolidated/:period
 * Generate consolidated statement for all services in a period
 * Example: /api/statements/consolidated/2024-12
 */
router.get('/consolidated/:period', authenticateToken, async (req, res) => {
    try {
        const accountNumber = req.user.accountNumber;
        const period = req.params.period; // Format: YYYY-MM

        // Validate period format
        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(period)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid period format. Use YYYY-MM (e.g., 2024-12)'
                }
            });
        }

        // Calculate period dates
        const [year, month] = period.split('-');
        const periodStart = new Date(year, month - 1, 1);
        const periodEnd = new Date(year, month, 0, 23, 59, 59); // Last day of month

        // Get user details
        const user = await db.queryOne(`
            SELECT name, email, address
            FROM users
            WHERE account_number = ?
        `, [accountNumber]);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Account not found'
                }
            });
        }

        // Calculate opening balance for all services
        const openingBalance = await calculateOpeningBalance(accountNumber, 'All Services', periodStart);

        // Get all bills for the period
        const bills = await db.query(`
            SELECT
                id,
                service,
                amount,
                billing_period AS billingPeriod,
                due_date AS dueDate,
                status,
                previous_reading AS previousReading,
                current_reading AS currentReading,
                units_consumed AS unitsConsumed,
                rate_per_unit AS ratePerUnit,
                base_charge AS baseCharge,
                vat_amount AS vatAmount,
                total_amount AS totalAmount,
                created_at AS createdAt
            FROM bills
            WHERE account_number = ?
                AND created_at >= ?
                AND created_at <= ?
            ORDER BY service, created_at ASC
        `, [accountNumber, periodStart, periodEnd]);

        // Get all payments for the period
        const payments = await db.query(`
            SELECT
                id,
                bill_id AS billId,
                service,
                amount,
                payment_method AS paymentMethod,
                payment_reference AS paymentReference,
                status,
                transaction_id AS transactionId,
                created_at AS createdAt
            FROM payments
            WHERE account_number = ?
                AND created_at >= ?
                AND created_at <= ?
                AND status = 'success'
            ORDER BY service, created_at ASC
        `, [accountNumber, periodStart, periodEnd]);

        // Group by service
        const services = ['Water', 'Electricity', 'Property Rates', 'Refuse Collection'];
        const serviceBreakdown = [];

        for (const service of services) {
            const serviceBills = bills.filter(b => b.service === service);
            const servicePayments = payments.filter(p => p.service === service);

            const totalCharges = serviceBills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
            const totalPayments = servicePayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

            // Calculate opening balance for this service
            const serviceOpeningBalance = await calculateOpeningBalance(accountNumber, service, periodStart);
            const serviceClosingBalance = serviceOpeningBalance + totalCharges - totalPayments;

            serviceBreakdown.push({
                service,
                openingBalance: parseFloat(serviceOpeningBalance.toFixed(2)),
                charges: parseFloat(totalCharges.toFixed(2)),
                payments: parseFloat(totalPayments.toFixed(2)),
                closingBalance: parseFloat(serviceClosingBalance.toFixed(2)),
                billCount: serviceBills.length,
                paymentCount: servicePayments.length
            });
        }

        // Calculate overall totals
        const totalCharges = bills.reduce((sum, bill) => sum + parseFloat(bill.amount || 0), 0);
        const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        const closingBalance = openingBalance + totalCharges - totalPayments;

        // Build consolidated statement
        const statement = {
            accountDetails: {
                accountNumber,
                accountHolder: user.name,
                email: user.email,
                address: user.address
            },
            periodInformation: {
                period,
                periodStart: periodStart.toISOString(),
                periodEnd: periodEnd.toISOString(),
                statementDate: new Date().toISOString(),
                statementType: 'Consolidated'
            },
            financialSummary: {
                openingBalance: parseFloat(openingBalance.toFixed(2)),
                totalCharges: parseFloat(totalCharges.toFixed(2)),
                totalPayments: parseFloat(totalPayments.toFixed(2)),
                closingBalance: parseFloat(closingBalance.toFixed(2))
            },
            serviceBreakdown,
            transactions: {
                charges: bills,
                payments: payments
            }
        };

        res.json({
            success: true,
            data: statement
        });

    } catch (error) {
        console.error('Error generating consolidated statement:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to generate consolidated statement',
                details: error.message
            }
        });
    }
});

/**
 * GET /api/statements
 * Get available statements for current user
 */
router.get('/', authenticateToken, (req, res) => {
    const accountNumber = req.user.accountNumber;

    // Mock statements list - replace with database query
    const statements = [
        {
            id: 1,
            accountNumber,
            period: 'December 2024',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            totalBilled: 4853.50,
            totalPaid: 0,
            balance: 4853.50,
            status: 'Current',
            generatedAt: '2024-12-01T00:00:00.000Z',
            downloadUrl: '/api/statements/1/download'
        },
        {
            id: 2,
            accountNumber,
            period: 'November 2024',
            startDate: '2024-11-01',
            endDate: '2024-11-30',
            totalBilled: 4625.00,
            totalPaid: 4625.00,
            balance: 0,
            status: 'Paid',
            generatedAt: '2024-11-01T00:00:00.000Z',
            downloadUrl: '/api/statements/2/download'
        },
        {
            id: 3,
            accountNumber,
            period: 'October 2024',
            startDate: '2024-10-01',
            endDate: '2024-10-31',
            totalBilled: 4580.50,
            totalPaid: 4580.50,
            balance: 0,
            status: 'Paid',
            generatedAt: '2024-10-01T00:00:00.000Z',
            downloadUrl: '/api/statements/3/download'
        }
    ];

    res.json({
        success: true,
        data: {
            statements,
            currentBalance: statements[0]?.balance || 0
        }
    });
});

/**
 * GET /api/statements/:id
 * Get detailed statement
 */
router.get('/:id', authenticateToken, (req, res) => {
    const statementId = parseInt(req.params.id);
    const accountNumber = req.user.accountNumber;

    // Mock statement detail - replace with database query
    const statement = {
        id: statementId,
        accountNumber,
        accountHolder: 'John Doe',
        period: 'December 2024',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        generatedAt: '2024-12-01T00:00:00.000Z',

        openingBalance: 0,

        bills: [
            {
                date: '2024-12-01',
                service: 'Water',
                description: 'December 2024 Water Bill',
                amount: 1245.00,
                status: 'Outstanding'
            },
            {
                date: '2024-12-01',
                service: 'Electricity',
                description: 'December 2024 Electricity Bill',
                amount: 1785.50,
                status: 'Outstanding'
            },
            {
                date: '2024-12-01',
                service: 'Refuse Collection',
                description: 'December 2024 Refuse Collection',
                amount: 548.00,
                status: 'Outstanding'
            },
            {
                date: '2024-12-15',
                service: 'Property Rates',
                description: 'January 2025 Property Rates',
                amount: 1275.00,
                status: 'Outstanding'
            }
        ],

        payments: [],

        totalBilled: 4853.50,
        totalPaid: 0,
        closingBalance: 4853.50,

        status: 'Current'
    };

    res.json({
        success: true,
        data: statement
    });
});

/**
 * GET /api/statements/:id/download
 * Download statement as PDF
 */
router.get('/:id/download', authenticateToken, (req, res) => {
    const statementId = parseInt(req.params.id);

    // Mock PDF generation - replace with actual PDF generation
    res.json({
        success: true,
        message: 'Statement PDF generated',
        data: {
            statementId,
            downloadUrl: `/statements/statement_${statementId}.pdf`,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }
    });
});

/**
 * POST /api/statements/generate
 * Generate new statement for specific period
 */
router.post('/generate', [authenticateToken, requireStaff], (req, res) => {
    const { accountNumber, startDate, endDate } = req.body;

    if (!accountNumber || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Missing required fields: accountNumber, startDate, endDate'
            }
        });
    }

    // Mock statement generation - replace with actual generation logic
    const newStatement = {
        id: Date.now(),
        accountNumber,
        period: new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        startDate,
        endDate,
        totalBilled: 4853.50,
        totalPaid: 0,
        balance: 4853.50,
        status: 'Generated',
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.id
    };

    res.status(201).json({
        success: true,
        message: 'Statement generated successfully',
        data: newStatement
    });
});

/**
 * GET /api/statements/year/:year
 * Get all statements for a specific year
 */
router.get('/year/:year', authenticateToken, (req, res) => {
    const year = parseInt(req.params.year);
    const accountNumber = req.user.accountNumber;

    // Mock yearly statements - replace with database query
    const statements = [
        {
            id: 1,
            period: 'December 2024',
            totalBilled: 4853.50,
            totalPaid: 0,
            balance: 4853.50,
            status: 'Current'
        },
        {
            id: 2,
            period: 'November 2024',
            totalBilled: 4625.00,
            totalPaid: 4625.00,
            balance: 0,
            status: 'Paid'
        },
        {
            id: 3,
            period: 'October 2024',
            totalBilled: 4580.50,
            totalPaid: 4580.50,
            balance: 0,
            status: 'Paid'
        }
    ];

    const yearTotal = statements.reduce((sum, s) => sum + s.totalBilled, 0);
    const yearPaid = statements.reduce((sum, s) => sum + s.totalPaid, 0);

    res.json({
        success: true,
        data: {
            year,
            statements,
            summary: {
                totalBilled: yearTotal,
                totalPaid: yearPaid,
                balance: yearTotal - yearPaid
            }
        }
    });
});

/**
 * GET /api/statements/summary/annual
 * Get annual statement summary
 */
router.get('/summary/annual', authenticateToken, (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const accountNumber = req.user.accountNumber;

    // Mock annual summary - replace with database query
    const annualSummary = {
        year,
        accountNumber,
        totalBilled: 55000.00,
        totalPaid: 50146.50,
        currentBalance: 4853.50,

        byService: [
            {
                service: 'Water',
                totalBilled: 14940.00,
                totalPaid: 13695.00,
                balance: 1245.00
            },
            {
                service: 'Electricity',
                totalBilled: 21426.00,
                totalPaid: 19640.50,
                balance: 1785.50
            },
            {
                service: 'Property Rates',
                totalBilled: 15300.00,
                totalPaid: 14025.00,
                balance: 1275.00
            },
            {
                service: 'Refuse Collection',
                totalBilled: 6576.00,
                totalPaid: 6028.00,
                balance: 548.00
            }
        ],

        paymentMethods: [
            { method: 'Card Payment', count: 5, total: 25000.00 },
            { method: 'Mobile Money', count: 4, total: 15146.50 },
            { method: 'Bank Transfer', count: 3, total: 10000.00 }
        ]
    };

    res.json({
        success: true,
        data: annualSummary
    });
});

/**
 * POST /api/statements/email
 * Email statement to user
 */
router.post('/email', authenticateToken, (req, res) => {
    const { statementId, email } = req.body;

    if (!statementId) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Statement ID is required'
            }
        });
    }

    // Mock email sending - replace with actual email service
    const recipientEmail = email || req.user.email;

    console.log(`Sending statement ${statementId} to ${recipientEmail}`);

    res.json({
        success: true,
        message: `Statement has been sent to ${recipientEmail}`
    });
});

/**
 * GET /api/statements/:id/official
 * Get official statement data in municipal format
 */
router.get('/:id/official', authenticateToken, (req, res) => {
    const statementId = parseInt(req.params.id);
    const accountNumber = req.user.accountNumber;

    // Mock official statement data - replace with database query
    const currentDate = new Date();
    const accountDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const dueDate = new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const officialStatement = {
        accountNumber: accountNumber,
        consumerName: req.user.name.toUpperCase(),
        postalAddress: 'P.O. BOX 286\nOKAHANDJA',
        postalCode: '9000',
        deposit: 0.00,
        internetPin: '0920226340',
        accountDate: accountDate,
        taxInvoiceNo: accountNumber + currentDate.getFullYear() + String(currentDate.getMonth() + 1).padStart(2, '0'),
        vatRegNo: '',
        erfDescription: '0106 000004164 000000 0000',
        buildingValue: 0.00,
        street: 'EXT 6',
        landArea: 450.0000,
        landValue: 248000.00,

        meterReadings: [
            // Water meter
            {
                meterNo: 'WTR12345',
                meterType: 'Water',
                oldReading: '1215',
                newReading: '1247',
                consumption: '32',
                leviedAmount: '1245.00',
                readingDates: '01-30 DEC 2025'
            },
            // Electricity meter
            {
                meterNo: 'ELC67890',
                meterType: 'Electricity',
                oldReading: '5125',
                newReading: '5482',
                consumption: '357',
                leviedAmount: '1785.50',
                readingDates: '01-30 DEC 2025'
            }
        ],

        openingBalance: 126.52,

        accountDetails: [
            {
                date: '17/12/2025',
                code: '009009',
                description: 'INTEREST',
                units: 0,
                tariff: 0,
                value: 1.00
            },
            {
                date: '18/12/2025',
                code: '010101',
                description: 'WATER CONSUMPTION',
                units: 32.000,
                tariff: 38.906250,
                value: 1245.00
            },
            {
                date: '18/12/2025',
                code: '020101',
                description: 'ELECTRICITY CONSUMPTION',
                units: 357.000,
                tariff: 5.000000,
                value: 1785.50
            },
            {
                date: '18/12/2025',
                code: '050101',
                description: 'RESIDENTIAL LAND TAX',
                units: 248000.000,
                tariff: 0.009770,
                value: 201.91
            },
            {
                date: '18/12/2025',
                code: '050201',
                description: 'RESIDENTIAL BLD TAX',
                units: 0,
                tariff: 0.002670,
                value: 0.00
            },
            {
                date: '18/12/2025',
                code: '010145',
                description: 'FIRE BRIGADE LEVY',
                units: 1.000,
                tariff: 6.370000,
                value: 6.37
            },
            {
                date: '18/12/2025',
                code: '030101',
                description: 'REFUSE COLLECTION',
                units: 1.000,
                tariff: 548.000000,
                value: 548.00
            }
        ],

        aging: {
            days120Plus: 0.00,
            days90: 0.00,
            days60: 0.00,
            days30: 126.52,
            current: 3786.78
        },

        closingBalance: 3913.30,
        dueDate: dueDate,

        notice: 'DEAR VALUED CLIENTS KINDLY TAKE NOTE THAT THE DEBT COLLECTION FEES FROM JUNE UP TO DATE ARE UPLOADED ON YOUR NOV AND DEC BILLS. AND WE ARE STILL PROCESSING SEASON BLESSINGS',

        bankingDetails: {
            bankName: 'Bank Windhoek',
            accountName: 'Municipality Of Okahandja',
            accountNumber: '1070769806',
            branchCode: '482773',
            reference: accountNumber
        }
    };

    res.json({
        success: true,
        data: officialStatement
    });
});

/**
 * POST /api/statements/official/generate
 * Generate official statement PDF (server-side)
 */
router.post('/official/generate', authenticateToken, (req, res) => {
    const { accountNumber, period } = req.body;

    // In production, this would:
    // 1. Query database for account data
    // 2. Calculate all charges, taxes, levies
    // 3. Generate PDF using a server-side library (e.g., PDFKit, Puppeteer)
    // 4. Store PDF in cloud storage (e.g., S3)
    // 5. Return download URL

    res.json({
        success: true,
        message: 'Official statement generated',
        data: {
            downloadUrl: `/api/statements/official/download/${accountNumber}/${period}`,
            expiresAt: new Date(Date.now() + 3600000).toISOString()
        }
    });
});

module.exports = router;
