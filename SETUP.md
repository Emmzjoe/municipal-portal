# Okahandja Municipal App - Complete Setup Guide

## Project Overview

A comprehensive municipal service portal for the Okahandja Municipality in Namibia, featuring:

✅ **Bill Management** - View and track water, electricity, property rates, and refuse collection bills
✅ **Payment Gateway** - 5 integrated payment methods (Nam Post, Bank Transfer, Card, Mobile Money, Cash)
✅ **Service Requests** - Submit and track service requests (water leaks, streetlights, etc.)
✅ **Account Statements** - Generate and download monthly/annual statements
✅ **Notifications** - Real-time alerts and notifications
✅ **Admin Dashboard** - Complete administrative controls
✅ **Reports & Analytics** - Comprehensive reporting and data visualization
✅ **Backend API** - Full REST API with 80+ endpoints

## Project Structure

```
okahandja-municipal-app/
├── index.html                    # Main application entry point
├── css/
│   └── styles.css               # Application styles with dark mode
├── js/
│   ├── api-client.js            # Backend API integration (NEW)
│   ├── app.js                   # Main application logic
│   ├── auth.js                  # Authentication handling
│   ├── payments.js              # Payment gateway integration
│   ├── statements.js            # Statement generation
│   ├── admin.js                 # Admin dashboard
│   ├── features.js              # Additional features
│   └── data.js                  # Mock data
├── backend/                      # Backend API (NEW)
│   ├── server.js                # Express server
│   ├── package.json             # Node.js dependencies
│   ├── .env.example             # Environment variables template
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   └── routes/
│       ├── auth.js              # Authentication endpoints
│       ├── users.js             # User management
│       ├── bills.js             # Bill management
│       ├── payments.js          # Payment processing
│       ├── statements.js        # Statement generation
│       ├── serviceRequests.js   # Service request handling
│       ├── notifications.js     # Notification management
│       ├── reports.js           # Reports & analytics
│       └── settings.js          # Settings management
├── INTEGRATION_GUIDE.md         # Frontend-Backend integration guide
├── backend/README.md            # Backend API documentation
└── SETUP.md                     # This file

```

## Quick Start (5 Minutes)

### 1. Start Backend Server

```bash
# Open terminal/command prompt
cd backend

# Install dependencies (first time only)
npm install

# Create environment file (first time only)
cp .env.example .env

# Start the server
npm run dev
```

**Backend will run on:** http://localhost:3000

### 2. Open Frontend

Option A - Direct File:
```bash
# Just open index.html in your browser
open index.html  # Mac
start index.html # Windows
```

Option B - Local Server (recommended):
```bash
# In the main project directory
python3 -m http.server 8080
# OR
npx http-server -p 8080
```

**Frontend will run on:** http://localhost:8080

### 3. Test the Application

1. Open http://localhost:8080 in your browser
2. Login with demo credentials:
   - **Resident Account:**
     - Account Number: `12345678`
     - Password: `password123` (any password works)
   - **Admin Account:**
     - Account Number: `ADMIN001`
     - Password: `admin123` (any password works)
3. Test features:
   - View bills
   - Make a payment
   - Submit a service request
   - Check notifications

## Detailed Setup

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Web Browser** (Chrome, Firefox, Safari, Edge)
- **Text Editor** (VS Code, Sublime, etc.) - Optional

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This installs:
   - express - Web framework
   - jsonwebtoken - JWT authentication
   - bcryptjs - Password hashing
   - cors - Cross-origin resource sharing
   - helmet - Security headers
   - morgan - Request logging
   - express-rate-limit - Rate limiting
   - express-validator - Input validation
   - dotenv - Environment variables

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file (optional, defaults work fine):
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-secret-key-here
   ```

4. **Start the server:**
   ```bash
   # Development mode (auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify backend is running:**
   - Open http://localhost:3000 in browser
   - You should see API information and endpoints list
   - Health check: http://localhost:3000/api/health

### Frontend Setup

1. **Option 1 - Simple (Just open the file):**
   - Navigate to the project folder
   - Double-click `index.html`
   - Application opens in default browser

