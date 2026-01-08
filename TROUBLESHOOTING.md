# 🔧 Troubleshooting Guide

## Registration Errors

### "An error occurred during registration. Please try again."

This generic error can have several causes. Follow these steps:

#### Step 1: Check Backend is Running

```bash
# Test backend health
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"healthy","timestamp":"...","uptime":123.45,"environment":"development"}
```

**If backend not responding:**
```bash
# Navigate to backend directory
cd /Users/emmz/Downloads/okahandja-municipal-app/backend

# Start backend
npm run dev
```

You should see:
```
🏛️  Okahandja Municipality API Server
🚀 Server running on http://localhost:3000
📊 Initializing database connection...
✅ Database connected successfully
```

#### Step 2: Check Database Connection

**If you see:** `⚠️  Database not connected. Using mock data mode.`

This means MySQL is not set up. Fix it:

```bash
# Option A: Run automated setup
./setup-database.sh

# Option B: Manual setup
# 1. Start MySQL
brew services start mysql  # macOS
# or
sudo systemctl start mysql  # Linux

# 2. Import schema
mysql -u root -p okahandja_municipal < backend/database/schema.sql
```

#### Step 3: Verify Database Tables

```bash
mysql -u root -p -e "USE okahandja_municipal; SHOW TABLES;"
```

**Expected output:**
```
+--------------------------------+
| Tables_in_okahandja_municipal |
+--------------------------------+
| activity_log                   |
| bills                          |
| notifications                  |
| payment_plans                  |
| payments                       |
| service_requests               |
| settings                       |
| statements                     |
| users                          |
+--------------------------------+
```

**If no tables or database doesn't exist:**
```bash
./setup-database.sh
```

#### Step 4: Check .env Configuration

```bash
cat backend/.env | grep DB_
```

**Should show:**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=okahandja_municipal
DB_USER=root
DB_PASSWORD=your_password_here
```

**If .env doesn't exist:**
```bash
cd backend
cp .env.example .env
nano .env  # Edit DB_PASSWORD
```

#### Step 5: Test Registration API Directly

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "TEST0001",
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "firstName": "Test",
    "phone": "+264811234567"
  }'
```

**Success response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "accountNumber": "TEST0001", ... }
  },
  "message": "Registration successful..."
}
```

**Error response:**
```json
{
  "success": false,
  "error": {
    "message": "Error details here",
    "status": 400
  }
}
```

## Common Error Messages

### "Account number already registered"

**Cause:** This account number is already in the database.

**Solution:** Use a different account number or delete the existing user:

```sql
mysql -u root -p okahandja_municipal
DELETE FROM users WHERE account_number = 'YOUR_ACCOUNT_NUMBER';
```

### "Email already registered"

**Cause:** This email is already in use.

**Solution:** Use a different email or delete the existing user:

```sql
mysql -u root -p okahandja_municipal
DELETE FROM users WHERE email = 'your@email.com';
```

### "Password must contain at least one uppercase letter"

**Cause:** Password doesn't meet requirements.

**Solution:** Ensure password has:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)

**Valid examples:**
- `Password123`
- `MySecure1`
- `Test2024User`

### "Invalid phone number format"

**Cause:** Phone number doesn't match required pattern.

**Solution:** Use format: `+264811234567` (10-15 digits, optional +)

**Valid examples:**
- `+264811234567`
- `264811234567`
- `0811234567`

### "Validation failed"

**Cause:** One or more fields don't meet requirements.

**Solution:** Check browser console (F12) for detailed validation errors:

```javascript
// Open browser DevTools (F12)
// Check Console tab for errors
```

## Browser Console Errors

### "Failed to fetch" or "Network Error"

**Cause:** Cannot connect to backend API.

**Check:**
1. Backend is running on port 3000
2. Frontend is accessing correct URL (http://localhost:3000)
3. CORS is enabled in backend

**Fix:**
```bash
# Restart backend
cd backend
npm run dev
```

### "TypeError: Cannot read property 'user' of undefined"

**Cause:** API response structure doesn't match expected format.

**Fix:**
1. Check backend logs for errors
2. Verify API is returning correct response format
3. Check network tab in browser DevTools

### "CORS Error"

**Cause:** Cross-origin request blocked.

**Fix:** Ensure backend has CORS enabled (should be by default):

```javascript
// In backend/server.js
app.use(cors());
```

## MySQL Errors

### "Access denied for user"

**Cause:** Wrong MySQL password in `.env`

**Fix:**
```bash
cd backend
nano .env  # Update DB_PASSWORD
```

### "Unknown database 'okahandja_municipal'"

**Cause:** Database not created.

**Fix:**
```bash
mysql -u root -p -e "CREATE DATABASE okahandja_municipal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p okahandja_municipal < backend/database/schema.sql
```

### "Table 'users' doesn't exist"

**Cause:** Schema not imported.

**Fix:**
```bash
mysql -u root -p okahandja_municipal < backend/database/schema.sql
```

### "Can't connect to MySQL server"

**Cause:** MySQL not running.

**Fix:**
```bash
# macOS
brew services start mysql

