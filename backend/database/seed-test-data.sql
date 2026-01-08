-- ===================================
-- SEED TEST DATA FOR OKAHANDJA MUNICIPAL PORTAL
-- ===================================
-- This script populates the database with test data for development/testing

USE okahandja_municipal;

-- Clear existing data (careful in production!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_log;
TRUNCATE TABLE payments;
TRUNCATE TABLE bills;
TRUNCATE TABLE service_requests;
TRUNCATE TABLE notifications;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ===================================
-- SEED USERS
-- ===================================
-- Note: Passwords are hashed with bcrypt (10 rounds)
-- RES001: password123 (hashed)
-- RES002: password123 (hashed)
-- ADMIN001: admin123 (hashed)

INSERT INTO users (account_number, email, password_hash, name, first_name, phone, address, property_type, role, verified, failed_login_attempts, locked_until, last_login) VALUES
('RES001', 'john.doe@email.com', '$2a$10$m7CgyoiBPCx3HXQ23T6iQeqDUWLLSkT0MC511zZemQ6aRSE3TEAJa', 'John Doe', 'John', '+264811234567', '123 Main Street, Okahandja', 'Residential', 'customer', TRUE, 0, NULL, NOW()),
('RES002', 'jane.smith@email.com', '$2a$10$m7CgyoiBPCx3HXQ23T6iQeqDUWLLSkT0MC511zZemQ6aRSE3TEAJa', 'Jane Smith', 'Jane', '+264811234568', '456 Oak Avenue, Okahandja', 'Residential', 'customer', TRUE, 0, NULL, NULL),
('COM001', 'info@business.com', '$2a$10$m7CgyoiBPCx3HXQ23T6iQeqDUWLLSkT0MC511zZemQ6aRSE3TEAJa', 'ABC Business Ltd', 'ABC', '+264811234569', '789 Business Park, Okahandja', 'Commercial', 'customer', TRUE, 0, NULL, NULL),
('ADMIN001', 'admin@okahandja.gov.na', '$2a$10$9jJUZw859.T8xVwMerf9TuPHrBuUD23uQIwr3yw2dfPGO67UN0IWu', 'Admin User', 'Admin', '+264625030000', 'Municipality Office, Voortrekker Street', 'Government', 'admin', TRUE, 0, NULL, NOW()),
('STAFF001', 'staff@okahandja.gov.na', '$2a$10$9jJUZw859.T8xVwMerf9TuPHrBuUD23uQIwr3yw2dfPGO67UN0IWu', 'Staff Member', 'Staff', '+264625030001', 'Municipality Office, Voortrekker Street', 'Government', 'staff', TRUE, 0, NULL, NULL);

-- ===================================
-- SEED BILLS FOR RES001 (John Doe)
-- ===================================

-- December 2024 Bills (Current/Outstanding)
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, base_charge, vat_amount, total_amount) VALUES
('RES001', 'Water', 1245.00, '2025-01-15', 'Due Soon', 'December 2024', 12543.00, 12678.00, 135.00, 7.00, 150.00, 50.00, 1245.00),
('RES001', 'Electricity', 1785.50, '2025-01-15', 'Overdue', 'December 2024', 45231.00, 45567.00, 336.00, 5.00, 100.00, 125.50, 1785.50),
('RES001', 'Property Rates', 1275.00, '2025-01-20', 'Pending', 'January 2025', NULL, NULL, NULL, NULL, NULL, NULL, 1275.00),
('RES001', 'Refuse Collection', 548.00, '2025-01-15', 'Due Soon', 'December 2024', NULL, NULL, NULL, NULL, NULL, NULL, 548.00);

