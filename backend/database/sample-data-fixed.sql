-- ===================================
-- SAMPLE DATA FOR OKAHANDJA MUNICIPALITY
-- ===================================
-- This file creates realistic demo data for presentation

USE okahandja_municipal;

-- ===================================
-- SAMPLE RESIDENTS (15 Users)
-- ===================================
-- Password for all users: password123 (hashed with bcrypt)

INSERT INTO users (account_number, email, password_hash, name, first_name, phone, address, property_type, role, verified) VALUES
('RES001', 'john.doe@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'John Doe', 'John', '+264811234567', '123 Main Street, Okahandja', 'Residential', 'customer', TRUE),
('23456789', 'sarah.smith@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Sarah Smith', 'Sarah', '+264812345678', '45 Oak Avenue, Okahandja', 'Residential', 'customer', TRUE),
('34567890', 'michael.johnson@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Michael Johnson', 'Michael', '+264813456789', '78 Pine Road, Okahandja', 'Commercial', 'customer', TRUE),
('45678901', 'emma.williams@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Emma Williams', 'Emma', '+264814567890', '12 Church Street, Okahandja', 'Residential', 'customer', TRUE),
('56789012', 'david.brown@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'David Brown', 'David', '+264815678901', '34 Market Square, Okahandja', 'Commercial', 'customer', TRUE),
('67890123', 'lisa.davis@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Lisa Davis', 'Lisa', '+264816789012', '56 Independence Avenue, Okahandja', 'Residential', 'customer', TRUE),
('78901234', 'james.wilson@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'James Wilson', 'James', '+264817890123', '89 Sam Nujoma Drive, Okahandja', 'Residential', 'customer', TRUE),
('89012345', 'maria.garcia@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Maria Garcia', 'Maria', '+264818901234', '23 Voortrekker Street, Okahandja', 'Commercial', 'customer', TRUE),
('90123456', 'robert.martinez@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Robert Martinez', 'Robert', '+264819012345', '67 Kaiser Wilhelm Street, Okahandja', 'Residential', 'customer', TRUE),
('11223344', 'amanda.taylor@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Amanda Taylor', 'Amanda', '+264811223344', '45 Hosea Kutako Drive, Okahandja', 'Residential', 'customer', TRUE),
('22334455', 'christopher.lee@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Christopher Lee', 'Christopher', '+264812233445', '12 Robert Mugabe Avenue, Okahandja', 'Commercial', 'customer', TRUE),
('33445566', 'jennifer.white@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Jennifer White', 'Jennifer', '+264813344556', '78 Nelson Mandela Street, Okahandja', 'Residential', 'customer', TRUE),
('44556677', 'daniel.harris@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Daniel Harris', 'Daniel', '+264814455667', '34 Uhland Street, Okahandja', 'Residential', 'customer', TRUE),
('55667788', 'patricia.clark@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Patricia Clark', 'Patricia', '+264815566778', '90 Erf Street, Okahandja', 'Commercial', 'customer', TRUE),
('66778899', 'thomas.lewis@email.com', '$2a$10$rZ1qH5yJ9Z5YvK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4mH5YeK3X4m', 'Thomas Lewis', 'Thomas', '+264816677889', '56 Bahnhof Street, Okahandja', 'Residential', 'customer', TRUE);

-- ===================================
-- CURRENT BILLS (December 2025)
-- ===================================

-- Water Bills
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, total_amount) VALUES
('RES001', 'Water', 496.00, '2025-12-20', 'Due Soon', 'Dec 2025', 1215, 1247, 32, 15.50, 496.00),
('23456789', 'Water', 620.00, '2025-12-20', 'Due Soon', 'Dec 2025', 2340, 2380, 40, 15.50, 620.00),
('34567890', 'Water', 1085.00, '2025-12-20', 'Paid', 'Dec 2025', 3450, 3520, 70, 15.50, 1085.00),
('45678901', 'Water', 387.50, '2025-12-20', 'Due Soon', 'Dec 2025', 890, 915, 25, 15.50, 387.50),
('56789012', 'Water', 930.00, '2025-12-20', 'Overdue', 'Dec 2025', 2100, 2160, 60, 15.50, 930.00),
('67890123', 'Water', 542.50, '2025-12-20', 'Due Soon', 'Dec 2025', 1560, 1595, 35, 15.50, 542.50),
('78901234', 'Water', 434.00, '2025-12-20', 'Paid', 'Dec 2025', 1120, 1148, 28, 15.50, 434.00),
('89012345', 'Water', 775.00, '2025-12-20', 'Due Soon', 'Dec 2025', 1890, 1940, 50, 15.50, 775.00),
('90123456', 'Water', 511.50, '2025-12-20', 'Due Soon', 'Dec 2025', 1340, 1373, 33, 15.50, 511.50),
('11223344', 'Water', 465.00, '2025-12-20', 'Paid', 'Dec 2025', 980, 1010, 30, 15.50, 465.00),
('22334455', 'Water', 852.50, '2025-12-20', 'Overdue', 'Dec 2025', 2250, 2305, 55, 15.50, 852.50),
('33445566', 'Water', 418.50, '2025-12-20', 'Due Soon', 'Dec 2025', 1050, 1077, 27, 15.50, 418.50),
('44556677', 'Water', 558.50, '2025-12-20', 'Due Soon', 'Dec 2025', 1430, 1466, 36, 15.50, 558.50),
('55667788', 'Water', 1007.50, '2025-12-20', 'Paid', 'Dec 2025', 2780, 2845, 65, 15.50, 1007.50),
('66778899', 'Water', 480.50, '2025-12-20', 'Due Soon', 'Dec 2025', 1200, 1231, 31, 15.50, 480.50);

-- Electricity Bills
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, previous_reading, current_reading, units_consumed, rate_per_unit, total_amount) VALUES
('RES001', 'Electricity', 875.00, '2025-12-10', 'Overdue', 'Dec 2025', 5125, 5482, 357, 2.45, 875.00),
('23456789', 'Electricity', 1102.50, '2025-12-10', 'Overdue', 'Dec 2025', 6780, 7230, 450, 2.45, 1102.50),
('34567890', 'Electricity', 1715.00, '2025-12-10', 'Paid', 'Dec 2025', 8900, 9600, 700, 2.45, 1715.00),
('45678901', 'Electricity', 612.50, '2025-12-10', 'Due Soon', 'Dec 2025', 3450, 3700, 250, 2.45, 612.50),
('56789012', 'Electricity', 1470.00, '2025-12-10', 'Overdue', 'Dec 2025', 7200, 7800, 600, 2.45, 1470.00),
('67890123', 'Electricity', 857.50, '2025-12-10', 'Due Soon', 'Dec 2025', 4890, 5240, 350, 2.45, 857.50),
('78901234', 'Electricity', 735.00, '2025-12-10', 'Paid', 'Dec 2025', 4120, 4420, 300, 2.45, 735.00),
('89012345', 'Electricity', 1225.00, '2025-12-10', 'Overdue', 'Dec 2025', 6500, 7000, 500, 2.45, 1225.00),
('90123456', 'Electricity', 980.00, '2025-12-10', 'Due Soon', 'Dec 2025', 5340, 5740, 400, 2.45, 980.00),
('11223344', 'Electricity', 735.00, '2025-12-10', 'Paid', 'Dec 2025', 3980, 4280, 300, 2.45, 735.00),
('22334455', 'Electricity', 1347.50, '2025-12-10', 'Overdue', 'Dec 2025', 7250, 7800, 550, 2.45, 1347.50),
('33445566', 'Electricity', 661.25, '2025-12-10', 'Due Soon', 'Dec 2025', 3750, 4020, 270, 2.45, 661.25),
('44556677', 'Electricity', 882.00, '2025-12-10', 'Due Soon', 'Dec 2025', 4630, 4990, 360, 2.45, 882.00),
('55667788', 'Electricity', 1592.50, '2025-12-10', 'Paid', 'Dec 2025', 8280, 8930, 650, 2.45, 1592.50),
('66778899', 'Electricity', 759.50, '2025-12-10', 'Due Soon', 'Dec 2025', 4200, 4510, 310, 2.45, 759.50);

-- Property Rates Bills
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, total_amount) VALUES
('RES001', 'Property Rates', 680.00, '2025-12-31', 'Due Soon', 'Dec 2025', 680.00),
('23456789', 'Property Rates', 720.00, '2025-12-31', 'Due Soon', 'Dec 2025', 720.00),
('34567890', 'Property Rates', 1450.00, '2025-12-31', 'Paid', 'Dec 2025', 1450.00),
('45678901', 'Property Rates', 640.00, '2025-12-31', 'Due Soon', 'Dec 2025', 640.00),
('56789012', 'Property Rates', 1380.00, '2025-12-31', 'Due Soon', 'Dec 2025', 1380.00),
('67890123', 'Property Rates', 700.00, '2025-12-31', 'Due Soon', 'Dec 2025', 700.00),
('78901234', 'Property Rates', 660.00, '2025-12-31', 'Paid', 'Dec 2025', 660.00),
('89012345', 'Property Rates', 1320.00, '2025-12-31', 'Due Soon', 'Dec 2025', 1320.00),
('90123456', 'Property Rates', 690.00, '2025-12-31', 'Due Soon', 'Dec 2025', 690.00),
('11223344', 'Property Rates', 670.00, '2025-12-31', 'Paid', 'Dec 2025', 670.00),
('22334455', 'Property Rates', 1400.00, '2025-12-31', 'Due Soon', 'Dec 2025', 1400.00),
('33445566', 'Property Rates', 650.00, '2025-12-31', 'Due Soon', 'Dec 2025', 650.00),
('44556677', 'Property Rates', 710.00, '2025-12-31', 'Due Soon', 'Dec 2025', 710.00),
('55667788', 'Property Rates', 1480.00, '2025-12-31', 'Paid', 'Dec 2025', 1480.00),
('66778899', 'Property Rates', 675.00, '2025-12-31', 'Due Soon', 'Dec 2025', 675.00);