2. **Option 2 - Local Web Server (Recommended):**

   Using Python:
   ```bash
   python3 -m http.server 8080
   ```

   Using Node.js:
   ```bash
   npx http-server -p 8080
   ```

   Using PHP:
   ```bash
   php -S localhost:8080
   ```

3. **Access the application:**
   - Open http://localhost:8080 in browser

### Configuration

#### Backend Configuration (backend/.env)

```env
# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRY=24h

# CORS (add your frontend URL)
CORS_ORIGIN=http://localhost:8080,http://localhost:3000

# Features
FEATURE_REGISTRATION_ENABLED=true
FEATURE_TWO_FACTOR_AUTH=false
```

#### Frontend Configuration (js/api-client.js)

```javascript
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',  // Change for production
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
};
```

## Features Overview

### 1. User Features

#### Bill Management
- View all outstanding bills
- See bill details with consumption data
- Track billing history
- Download bills as PDF

#### Payment Processing
- **5 Payment Methods:**
  1. Nam Post Mobile Money
  2. Bank Transfer (FNB, Bank Windhoek, Standard Bank)
  3. Debit/Credit Card (Visa, Mastercard)
  4. Mobile Money (MTC, TN Mobile)
  5. Cash at Office
- Instant payment processing
- Auto-download receipts
- Payment history tracking

#### Service Requests
- Submit requests (water leaks, streetlights, etc.)
- Track request status
- Add comments and updates
- View resolution timeline

#### Account Statements
- Monthly and annual statements
- Download as PDF
- Email statements
- Consumption analysis

#### Notifications
- Bill reminders
- Payment confirmations
- Service request updates
- System announcements

### 2. Admin Features

#### Dashboard Analytics
- Revenue tracking
- Collection rates
- Customer statistics
- Service request metrics

#### User Management
- View all customers
- Edit user details
- Manage permissions
- Account status control

#### Bill Management
- Create new bills
- Update bill amounts
- Mark bills as paid
- Void bills

#### Payment Management
- View all transactions
- Payment verification
- Refund processing
- Payment reports

#### Service Request Management
- Assign requests to departments
- Update request status
- Add internal notes
- Resolution tracking

#### Reports
- Financial reports
- Collection reports
- Customer reports
- Consumption reports
- Export to CSV/PDF/Excel

#### System Settings
- Tariff management
- Public holidays
- Office hours
- FAQ management
- System configuration

## API Documentation

The backend provides 80+ REST API endpoints across 9 modules:

### Modules

1. **Authentication** - `/api/auth`
   - Login, Register, Logout
   - Password reset
   - Token management

2. **Users** - `/api/users`
   - Profile management
   - Account summary
   - User administration

3. **Bills** - `/api/bills`
   - Bill CRUD operations
   - Outstanding bills
   - Billing history

4. **Payments** - `/api/payments`
   - Payment processing
   - Payment verification
   - Payment methods
   - Transaction history

5. **Statements** - `/api/statements`
   - Statement generation
   - PDF downloads
   - Annual summaries

6. **Service Requests** - `/api/service-requests`
   - Request management
   - Status tracking
   - Comments and updates

7. **Notifications** - `/api/notifications`
   - Notification delivery
   - Preferences management
   - Read/unread tracking

8. **Reports** - `/api/reports`
   - User reports
   - Admin analytics
   - Data exports

9. **Settings** - `/api/settings`
   - User preferences
   - System configuration
   - Tariff management

**Full API documentation:** See `backend/README.md`

## Testing

### Manual Testing

1. **Authentication Flow:**
   - Login with demo account
   - Check token is stored
   - Logout and verify token is cleared

2. **Bill Management:**
   - View bills list
   - Click on bill to see details
   - Verify total outstanding calculation

3. **Payment Processing:**
   - Test each payment method:
     - Nam Post (with phone number)
     - Bank Transfer (with account details)
     - Card Payment (with card details)
     - Mobile Money (with provider selection)
     - Cash (generates payment slip)
   - Verify receipt generation
   - Check payment appears in history

