/* ===================================
   USER DATA & STATEMENT DATA
   =================================== */

// User accounts database
const users = {
    '12345678': {
        password: 'password123',
        name: 'John Doe',
        firstName: 'John',
        address: '123 Main Street, Okahandja',
        propertyType: 'Residential',
        role: 'resident'
    },
    '87654321': {
        password: 'password123',
        name: 'Jane Smith',
        firstName: 'Jane',
        address: '456 Oak Avenue, Okahandja',
        propertyType: 'Residential',
        role: 'resident'
    },
    '11223344': {
        password: 'password123',
        name: 'David Johnson',
        firstName: 'David',
        address: '789 Pine Road, Okahandja',
        propertyType: 'Commercial',
        role: 'resident'
    }
    // Add more users as needed
};

// Admin accounts database
const admins = {
    'admin': {
        password: 'admin123',
        name: 'Administrator',
        firstName: 'Admin',
        role: 'admin'
    },
    'ADMIN001': {
        password: 'admin123',
        name: 'Administrator',
        firstName: 'Admin',
        role: 'admin'
    }
};

// Statement data for all services
const statementData = {
    'Water': {
        icon: '💧',
        periods: {
            'current': {
                period: 'December 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Dec 2025',
                dueDate: '20 Dec 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Water Consumption (32 m³ @ N$38.91/m³)', amount: 1245.00 },
                    { description: 'Basic Charge', amount: 0 },
                ],
                payments: [],
                total: 1245.00,
                readings: {
                    previous: '1,215 m³',
                    current: '1,247 m³',
                    usage: '32 m³'
                }
            },
            'nov2025': {
                period: 'November 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Nov 2025',
                dueDate: '20 Nov 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Water Consumption (30 m³ @ N$39.33/m³)', amount: 1180.00 },
                    { description: 'Basic Charge', amount: 0 },
                ],
                payments: [
                    { date: '28 Nov 2025', description: 'Payment - Thank you', amount: -1180.00 }
                ],
                total: 0,
                readings: {
                    previous: '1,185 m³',
                    current: '1,215 m³',
                    usage: '30 m³'
                }
            },
            'oct2025': {
                period: 'October 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Oct 2025',
                dueDate: '20 Oct 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Water Consumption (28 m³ @ N$40.18/m³)', amount: 1125.00 },
                    { description: 'Basic Charge', amount: 0 },
                ],
                payments: [
                    { date: '28 Oct 2025', description: 'Payment - Thank you', amount: -1125.00 }
                ],
                total: 0,
                readings: {
                    previous: '1,157 m³',
                    current: '1,185 m³',
                    usage: '28 m³'
                }
            },
            'sep2025': {
                period: 'September 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Sep 2025',
                dueDate: '20 Sep 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Water Consumption (35 m³ @ N$38.57/m³)', amount: 1350.00 },
                    { description: 'Basic Charge', amount: 0 },
                ],
                payments: [
                    { date: '25 Sep 2025', description: 'Payment - Thank you', amount: -1350.00 }
                ],
                total: 0,
                readings: {
                    previous: '1,122 m³',
                    current: '1,157 m³',
                    usage: '35 m³'
                }
            }
        }
    },
    'Electricity': {
        icon: '⚡',
        periods: {
            'current': {
                period: 'December 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Dec 2025',
                dueDate: '10 Dec 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Electricity Consumption (357 kWh @ N$5.00/kWh)', amount: 1785.50 },
                    { description: 'Network Charge', amount: 0 },
                ],
                payments: [],
                total: 1785.50,
                readings: {
                    previous: '5,125 kWh',
                    current: '5,482 kWh',
                    usage: '357 kWh'
                }
            },
            'nov2025': {
                period: 'November 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Nov 2025',
                dueDate: '10 Nov 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Electricity Consumption (330 kWh @ N$5.00/kWh)', amount: 1650.00 },
                    { description: 'Network Charge', amount: 0 },
                ],
                payments: [
                    { date: '10 Nov 2025', description: 'Payment - Thank you', amount: -1650.00 }
                ],
                total: 0,
                readings: {
                    previous: '4,795 kWh',
                    current: '5,125 kWh',
                    usage: '330 kWh'
                }
            },
            'oct2025': {
                period: 'October 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Oct 2025',
                dueDate: '10 Oct 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Electricity Consumption (315 kWh @ N$4.95/kWh)', amount: 1560.00 },
                    { description: 'Network Charge', amount: 0 },
                ],
                payments: [
                    { date: '08 Oct 2025', description: 'Payment - Thank you', amount: -1560.00 }
                ],
                total: 0,
                readings: {
                    previous: '4,480 kWh',
                    current: '4,795 kWh',
                    usage: '315 kWh'
                }
            },
            'sep2025': {
                period: 'September 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Sep 2025',
                dueDate: '10 Sep 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Electricity Consumption (340 kWh @ N$4.90/kWh)', amount: 1666.00 },
                    { description: 'Network Charge', amount: 0 },
                ],
                payments: [
                    { date: '12 Sep 2025', description: 'Payment - Thank you', amount: -1666.00 }
                ],
                total: 0,
                readings: {
                    previous: '4,140 kWh',
                    current: '4,480 kWh',
                    usage: '340 kWh'
                }
            }
        }
    },
    'Property Rates': {
        icon: '🏠',
        periods: {
            'current': {
                period: 'December 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Dec 2025',
                dueDate: '31 Dec 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Property Rates (N$850,000 @ 0.15%)', amount: 1275.00 },
                ],
                payments: [],
                total: 1275.00,
                readings: null
            },
            'nov2025': {
                period: 'November 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Nov 2025',
                dueDate: '30 Nov 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Property Rates (N$850,000 @ 0.15%)', amount: 1275.00 },
                ],
                payments: [
                    { date: '25 Nov 2025', description: 'Payment - Thank you', amount: -1275.00 }
                ],
                total: 0,
                readings: null
            },
            'oct2025': {
                period: 'October 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Oct 2025',
                dueDate: '31 Oct 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Property Rates (N$850,000 @ 0.15%)', amount: 1275.00 },
                ],
                payments: [
                    { date: '30 Oct 2025', description: 'Payment - Thank you', amount: -1275.00 }
                ],
                total: 0,
                readings: null
            },
            'sep2025': {
                period: 'September 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Sep 2025',
                dueDate: '30 Sep 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Property Rates (N$850,000 @ 0.15%)', amount: 1275.00 },
                ],
                payments: [
                    { date: '28 Sep 2025', description: 'Payment - Thank you', amount: -1275.00 }
                ],
                total: 0,
                readings: null
            }
        }
    },
    'Refuse': {
        icon: '🗑️',
        periods: {
            'current': {
                period: 'December 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Dec 2025',
                dueDate: '25 Dec 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Refuse Collection - Residential', amount: 548.00 },
                ],
                payments: [],
                total: 548.00,
                readings: null
            },
            'nov2025': {
                period: 'November 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Nov 2025',
                dueDate: '25 Nov 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Refuse Collection - Residential', amount: 548.00 },
                ],
                payments: [
                    { date: '25 Nov 2025', description: 'Payment - Thank you', amount: -548.00 }
                ],
                total: 0,
                readings: null
            },
            'oct2025': {
                period: 'October 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Oct 2025',
                dueDate: '25 Oct 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Refuse Collection - Residential', amount: 548.00 },
                ],
                payments: [
                    { date: '22 Oct 2025', description: 'Payment - Thank you', amount: -548.00 }
                ],
                total: 0,
                readings: null
            },
            'sep2025': {
                period: 'September 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Sep 2025',
                dueDate: '25 Sep 2025',
                items: [
                    { description: 'Previous Balance', amount: 0 },
                    { description: 'Refuse Collection - Residential', amount: 548.00 },
                ],
                payments: [
                    { date: '20 Sep 2025', description: 'Payment - Thank you', amount: -548.00 }
                ],
                total: 0,
                readings: null
            }
        }
    },
    'Consolidated': {
        icon: '📄',
        periods: {
            'current': {
                period: 'December 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Dec 2025',
                dueDate: '31 Dec 2025',
                items: [
                    { description: 'Water - Previous Balance', amount: 0 },
                    { description: 'Water - Current Charges', amount: 1245.00 },
                    { description: 'Electricity - Previous Balance', amount: 0 },
                    { description: 'Electricity - Current Charges', amount: 1785.50 },
                    { description: 'Property Rates - Current Charges', amount: 1275.00 },
                    { description: 'Refuse Collection - Current Charges', amount: 548.00 },
                ],
                payments: [],
                total: 4853.50,
                readings: null
            },
            'nov2025': {
                period: 'November 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Nov 2025',
                dueDate: '30 Nov 2025',
                items: [
                    { description: 'Water - Previous Balance', amount: 0 },
                    { description: 'Water - Current Charges', amount: 1180.00 },
                    { description: 'Electricity - Previous Balance', amount: 0 },
                    { description: 'Electricity - Current Charges', amount: 1650.00 },
                    { description: 'Property Rates - Current Charges', amount: 1275.00 },
                    { description: 'Refuse Collection - Current Charges', amount: 548.00 },
                ],
                payments: [
                    { date: '28 Nov 2025', description: 'Payment - Water', amount: -1180.00 },
                    { date: '25 Nov 2025', description: 'Payment - Property Rates', amount: -1275.00 },
                    { date: '25 Nov 2025', description: 'Payment - Refuse', amount: -548.00 },
                    { date: '10 Nov 2025', description: 'Payment - Electricity', amount: -1650.00 }
                ],
                total: 0,
                readings: null
            },
            'oct2025': {
                period: 'October 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Oct 2025',
                dueDate: '31 Oct 2025',
                items: [
                    { description: 'Water - Current Charges', amount: 1125.00 },
                    { description: 'Electricity - Current Charges', amount: 1560.00 },
                    { description: 'Property Rates - Current Charges', amount: 1275.00 },
                    { description: 'Refuse Collection - Current Charges', amount: 548.00 },
                ],
                payments: [
                    { date: '30 Oct 2025', description: 'Payment - All Services', amount: -4508.00 }
                ],
                total: 0,
                readings: null
            },
            'sep2025': {
                period: 'September 2025',
                accountNumber: '12345678',
                propertyAddress: '123 Main Street, Okahandja',
                statementDate: '01 Sep 2025',
                dueDate: '30 Sep 2025',
                items: [
                    { description: 'Water - Current Charges', amount: 1350.00 },
                    { description: 'Electricity - Current Charges', amount: 1666.00 },
                    { description: 'Property Rates - Current Charges', amount: 1275.00 },
                    { description: 'Refuse Collection - Current Charges', amount: 548.00 },
                ],
                payments: [
                    { date: '28 Sep 2025', description: 'Payment - All Services', amount: -4839.00 }
                ],
                total: 0,
                readings: null
            }
        }
    }
};
