-- ===================================
-- OKAHANDJA MUNICIPALITY DATABASE SCHEMA
-- ===================================

-- Create database
CREATE DATABASE IF NOT EXISTS okahandja_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE okahandja_municipal;

-- ===================================
-- USERS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    property_type ENUM('Residential', 'Commercial', 'Industrial', 'Government') DEFAULT 'Residential',
    role ENUM('customer', 'staff', 'admin') DEFAULT 'customer',
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_account_number (account_number),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- BILLS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    service ENUM('Water', 'Electricity', 'Property Rates', 'Refuse Collection') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Paid', 'Overdue', 'Due Soon', 'Pending') DEFAULT 'Pending',
    billing_period VARCHAR(20) NOT NULL,
    previous_reading DECIMAL(10, 2),
    current_reading DECIMAL(10, 2),
    units_consumed DECIMAL(10, 2),
    rate_per_unit DECIMAL(10, 4),
    base_charge DECIMAL(10, 2),
    vat_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    paid_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_service (service),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- PAYMENTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    bill_id INT,
    service VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('nampost', 'banktransfer', 'card', 'mobilemoney', 'cash') NOT NULL,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('success', 'pending', 'failed', 'processing') DEFAULT 'pending',
    payment_details JSON,
    transaction_id VARCHAR(100),
    processor_response JSON,
    receipt_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
    INDEX idx_account_number (account_number),
    INDEX idx_reference (payment_reference),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- SERVICE REQUESTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    category ENUM('Water', 'Electricity', 'Billing', 'Infrastructure', 'Refuse', 'Other') NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    assigned_to VARCHAR(255),
    resolution_notes TEXT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_request_id (request_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- NOTIFICATIONS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    type ENUM('overdue', 'payment', 'high_usage', 'service_request', 'system', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_read_status (read_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- PAYMENT PLANS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS payment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    monthly_payment DECIMAL(10, 2) NOT NULL,
    duration_months INT NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    next_payment_date DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Cancelled', 'Defaulted') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- SETTINGS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- ACTIVITY LOG TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_account_number (account_number),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- STATEMENTS TABLE
-- ===================================
CREATE TABLE IF NOT EXISTS statements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    service ENUM('Water', 'Electricity', 'Property Rates', 'Refuse Collection', 'All Services') NOT NULL,
    period VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    balance_due DECIMAL(10, 2) NOT NULL,
    statement_data JSON,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_number) REFERENCES users(account_number) ON DELETE CASCADE,
    INDEX idx_account_number (account_number),
    INDEX idx_period (period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- INSERT DEFAULT ADMIN USER
-- ===================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (account_number, email, password_hash, name, first_name, phone, address, property_type, role, verified)
VALUES
('ADMIN001', 'admin@okahandja-municipality.na', '$2a$10$8K1p/a0dL3.I9gxXAZkN7.VEQqtZ3qz2X5kZ3qz2X5kZ3qz2X5kZ3q', 'Municipal Administrator', 'Admin', '+264 62 503 000', 'Okahandja Municipal Building, Main Street', 'Government', 'admin', TRUE);

-- ===================================
-- INSERT DEFAULT SETTINGS
-- ===================================
INSERT INTO settings (setting_key, setting_value, setting_type, description)
VALUES
('water_rate', '15.50', 'number', 'Water rate per cubic meter (N$)'),
('electricity_rate', '2.45', 'number', 'Electricity rate per kWh (N$)'),
('refuse_monthly', '125.00', 'number', 'Monthly refuse collection fee (N$)'),
('property_rate_residential', '0.008', 'number', 'Property rate percentage for residential (0.8%)'),
('property_rate_commercial', '0.012', 'number', 'Property rate percentage for commercial (1.2%)'),
('vat_percentage', '15', 'number', 'VAT percentage'),
('payment_due_days', '14', 'number', 'Days until payment is due'),
('overdue_penalty_percentage', '5', 'number', 'Late payment penalty percentage'),
('email_notifications_enabled', 'true', 'boolean', 'Enable email notifications'),
('sms_notifications_enabled', 'false', 'boolean', 'Enable SMS notifications');

-- ===================================
-- VIEWS FOR COMMON QUERIES
-- ===================================

-- View: User Dashboard Summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT
    u.account_number,
    u.name,
    u.email,
    COUNT(DISTINCT b.id) as total_bills,
    SUM(CASE WHEN b.status != 'Paid' THEN b.amount ELSE 0 END) as outstanding_balance,
    COUNT(DISTINCT CASE WHEN b.status = 'Overdue' THEN b.id END) as overdue_bills,
    COUNT(DISTINCT sr.id) as open_service_requests,
    COUNT(DISTINCT CASE WHEN n.read_status = FALSE THEN n.id END) as unread_notifications
FROM users u
LEFT JOIN bills b ON u.account_number = b.account_number
LEFT JOIN service_requests sr ON u.account_number = sr.account_number AND sr.status IN ('Open', 'In Progress')
LEFT JOIN notifications n ON u.account_number = n.account_number
GROUP BY u.account_number, u.name, u.email;

-- View: Admin Statistics
CREATE OR REPLACE VIEW admin_statistics AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_users,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success' AND MONTH(created_at) = MONTH(CURRENT_DATE)) as monthly_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE status != 'Paid') as outstanding_bills,
    (SELECT COUNT(*) FROM bills WHERE status = 'Overdue') as overdue_bill_count,
    (SELECT COUNT(*) FROM service_requests WHERE status IN ('Open', 'In Progress')) as open_service_requests,
    (SELECT COUNT(*) FROM payments WHERE DATE(created_at) = CURRENT_DATE) as today_payments;

-- ===================================
-- STORED PROCEDURES
-- ===================================

DELIMITER //

-- Procedure: Create New Bill
CREATE PROCEDURE create_bill(
    IN p_account_number VARCHAR(50),
    IN p_service ENUM('Water', 'Electricity', 'Property Rates', 'Refuse Collection'),
    IN p_current_reading DECIMAL(10, 2),
    IN p_billing_period VARCHAR(20)
)
BEGIN
    DECLARE v_previous_reading DECIMAL(10, 2);
    DECLARE v_units_consumed DECIMAL(10, 2);
    DECLARE v_rate_per_unit DECIMAL(10, 4);
    DECLARE v_base_charge DECIMAL(10, 2);
    DECLARE v_amount DECIMAL(10, 2);
    DECLARE v_vat_amount DECIMAL(10, 2);
    DECLARE v_total_amount DECIMAL(10, 2);
    DECLARE v_due_date DATE;
    DECLARE v_vat_percentage INT;
    DECLARE v_due_days INT;

    -- Get previous reading
    SELECT COALESCE(current_reading, 0) INTO v_previous_reading
    FROM bills
    WHERE account_number = p_account_number AND service = p_service
    ORDER BY created_at DESC
    LIMIT 1;

    -- Calculate units consumed
    SET v_units_consumed = p_current_reading - v_previous_reading;

    -- Get rate based on service
    IF p_service = 'Water' THEN
        SELECT CAST(setting_value AS DECIMAL(10, 4)) INTO v_rate_per_unit FROM settings WHERE setting_key = 'water_rate';
        SET v_base_charge = 50.00;
    ELSEIF p_service = 'Electricity' THEN
        SELECT CAST(setting_value AS DECIMAL(10, 4)) INTO v_rate_per_unit FROM settings WHERE setting_key = 'electricity_rate';
        SET v_base_charge = 75.00;
    END IF;

    -- Calculate amount
    SET v_amount = (v_units_consumed * v_rate_per_unit) + v_base_charge;

    -- Get VAT and due days
    SELECT CAST(setting_value AS DECIMAL(10, 2)) INTO v_vat_percentage FROM settings WHERE setting_key = 'vat_percentage';
    SELECT CAST(setting_value AS SIGNED) INTO v_due_days FROM settings WHERE setting_key = 'payment_due_days';

    -- Calculate VAT and total
    SET v_vat_amount = v_amount * (v_vat_percentage / 100);
    SET v_total_amount = v_amount + v_vat_amount;
    SET v_due_date = DATE_ADD(CURRENT_DATE, INTERVAL v_due_days DAY);

    -- Insert bill
    INSERT INTO bills (
        account_number, service, amount, due_date, status, billing_period,
        previous_reading, current_reading, units_consumed, rate_per_unit,
        base_charge, vat_amount, total_amount
    ) VALUES (
        p_account_number, p_service, v_amount, v_due_date, 'Pending', p_billing_period,
        v_previous_reading, p_current_reading, v_units_consumed, v_rate_per_unit,
        v_base_charge, v_vat_amount, v_total_amount
    );
END//

DELIMITER ;