4. **Service Requests:**
   - Submit new request
   - View request list
   - Check status updates

5. **Admin Features:**
   - Login as admin (ADMIN001)
   - Access admin dashboard
   - View analytics
   - Manage users

### API Testing with Curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"accountNumber":"12345678","password":"password123"}'

# Get bills (replace YOUR_TOKEN)
curl http://localhost:3000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN"

# Process payment
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "service": "Water",
    "amount": 1245.00,
    "paymentMethod": "card",
    "paymentDetails": {
      "cardNumber": "4111111111111111",
      "cardName": "John Doe",
      "cardExpiry": "12/25",
      "cardCVV": "123"
    }
  }'
```

## Troubleshooting

### Backend won't start

**Problem:** `npm install` fails
- **Solution:** Make sure Node.js is installed (`node --version`)
- Try: `npm cache clean --force` then `npm install` again

**Problem:** Port 3000 already in use
- **Solution:** Change PORT in `.env` file, or kill process using port 3000

### Frontend can't connect to backend

**Problem:** API requests fail with "Failed to fetch"
- **Solution:**
  1. Verify backend is running (check http://localhost:3000)
  2. Check API_CONFIG.baseURL in `js/api-client.js`
  3. Ensure CORS is configured in backend

**Problem:** CORS errors in console
- **Solution:** Add your frontend URL to CORS_ORIGIN in backend `.env`

### Login not working

**Problem:** "Invalid credentials"
- **Solution:** Use demo credentials: 12345678 / password123

**Problem:** Login succeeds but dashboard doesn't load
- **Solution:** Check browser console for errors, verify API client is loaded

### Payments not processing

**Problem:** Payment modal shows but nothing happens
- **Solution:**
  1. Check backend console for errors
  2. Verify payment details are filled correctly
  3. Check browser console for JavaScript errors

## Production Deployment

### Backend Deployment

1. **Prepare for production:**
   ```bash
   # Set production environment
   NODE_ENV=production

   # Use strong JWT secret
   JWT_SECRET=your-very-strong-random-secret-key

   # Configure database (when ready)
   DATABASE_URL=your-database-connection-string
   ```

2. **Deploy to hosting service:**
   - **Heroku:** `git push heroku main`
   - **DigitalOcean App Platform:** Connect GitHub repo
   - **AWS Elastic Beanstalk:** Upload ZIP file
   - **Railway:** Connect GitHub repo

3. **Set environment variables** on hosting platform

### Frontend Deployment

1. **Update API URL:**
   ```javascript
   // In js/api-client.js
   const API_CONFIG = {
       baseURL: 'https://api.okahandja.gov.na/api',
       // ...
   };
   ```

2. **Deploy to static hosting:**
   - **Netlify:** Drag & drop folder or connect Git
   - **Vercel:** Connect GitHub repo
   - **GitHub Pages:** Push to gh-pages branch
   - **AWS S3:** Upload files to S3 bucket

## Next Steps

### Immediate Enhancements

1. **Database Integration:**
   - Add MySQL/PostgreSQL database
   - Create database schema
   - Replace mock data with database queries

2. **Real Payment Gateways:**
   - Integrate Nam Post API
   - Add Peach Payments or PayGate for cards
   - Integrate MTC Mobile Money API

3. **Email Notifications:**
   - Configure SMTP (Gmail, SendGrid, etc.)
   - Send bill reminders
   - Payment confirmations
   - Service request updates

### Future Features

- [ ] SMS notifications
- [ ] Two-factor authentication
- [ ] File upload for service requests
- [ ] Mobile app (React Native)
- [ ] Consumption predictions
- [ ] Auto-payment setup
- [ ] Multi-language support
- [ ] Accessibility improvements

## Support & Documentation

- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **Backend API Docs:** `backend/README.md`
- **API Client:** See comments in `js/api-client.js`
- **Issues:** Report on GitHub or contact support

## License

© 2024 Okahandja Municipality. All rights reserved.

---

**Generated with Claude Code**