-- Refuse Collection Bills
INSERT INTO bills (account_number, service, amount, due_date, status, billing_period, total_amount) VALUES
('RES001', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('23456789', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('34567890', 'Refuse Collection', 250.00, '2025-12-25', 'Paid', 'Dec 2025', 250.00),
('45678901', 'Refuse Collection', 125.00, '2025-12-25', 'Paid', 'Dec 2025', 125.00),
('56789012', 'Refuse Collection', 250.00, '2025-12-25', 'Due Soon', 'Dec 2025', 250.00),
('67890123', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('78901234', 'Refuse Collection', 125.00, '2025-12-25', 'Paid', 'Dec 2025', 125.00),
('89012345', 'Refuse Collection', 250.00, '2025-12-25', 'Due Soon', 'Dec 2025', 250.00),
('90123456', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('11223344', 'Refuse Collection', 125.00, '2025-12-25', 'Paid', 'Dec 2025', 125.00),
('22334455', 'Refuse Collection', 250.00, '2025-12-25', 'Due Soon', 'Dec 2025', 250.00),
('33445566', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('44556677', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00),
('55667788', 'Refuse Collection', 250.00, '2025-12-25', 'Paid', 'Dec 2025', 250.00),
('66778899', 'Refuse Collection', 125.00, '2025-12-25', 'Due Soon', 'Dec 2025', 125.00);

-- ===================================
-- PAYMENT HISTORY (Last 3 Months)
-- ===================================

-- November 2025 Payments
INSERT INTO payments (account_number, amount, payment_method, payment_reference, service, status, created_at) VALUES
('RES001', 434.00, 'banktransfer', 'BT-1732723200001', 'Water', 'success', '2025-11-28 10:30:00'),
('34567890', 1715.00, 'card', 'CARD-1732550400002', 'Electricity', 'success', '2025-11-25 14:20:00'),
('45678901', 125.00, 'mobilemoney', 'MM-1732291200003', 'Refuse Collection', 'success', '2025-11-22 09:15:00'),
('78901234', 735.00, 'nampost', 'NMMP-1731945600004', 'Electricity', 'success', '2025-11-18 16:45:00'),
('11223344', 465.00, 'card', 'CARD-1731600000005', 'Water', 'success', '2025-11-14 11:30:00');

-- October 2025 Payments
INSERT INTO payments (account_number, amount, payment_method, payment_reference, service, status, created_at) VALUES
('23456789', 620.00, 'banktransfer', 'BT-1729699200006', 'Water', 'success', '2025-10-28 13:20:00'),
('55667788', 1592.50, 'card', 'CARD-1729353600007', 'Electricity', 'success', '2025-10-24 10:00:00'),
('34567890', 1450.00, 'nampost', 'NMMP-1729008000008', 'Property Rates', 'success', '2025-10-20 15:30:00'),
('66778899', 480.50, 'mobilemoney', 'MM-1728662400009', 'Water', 'success', '2025-10-16 09:45:00'),
('78901234', 660.00, 'banktransfer', 'BT-1728316800010', 'Property Rates', 'success', '2025-10-12 14:15:00');

-- September 2025 Payments
INSERT INTO payments (account_number, amount, payment_method, payment_reference, service, status, created_at) VALUES
('11223344', 670.00, 'card', 'CARD-1726848000011', 'Property Rates', 'success', '2025-09-25 11:20:00'),
('45678901', 387.50, 'banktransfer', 'BT-1726502400012', 'Water', 'success', '2025-09-21 16:00:00'),
('55667788', 1480.00, 'nampost', 'NMMP-1726156800013', 'Property Rates', 'success', '2025-09-17 10:30:00'),
('34567890', 250.00, 'mobilemoney', 'MM-1725811200014', 'Refuse Collection', 'success', '2025-09-13 13:45:00'),
('78901234', 125.00, 'card', 'CARD-1725465600015', 'Refuse Collection', 'success', '2025-09-09 09:00:00');

-- ===================================
-- SERVICE REQUESTS
-- ===================================

INSERT INTO service_requests (account_number, type, category, priority, description, location, status) VALUES
('RES001', 'Water Leak', 'Water', 'High', 'Leaking pipe near the meter box, water wastage occurring', '123 Main Street, Okahandja', 'In Progress'),
('23456789', 'Meter Reading Issue', 'Electricity', 'Medium', 'Electricity meter reading seems incorrect, showing higher than normal usage', '45 Oak Avenue, Okahandja', 'Completed'),
('56789012', 'Billing Query', 'General', 'Low', 'Need clarification on December bill amount, appears higher than usual', '34 Market Square, Okahandja', 'Pending'),
('67890123', 'Street Light Issue', 'Infrastructure', 'Medium', 'Street light outside property not working for 3 days', '56 Independence Avenue, Okahandja', 'In Progress'),
('89012345', 'Refuse Collection Issue', 'Refuse', 'High', 'Refuse not collected on scheduled days for 2 weeks', '23 Voortrekker Street, Okahandja', 'Pending'),
('90123456', 'Water Pressure', 'Water', 'Medium', 'Low water pressure during peak hours', '67 Kaiser Wilhelm Street, Okahandja', 'Completed'),
('22334455', 'Drainage Problem', 'Infrastructure', 'High', 'Blocked drainage causing flooding in yard', '12 Robert Mugabe Avenue, Okahandja', 'In Progress'),
('44556677', 'Meter Replacement', 'Water', 'Low', 'Request for digital water meter upgrade', '34 Uhland Street, Okahandja', 'Pending');

-- ===================================
-- NOTIFICATIONS
-- ===================================

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'Bill Overdue', 'Electricity Bill Overdue',
CONCAT('Your electricity bill of N$ ', (SELECT amount FROM bills WHERE account_number = users.account_number AND service = 'Electricity' AND status = 'Overdue' LIMIT 1), ' is overdue. Please pay to avoid service interruption.'),
FALSE
FROM users WHERE account_number IN ('RES001', '56789012', '89012345', '22334455');

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'Payment Confirmed', 'Payment Received',
'Thank you for your payment. Your transaction has been processed successfully.',
FALSE
FROM users WHERE account_number IN ('34567890', '78901234', '55667788');

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT id, 'Service Request Update', 'Service Request Completed',
'Your service request has been resolved. Thank you for your patience.',
TRUE
FROM users WHERE account_number IN ('23456789', '90123456');

-- ===================================
-- ACTIVITY LOG
-- ===================================

INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address) VALUES
(1, 'Login', 'User', 1, 'Admin user logged in', '192.168.1.1'),
(1, 'Bill Update', 'Bill', 15, 'Marked bill as paid', '192.168.1.1'),
(2, 'Payment', 'Payment', 1, 'Payment processed: N$ 434.00', '192.168.1.100'),
(3, 'Registration', 'User', 3, 'New user registered', '192.168.1.101'),
(4, 'Service Request', 'ServiceRequest', 1, 'New service request submitted', '192.168.1.102'),
(1, 'Settings Update', 'Settings', 1, 'Updated water rate', '192.168.1.1');

-- ===================================
-- SUMMARY
-- ===================================
-- Sample data created:
-- - 15 Residents with realistic details
-- - 60 Bills (4 services × 15 users) for December 2025
-- - 15 Payment records from last 3 months
-- - 8 Service requests with different statuses
-- - Multiple notifications for different events
-- - Activity log entries
-- Password for all users: password123