-- November 2024 Bills (Paid)
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, base_charge, vat_amount, total_amount, paid_date) VALUES
('RES001', 'Water', 1180.00, '2024-12-15', 'Paid', 'November 2024', 12408.00, 12543.00, 135.00, 7.00, 150.00, 45.00, 1180.00, '2024-12-10'),
('RES001', 'Electricity', 1650.00, '2024-12-15', 'Paid', 'November 2024', 44895.00, 45231.00, 336.00, 5.00, 100.00, 100.00, 1650.00, '2024-12-08'),
('RES001', 'Property Rates', 1275.00, '2024-12-20', 'Paid', 'December 2024', NULL, NULL, NULL, NULL, NULL, NULL, 1275.00, '2024-12-12'),
('RES001', 'Refuse Collection', 548.00, '2024-12-15', 'Paid', 'November 2024', NULL, NULL, NULL, NULL, NULL, NULL, 548.00, '2024-12-10');

-- October 2024 Bills (Paid)
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, base_charge, vat_amount, total_amount, paid_date) VALUES
('RES001', 'Water', 1220.00, '2024-11-15', 'Paid', 'October 2024', 12273.00, 12408.00, 135.00, 7.00, 150.00, 48.00, 1220.00, '2024-11-12'),
('RES001', 'Electricity', 1580.00, '2024-11-15', 'Paid', 'October 2024', 44559.00, 44895.00, 336.00, 5.00, 100.00, 95.00, 1580.00, '2024-11-10');

-- ===================================
-- SEED BILLS FOR RES002 (Jane Smith)
-- ===================================

INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, base_charge, vat_amount, total_amount) VALUES
('RES002', 'Water', 985.00, '2025-01-15', 'Pending', 'December 2024', 8543.00, 8628.00, 85.00, 7.00, 150.00, 40.00, 985.00),
('RES002', 'Electricity', 1450.00, '2025-01-15', 'Pending', 'December 2024', 32145.00, 32425.00, 280.00, 5.00, 100.00, 85.00, 1450.00),
('RES002', 'Refuse Collection', 548.00, '2025-01-15', 'Pending', 'December 2024', NULL, NULL, NULL, NULL, NULL, NULL, 548.00);

-- ===================================
-- SEED BILLS FOR COM001 (Commercial)
-- ===================================

INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, base_charge, vat_amount, total_amount) VALUES
('COM001', 'Water', 3450.00, '2025-01-15', 'Overdue', 'December 2024', 45230.00, 45680.00, 450.00, 7.00, 200.00, 200.00, 3450.00),
('COM001', 'Electricity', 5680.00, '2025-01-15', 'Overdue', 'December 2024', 125400.00, 126500.00, 1100.00, 5.00, 150.00, 380.00, 5680.00),
('COM001', 'Property Rates', 4250.00, '2025-01-20', 'Pending', 'January 2025', NULL, NULL, NULL, NULL, NULL, NULL, 4250.00),
('COM001', 'Refuse Collection', 1200.00, '2025-01-15', 'Overdue', 'December 2024', NULL, NULL, NULL, NULL, NULL, NULL, 1200.00);

-- ===================================
-- SEED PAYMENTS
-- ===================================

-- RES001 Payments (November bills paid)
INSERT INTO payments (account_number, bill_id, service, amount, payment_method, payment_reference, status, payment_details, transaction_id) VALUES
('RES001', 5, 'Water', 1180.00, 'card', 'PAY-2024-1210-001', 'success', '{"cardLastFour":"1234","cardType":"Visa"}', 'TXN-1702195200000'),
('RES001', 6, 'Electricity', 1650.00, 'mobilemoney', 'PAY-2024-1208-002', 'success', '{"provider":"MTC","phoneNumber":"+264811234567"}', 'TXN-1701993600000'),
('RES001', 7, 'Property Rates', 1275.00, 'banktransfer', 'PAY-2024-1212-003', 'success', '{"bank":"FNB Namibia","accountNumber":"****5678"}', 'TXN-1702339200000'),
('RES001', 8, 'Refuse Collection', 548.00, 'card', 'PAY-2024-1210-004', 'success', '{"cardLastFour":"1234","cardType":"Visa"}', 'TXN-1702195200001');

