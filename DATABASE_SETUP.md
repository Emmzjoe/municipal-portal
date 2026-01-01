# 🗄️ MySQL Database Setup Guide

This guide will help you set up the MySQL database for the Okahandja Municipality Portal.

## Prerequisites

- MySQL 5.7 or higher (or MariaDB 10.2+)
- MySQL client or MySQL Workbench installed

## Installation Steps

### 1. Install MySQL (if not already installed)

**macOS:**
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

**Windows:**
- Download MySQL from https://dev.mysql.com/downloads/mysql/
- Run the installer and follow the setup wizard

### 2. Create Database and User

Open MySQL command line:
```bash
mysql -u root -p
```

Then run the following commands:
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS okahandja_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional - for production use)
CREATE USER IF NOT EXISTS 'okahandja_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON okahandja_municipal.* TO 'okahandja_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Import Database Schema

Navigate to the project directory and import the schema:

```bash
cd /Users/emmz/Downloads/okahandja-municipal-app

# Import the schema
mysql -u root -p okahandja_municipal < backend/database/schema.sql
```

Or if you created a dedicated user:
```bash
mysql -u okahandja_user -p okahandja_municipal < backend/database/schema.sql
```

### 4. Configure Environment Variables

Update your `.env` file in the `backend` directory:

```bash
cd backend

# Copy example if not exists
cp .env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Update these database configuration values:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=okahandja_municipal
DB_USER=root
DB_PASSWORD=your_mysql_password
```

If you created a dedicated user:
```env
DB_USER=okahandja_user
DB_PASSWORD=your_secure_password_here
```

### 5. Verify Database Setup

Check that tables were created successfully:

```bash
mysql -u root -p okahandja_municipal
```

```sql
-- Show all tables
SHOW TABLES;

-- You should see:
-- +--------------------------------+
-- | Tables_in_okahandja_municipal |
-- +--------------------------------+
-- | activity_log                   |
-- | bills                          |
-- | notifications                  |
-- | payment_plans                  |
-- | payments                       |
-- | service_requests               |
-- | settings                       |
-- | statements                     |
-- | users                          |
-- +--------------------------------+

-- Check if admin user exists
SELECT account_number, name, email, role FROM users WHERE role = 'admin';

-- Check settings
SELECT setting_key, setting_value FROM settings;

EXIT;
```

### 6. Test Database Connection

Start the backend server:
```bash
cd backend
npm run dev
```

You should see:
```
🏛️  Okahandja Municipality API Server
🚀 Server running on http://localhost:3000
📝 Environment: development
⏰ Started at: 2025-12-14T...

📊 Initializing database connection...
✅ Database connected successfully
```

If you see "❌ Database connection failed", check:
1. MySQL service is running: `brew services list` (macOS) or `sudo systemctl status mysql` (Linux)
2. Database credentials in `.env` are correct
3. Database `okahandja_municipal` exists
4. User has proper permissions

## Database Schema Overview

### Main Tables

**users** - User accounts and authentication
- `account_number` (primary key) - Unique account identifier
- `email` - User email (unique)
- `password_hash` - Bcrypt hashed password
- `name`, `first_name` - User names
- `phone`, `address` - Contact information
- `property_type` - Residential, Commercial, Industrial, Government
- `role` - customer, staff, admin
- `verified` - Email verification status

**bills** - Service bills
- Water, Electricity, Property Rates, Refuse Collection
- Tracks current/previous readings, consumption
- Status: Paid, Overdue, Due Soon, Pending

**payments** - Payment transactions
- Links to bills
- Multiple payment methods (nampost, card, bank transfer, mobile money, cash)
- Transaction tracking and receipts

**service_requests** - User service requests
- Water leaks, meter issues, billing queries, etc.
- Priority levels and status tracking

**notifications** - User notifications
- Bill reminders, payment confirmations, usage alerts
- Read/unread status

**payment_plans** - Installment plans
- Flexible payment schedules
- Progress tracking

**settings** - System configuration
- Service rates, VAT, notification settings

**activity_log** - Audit trail
- User actions, system events
- IP address tracking

## Default Data

The schema includes:
- 1 admin user (account: ADMIN001, check schema for password hash)
- Default system settings (water/electricity rates, VAT, etc.)

## Creating Test Data

To add a test user manually:

```sql
-- Hash password "Test123!" using bcrypt (salt rounds = 10)
-- You can use online bcrypt generators or the backend API

INSERT INTO users (
    account_number, email, password_hash, name, first_name,
    phone, address, property_type, role, verified
) VALUES (
    '99999999',
    'test@example.com',
    '$2a$10$your_bcrypt_hash_here',
    'Test User',
    'Test',
    '+264811234567',
    '123 Test Street, Okahandja',
    'Residential',
    'customer',
    TRUE
);
```

Or use the registration form in the frontend!

## Backup and Restore

### Backup Database
```bash
mysqldump -u root -p okahandja_municipal > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
mysql -u root -p okahandja_municipal < backup_20250101.sql
```

## Troubleshooting

### Connection Refused
```bash
# Check if MySQL is running
brew services list  # macOS
sudo systemctl status mysql  # Linux

# Start MySQL if not running
brew services start mysql  # macOS
sudo systemctl start mysql  # Linux
```

### Access Denied
- Verify username and password in `.env`
- Check user privileges: `SHOW GRANTS FOR 'username'@'localhost';`

### Database Not Found
```sql
-- Create database manually
CREATE DATABASE okahandja_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Tables Not Created
- Re-import schema: `mysql -u root -p okahandja_municipal < backend/database/schema.sql`
- Check for SQL errors in import output

## Security Recommendations

### Production Setup

1. **Use dedicated database user** (not root)
2. **Strong password** for database user
3. **Firewall rules** - only allow backend server to connect
4. **Regular backups** - automated daily backups
5. **SSL/TLS** connections for remote databases
6. **Update .env** - never commit database passwords to git

### Password Security
```env
# Generate strong password
openssl rand -base64 32

# Update in .env
DB_PASSWORD=generated_strong_password_here
```

### Restrict User Permissions (Production)
```sql
-- Revoke all first
REVOKE ALL PRIVILEGES ON *.* FROM 'okahandja_user'@'localhost';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON okahandja_municipal.* TO 'okahandja_user'@'localhost';
FLUSH PRIVILEGES;
```

## Next Steps

1. ✅ Install MySQL
2. ✅ Create database and user
3. ✅ Import schema
4. ✅ Configure `.env`
5. ✅ Test connection
6. ✅ Register new users via the frontend
7. ✅ Test login with registered users

For API documentation, see [backend/README.md](backend/README.md)

For integration guide, see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
