# 🚀 Quick Reference Guide

## One-Command Setup

```bash
# 1. Setup database
./setup-database.sh

# 2. Start backend (in new terminal)
cd backend && npm install && npm run dev

# 3. Start frontend (in new terminal)
cd .. && python3 -m http.server 8080
```

## File Locations

| Purpose | File Path |
|---------|-----------|
| **Database Schema** | `backend/database/schema.sql` |
| **DB Connection** | `backend/config/database.js` |
| **Auth API** | `backend/routes/auth.js` |
| **Registration JS** | `js/register.js` |
| **Registration UI** | `index.html` (lines 53-145) |
| **Registration CSS** | `css/styles.css` (bottom) |
| **Environment Config** | `backend/.env` |

## Important URLs

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/api/health
- API Docs: See `backend/README.md`

## Database Commands

```bash
# Connect to database
mysql -u root -p okahandja_municipal

# Show tables
SHOW TABLES;

# View users
SELECT account_number, name, email, role, verified FROM users;

# Check settings
SELECT * FROM settings;

# View recent registrations
SELECT account_number, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10;

# Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;
```

## Environment Variables

Key `.env` variables:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=okahandja_municipal
DB_USER=root
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRY=24h

# Server
PORT=3000
NODE_ENV=development
```

## API Endpoints

### Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |

### Registration Request Body

```json
{
  "accountNumber": "12345678",
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "firstName": "John",
  "phone": "+264811234567",
  "address": "123 Main St, Okahandja",
  "propertyType": "Residential"
}
```

### Login Request Body

```json
{
  "accountNumber": "12345678",
  "password": "SecurePass123"
}
```

## Common Tasks

### Create Test User via Database

```sql
-- Hash password first (use bcrypt online tool or API)
-- Example: "Test123!" -> $2a$10$hash...

INSERT INTO users (
    account_number, email, password_hash, name, first_name,
    phone, property_type, role, verified
) VALUES (
    '99999999',
    'test@example.com',
    '$2a$10$your_bcrypt_hash_here',
    'Test User',
    'Test',
    '+264811234567',
    'Residential',
    'customer',
    TRUE
);
```

### Reset Admin Password

```sql
-- Generate new hash for "NewPassword123"
UPDATE users
SET password_hash = '$2a$10$new_hash_here'
WHERE account_number = 'ADMIN001';
```

### Check Backend Connection

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T...",
  "uptime": 123.456,
  "environment": "development"
}
```

### Test Registration API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "TEST0001",
    "email": "newuser@test.com",
    "password": "SecurePass123",
    "name": "Test User",
    "firstName": "Test",
    "phone": "+264811234567"
  }'
```

## Troubleshooting

### Backend won't start

```bash
# Check if MySQL is running
brew services list | grep mysql  # macOS
sudo systemctl status mysql      # Linux

# Check .env configuration
cat backend/.env | grep DB_

# Test database connection
mysql -u root -p -e "USE okahandja_municipal; SHOW TABLES;"
```

### Database connection error

1. Verify MySQL is running
2. Check `.env` credentials
3. Ensure database exists: `SHOW DATABASES LIKE 'okahandja_municipal';`
4. Test connection: `mysql -u root -p okahandja_municipal`

### Registration not working

1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check API health endpoint
4. Review backend logs for errors
5. Ensure database tables exist

### Password validation fails

Requirements:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

Valid examples:
- `Password123`
- `MySecure1Pass`
- `Test1234User`

Invalid examples:
- `password` (no uppercase, no number)
- `PASSWORD123` (no lowercase)
- `Pass1` (too short)

## Password Strength Indicator

| Strength | Score | Color | Requirements |
|----------|-------|-------|--------------|
| Weak | 0-59% | Red | Missing requirements |
| Medium | 60-79% | Orange | Most requirements |
| Strong | 80-100% | Green | All requirements + special chars |

## Validation Rules

| Field | Rules |
|-------|-------|
| Account Number | 8-50 characters, required |
| Email | Valid email format, unique |
| Password | 8+ chars, 1 upper, 1 lower, 1 number |
| Name | 2-255 characters |
| First Name | Required |
| Phone | 10-15 digits, format: +264... |
| Address | Optional, max 500 chars |
| Property Type | Residential/Commercial/Industrial/Government |

## Default Data

After schema import, database contains:

**Admin User:**
- Account: `ADMIN001`
- Email: `admin@okahandja-municipality.na`
- Role: `admin`
- Verified: `TRUE`

**Settings:**
- Water rate: N$ 15.50/m³
- Electricity rate: N$ 2.45/kWh
- Refuse monthly: N$ 125.00
- Property rate (residential): 0.8%
- Property rate (commercial): 1.2%
- VAT: 15%
- Payment due days: 14
- Overdue penalty: 5%

## Useful SQL Queries

```sql
-- Recent activity
SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10;

-- User registration stats
SELECT DATE(created_at) as date, COUNT(*) as registrations
FROM users
GROUP BY DATE(created_at);

-- Verified vs unverified users
SELECT verified, COUNT(*) FROM users GROUP BY verified;

-- Users by property type
SELECT property_type, COUNT(*) FROM users GROUP BY property_type;
```

## Browser DevTools

Check console for:
- API call responses
- Validation errors
- Registration success
- Network errors

## Production Checklist

Before deploying:
- [ ] Change JWT_SECRET in .env
- [ ] Set strong DB_PASSWORD
- [ ] Enable HTTPS
- [ ] Configure SMTP for emails
- [ ] Set up database backups
- [ ] Review CORS settings
- [ ] Enable rate limiting
- [ ] Set NODE_ENV=production
- [ ] Disable debug logging
- [ ] Review security headers
- [ ] Test email verification
- [ ] Test password reset
- [ ] Load test registration
- [ ] Audit activity logs

## Support Resources

- **Database Setup:** `DATABASE_SETUP.md`
- **API Documentation:** `backend/README.md`
- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Main README:** `README.md`

## Quick Fixes

### Forgot .env password?
```bash
cd backend
cat .env | grep DB_PASSWORD
```

### Reset database?
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS okahandja_municipal;"
./setup-database.sh
```

### Clear test data?
```sql
DELETE FROM users WHERE role = 'customer';
DELETE FROM activity_log;
DELETE FROM bills;
DELETE FROM payments;
```

### Export user data?
```bash
mysql -u root -p okahandja_municipal -e "SELECT * FROM users" > users_export.csv
```

---

**Need more help?** Check the full documentation files listed above!
