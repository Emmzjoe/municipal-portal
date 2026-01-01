#!/bin/bash

echo "🔍 Testing Registration System"
echo "=============================="
echo ""

# Test 1: Backend Health
echo "1️⃣  Checking backend health..."
HEALTH=$(/usr/bin/curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
    echo "   Response: $HEALTH"
else
    echo "❌ Backend is not responding"
    exit 1
fi
echo ""

# Test 2: Database Connection
echo "2️⃣  Checking database tables..."
TABLES=$(mysql -u root -p -e "USE okahandja_municipal; SHOW TABLES;" 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    echo "   Tables found:"
    echo "$TABLES" | grep -v "Tables_in"
else
    echo "❌ Database connection failed"
    echo "   Error: $TABLES"
    echo ""
    echo "💡 Fix:"
    echo "   1. Make sure MySQL is running: brew services start mysql"
    echo "   2. Run database setup: ./setup-database.sh"
    exit 1
fi
echo ""

# Test 3: Test Registration API
echo "3️⃣  Testing registration API endpoint..."
RESPONSE=$(/usr/bin/curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "TEST'$(date +%s)'",
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "firstName": "Test",
    "phone": "+264811234567"
  }' 2>&1)

echo "Response: $RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Registration API is working!"
    echo ""
    echo "🎉 System is ready for user registration"
else
    echo "❌ Registration failed"
    echo ""
    echo "💡 Common issues:"
    echo "   1. Database not set up - Run: ./setup-database.sh"
    echo "   2. Missing .env file - Run: cp backend/.env.example backend/.env"
    echo "   3. Wrong DB password in backend/.env"
    echo ""
    echo "Check backend logs for detailed error"
fi
echo ""

# Test 4: Check backend logs
echo "4️⃣  Recent backend logs:"
echo "   Check your backend terminal for errors"
echo ""