# Linux
sudo systemctl start mysql

# Check status
brew services list | grep mysql  # macOS
sudo systemctl status mysql      # Linux
```

## Backend Server Errors

### Port 3000 already in use

**Error:** `EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
echo "PORT=3001" >> backend/.env
```

### Module not found

**Error:** `Cannot find module 'express'` or similar

**Fix:**
```bash
cd backend
npm install
```

### .env file not found

**Error:** Backend can't find database config

**Fix:**
```bash
cd backend
cp .env.example .env
nano .env  # Configure database credentials
```

## Frontend Issues

### Registration modal not showing

**Fix:**
1. Check browser console for JavaScript errors
2. Verify [js/register.js](js/register.js) is loaded:
   ```html
   <script src="js/register.js"></script>
   ```
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Password strength indicator not working

**Fix:**
1. Check browser console for errors
2. Verify password input has correct ID: `regPassword`
3. Clear browser cache

### Form not submitting

**Check:**
1. All required fields are filled
2. Password meets requirements
3. Terms checkbox is checked
4. Check browser console for errors

## Diagnostic Tools

### Run Full System Test

```bash
./test-registration.sh
```

This will check:
- Backend health
- Database connection
- Database tables
- Registration API

### Check Backend Logs

Backend logs appear in the terminal where you ran `npm run dev`. Look for:

```
❌ Database query error: ...
❌ Registration error: ...
✅ User registered: ...
```

### Check Browser DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Console tab - check for JavaScript errors
3. Go to Network tab - check API requests
4. Look for `/api/auth/register` request
5. Click on it to see Request/Response

**Successful request shows:**
- Status: 201 Created
- Response: `{"success":true,...}`

**Failed request shows:**
- Status: 400, 500, etc.
- Response: `{"success":false,"error":{...}}`

## Step-by-Step Reset

If nothing works, start fresh:

### 1. Stop Everything

```bash
# Stop backend (Ctrl+C in backend terminal)
# Stop frontend (Ctrl+C in frontend terminal)
```

### 2. Reset Database

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS okahandja_municipal;"
./setup-database.sh
```

### 3. Reset Backend

```bash
cd backend
rm -rf node_modules
rm .env
npm install
cp .env.example .env
nano .env  # Set DB_PASSWORD
```

### 4. Restart Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
python3 -m http.server 8080
```

### 5. Test Registration

1. Open http://localhost:8080
2. Click "Create Account"
3. Fill form with valid data
4. Submit

## Still Having Issues?

### Collect Debug Information

```bash
# System info
node --version
mysql --version

# Backend status
curl http://localhost:3000/api/health

# Database status
mysql -u root -p -e "SHOW DATABASES LIKE 'okahandja_municipal';"
mysql -u root -p okahandja_municipal -e "SHOW TABLES;"

# Check .env
cat backend/.env | grep -v PASSWORD
```

### Common Mistakes

1. ❌ MySQL not installed → Install MySQL first
2. ❌ MySQL not running → Start with `brew services start mysql`
3. ❌ Database not created → Run `./setup-database.sh`
4. ❌ Wrong password in .env → Update DB_PASSWORD
5. ❌ Backend not running → Run `npm run dev` in backend directory
6. ❌ Wrong port → Backend should be on 3000, frontend on 8080
7. ❌ node_modules missing → Run `npm install` in backend

### Debug Checklist

- [ ] MySQL is installed and running
- [ ] Database `okahandja_municipal` exists
- [ ] Tables are created (9 tables)
- [ ] `.env` file exists in backend directory
- [ ] DB_PASSWORD is correct in `.env`
- [ ] Backend is running on port 3000
- [ ] Backend shows "✅ Database connected successfully"
- [ ] Frontend is accessible on port 8080
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls

## Contact & Resources

- **Database Setup:** [DATABASE_SETUP.md](DATABASE_SETUP.md)
- **Quick Reference:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **API Docs:** [backend/README.md](backend/README.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
