-- ===================================
-- SECURITY ENHANCEMENT: Account Lockout
-- ===================================
-- This migration adds account lockout functionality to prevent brute-force attacks

USE okahandja_municipal;

-- Add lockout-related columns to users table (if they don't exist)
ALTER TABLE users
ADD COLUMN failed_login_attempts INT DEFAULT 0 COMMENT 'Number of consecutive failed login attempts',
ADD COLUMN locked_until DATETIME DEFAULT NULL COMMENT 'Account locked until this timestamp',
ADD COLUMN last_failed_login DATETIME DEFAULT NULL COMMENT 'Timestamp of last failed login attempt';

-- Add index for efficient lockout queries
CREATE INDEX idx_locked_until ON users(locked_until);

-- Display confirmation
SELECT 'Account lockout columns added successfully' AS message;