-- RES001 Payments (October bills paid)
INSERT INTO payments (account_number, bill_id, service, amount, payment_method, payment_reference, status, payment_details, transaction_id, created_at) VALUES
('RES001', 9, 'Water', 1220.00, 'card', 'PAY-2024-1112-005', 'success', '{"cardLastFour":"1234","cardType":"Visa"}', 'TXN-1699776000000', '2024-11-12 10:30:00'),
('RES001', 10, 'Electricity', 1580.00, 'mobilemoney', 'PAY-2024-1110-006', 'success', '{"provider":"MTC","phoneNumber":"+264811234567"}', 'TXN-1699603200000', '2024-11-10 14:20:00');

-- ===================================
-- SEED SERVICE REQUESTS
-- ===================================

INSERT INTO service_requests (request_id, account_number, type, category, priority, description, location, status) VALUES
('SR-2025-001', 'RES001', 'Water Leak Report', 'Water', 'High', 'Leaking pipe near meter box, water pooling on property', '123 Main Street, Okahandja', 'In Progress'),
('SR-2025-002', 'RES001', 'Meter Reading Issue', 'Electricity', 'Medium', 'Electricity meter reading seems incorrect compared to usage', '123 Main Street, Okahandja', 'Open'),
('SR-2025-003', 'RES002', 'Billing Query', 'Billing', 'Low', 'Question about Property Rates calculation for this period', '456 Oak Avenue, Okahandja', 'Open'),
('SR-2025-004', 'COM001', 'Refuse Collection Issue', 'Refuse', 'High', 'Refuse not collected for 2 weeks, bins overflowing', '789 Business Park, Okahandja', 'Open');

-- ===================================
-- SEED NOTIFICATIONS
-- ===================================

INSERT INTO notifications (account_number, type, title, message, read_status) VALUES
('RES001', 'overdue', 'Electricity Bill Overdue', 'Your electricity bill of N$ 1,785.50 is overdue. Please pay to avoid service interruption.', FALSE),
('RES001', 'high_usage', 'High Water Usage Alert', 'Your water consumption is 25% higher than last month. Check for leaks.', FALSE),
('RES001', 'payment', 'Payment Received', 'Thank you for your water bill payment of N$ 1,180.00', TRUE),
('RES002', 'reminder', 'Bills Due Soon', 'You have 3 bills totaling N$ 2,983.00 due on 2025-01-15', FALSE),
('COM001', 'service_request', 'Service Request Update', 'Your refuse collection request #SR-2025-004 is being processed', FALSE);

-- ===================================
-- SEED ACTIVITY LOG
-- ===================================

INSERT INTO activity_log (account_number, action, details, ip_address) VALUES
('RES001', 'login', 'User logged in successfully', '192.168.1.100'),
('ADMIN001', 'bill_update', 'Marked bill #5 as paid for account RES001', '192.168.1.1'),
('RES001', 'payment', 'Payment of N$ 1,180.00 for Water bill', '192.168.1.100'),
('RES002', 'login', 'User logged in successfully', '192.168.1.101'),
('STAFF001', 'service_request_update', 'Updated service request SR-2025-001 status to In Progress', '192.168.1.2'),
('ADMIN001', 'user_update', 'Updated user RES002 phone number', '192.168.1.1'),
('COM001', 'service_request_create', 'Created new service request SR-2025-004', '192.168.1.102');

-- ===================================
-- VERIFICATION
-- ===================================

SELECT 'Database seeded successfully!' AS message;
SELECT 'Users created:', COUNT(*) FROM users;
SELECT 'Bills created:', COUNT(*) FROM bills;
SELECT 'Payments created:', COUNT(*) FROM payments;
SELECT 'Service requests created:', COUNT(*) FROM service_requests;
SELECT 'Notifications created:', COUNT(*) FROM notifications;
SELECT 'Activity logs created:', COUNT(*) FROM activity_log;

-- Display test credentials
SELECT '
========================================
TEST CREDENTIALS
========================================
Resident Account:
  Account Number: RES001
  Password: password123
  Email: john.doe@email.com

Admin Account:
  Account Number: ADMIN001
  Password: admin123
  Email: admin@okahandja.gov.na

Staff Account:
  Account Number: STAFF001
  Password: admin123
  Email: staff@okahandja.gov.na
========================================
' AS 'Test Credentials';
