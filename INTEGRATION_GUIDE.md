# Frontend-Backend Integration Guide

This guide explains how to integrate the Okahandja Municipal App frontend with the backend API.

## Overview

The application now has:
- **Frontend**: Static HTML/CSS/JavaScript application with payment gateway UI
- **Backend**: Node.js/Express REST API with all endpoints
- **API Client**: JavaScript library for easy frontend-backend communication

## Architecture

```
┌─────────────────────────────────────────────┐
│           Frontend (Browser)                 │
│  ┌────────────────────────────────────────┐ │
│  │  HTML/CSS/JavaScript Application       │ │
│  │  - index.html                           │ │
│  │  - Payment Gateway UI                   │ │
│  │  - Dashboard, Charts, Reports           │ │
│  └────────────────────────────────────────┘ │
│                    ↓                         │
│  ┌────────────────────────────────────────┐ │
│  │  API Client (js/api-client.js)         │ │
│  │  - Authentication                       │ │
│  │  - API Requests                         │ │
│  │  - Token Management                     │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↓ HTTP/JSON
┌─────────────────────────────────────────────┐
│           Backend (Node.js)                  │
│  ┌────────────────────────────────────────┐ │
│  │  Express API Server                     │ │
│  │  - Authentication (JWT)                 │ │
│  │  - Bill Management                      │ │
│  │  - Payment Processing                   │ │
│  │  - Service Requests                     │ │
│  │  - Notifications                        │ │
│  │  - Reports & Analytics                  │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## Quick Start

### 1. Start the Backend Server

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the server
npm run dev
```

The API will be available at: `http://localhost:3000`

### 2. Serve the Frontend

Open `index.html` in a browser, or use a local web server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080
```

The frontend will be available at: `http://localhost:8080`

### 3. Test the Integration

1. Open `http://localhost:8080` in your browser
2. Login with demo credentials:
   - Account Number: `12345678`
   - Password: `password123` (any password works in demo mode)
3. Try making a payment to test the payment gateway integration

## API Client Usage

The API client is automatically included in the application. Here's how to use it:

### Authentication

```javascript
// Login
try {
    const response = await API.auth.login('12345678', 'password123', true);
    console.log('Login successful:', response.data.user);
    // User is now authenticated, token is stored automatically
} catch (error) {
    console.error('Login failed:', error.message);
}

// Logout
await API.auth.logout();

// Check if authenticated
if (isAuthenticated()) {
    console.log('User is logged in');
}

// Get current user
const userData = await API.auth.getCurrentUser();
```

### Bills

```javascript
// Get all bills
const bills = await API.bills.getAll();
console.log('Bills:', bills.data.bills);

// Get specific bill
const bill = await API.bills.getById(1);
console.log('Bill details:', bill.data);

// Get outstanding summary
const summary = await API.bills.getOutstandingSummary();
console.log('Total outstanding:', summary.data.totalOutstanding);
```

### Payments

```javascript
// Process payment
const paymentData = {
    billId: 1,
    service: 'Water',
    amount: 1245.00,
    paymentMethod: 'card',
    paymentDetails: {
        cardNumber: '4111111111111111',
        cardName: 'John Doe',
        cardExpiry: '12/25',
        cardCVV: '123'
    }
};

try {
    const result = await API.payments.process(paymentData);
    console.log('Payment successful:', result.data.reference);
} catch (error) {
    console.error('Payment failed:', error.message);
}

// Get payment history
const history = await API.payments.getHistory();
console.log('Payment history:', history.data.payments);

// Get available payment methods
const methods = await API.payments.getMethods();
console.log('Available methods:', methods.data);
```

### Service Requests

```javascript
// Create service request
const requestData = {
    type: 'Water Leak',
    category: 'Water',
    description: 'Water leak on main road near my property',
    location: '123 Main Street, Okahandja',
    priority: 'High'
};

const result = await API.serviceRequests.create(requestData);
console.log('Request created:', result.data.id);

// Get all service requests
const requests = await API.serviceRequests.getAll();
console.log('Service requests:', requests.data.serviceRequests);

// Get categories
const categories = await API.serviceRequests.getCategories();
console.log('Categories:', categories.data);
```

### Notifications

```javascript
// Get unread notifications
const notifications = await API.notifications.getAll(1, 20, true);
console.log('Unread count:', notifications.data.summary.unreadCount);

// Mark notification as read
await API.notifications.markAsRead(1);

// Mark all as read
await API.notifications.markAllAsRead();
```

## Integrating Payment Gateway with Backend

The payment gateway UI already exists in the frontend. Here's how to connect it to the backend:

### Update `js/payments.js`

Find the payment processing functions and update them to use the API client:

```javascript
// In processCardPayment function
async function processCardPayment(service, amount) {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        alert('Please fill in all card details');
        return;
    }

    showPaymentProcessing();

    try {
        // Call backend API
        const result = await API.payments.process({
            service: service,
            amount: amount,
            paymentMethod: 'card',
            paymentDetails: {
                cardNumber: cardNumber,
                cardName: cardName,
                cardExpiry: cardExpiry,
                cardCVV: cardCVV
            }
        });

        hidePaymentProcessing();

        if (result.success) {
            completePayment(
                service,
                amount,
                'Card Payment',
                result.data.reference
            );
        }
    } catch (error) {
        hidePaymentProcessing();
        alert('Payment failed: ' + error.message);
    }
}
```

### Similar updates for other payment methods:

```javascript
// Nam Post
async function processNamPostPayment(service, amount) {
    const phone = document.getElementById('nampostPhone').value;

    if (!phone) {
        alert('Please enter your phone number');
        return;
    }

    showPaymentProcessing();

    try {
        const result = await API.payments.process({
            service: service,
            amount: amount,
            paymentMethod: 'nampost',
            paymentDetails: { phone: phone }
        });

        hidePaymentProcessing();
        completePayment(service, amount, 'Nam Post Mobile Money', result.data.reference);
    } catch (error) {
        hidePaymentProcessing();
        alert('Payment failed: ' + error.message);
    }
}

// Bank Transfer
async function processBankTransferPayment(service, amount) {
    const bank = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('bankAccountNumber').value;
    const accountHolder = document.getElementById('bankAccountHolder').value;

    if (!bank || !accountNumber || !accountHolder) {
        alert('Please fill in all bank transfer details');
        return;
    }

    showPaymentProcessing();

    try {
        const result = await API.payments.process({
            service: service,
            amount: amount,
            paymentMethod: 'banktransfer',
            paymentDetails: {
                bank: bank,
                accountNumber: accountNumber,
                accountHolder: accountHolder
            }
        });

        hidePaymentProcessing();
        completePayment(service, amount, `Bank Transfer (${bank})`, result.data.reference);
    } catch (error) {
        hidePaymentProcessing();
        alert('Payment failed: ' + error.message);
    }
}
```

## Updating Authentication Flow

### Update `js/auth.js`

Replace the current login function with API integration:

```javascript
async function performLogin(event) {
    event.preventDefault();

    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;

    try {
        // Call backend API
        const response = await API.auth.login(accountNumber, password, true);

        if (response.success) {
            // Update UI with user data
            document.getElementById('userName').textContent = response.data.user.name;
            document.getElementById('userAccount').textContent = `A/C: ${response.data.user.accountNumber}`;
            document.getElementById('welcomeName').textContent = response.data.user.name.split(' ')[0];

            // Show dashboard
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('dashboardScreen').classList.remove('hidden');

            // Load user data
            loadDashboardData();
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

// Add event listener
document.getElementById('loginForm').addEventListener('submit', performLogin);
```

### Update Logout Function

```javascript
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        await API.auth.logout();

        // Redirect to login screen
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('loginScreen').classList.remove('hidden');

        // Clear form
        document.getElementById('loginForm').reset();
    }
}
```

## Loading Dashboard Data from API

Create a function to load all dashboard data:

```javascript
async function loadDashboardData() {
    try {
        // Load bills
        const billsResponse = await API.bills.getAll();
        if (billsResponse.success) {
            displayBills(billsResponse.data.bills);
            updateTotalOutstanding(billsResponse.data.summary.totalOutstanding);
        }

        // Load payment history
        const paymentsResponse = await API.payments.getHistory(1, 10);
        if (paymentsResponse.success) {
            displayPaymentHistory(paymentsResponse.data.payments);
        }

        // Load service requests
        const requestsResponse = await API.serviceRequests.getAll();
        if (requestsResponse.success) {
            displayServiceRequests(requestsResponse.data.serviceRequests);
        }

        // Load notifications
        const notificationsResponse = await API.notifications.getAll(1, 5, true);
        if (notificationsResponse.success) {
            displayNotifications(notificationsResponse.data.notifications);
            updateNotificationBadge(notificationsResponse.data.summary.unreadCount);
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayBills(bills) {
    // Update your bill UI here
    console.log('Displaying bills:', bills);
}

function updateTotalOutstanding(total) {
    const element = document.getElementById('totalOutstanding');
    if (element) {
        element.textContent = total.toFixed(2);
    }
}

function displayPaymentHistory(payments) {
    // Update payment history UI
    console.log('Displaying payment history:', payments);
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}
```

## Error Handling

Always wrap API calls in try-catch blocks:

```javascript
try {
    const response = await API.bills.getAll();
    if (response.success) {
        // Handle success
        console.log('Data:', response.data);
    }
} catch (error) {
    // Handle error
    if (error.status === 401) {
        // Unauthorized - redirect to login
        alert('Session expired. Please login again.');
        logout();
    } else if (error.status === 403) {
        // Forbidden
        alert('You do not have permission to perform this action.');
    } else {
        // Other errors
        alert('An error occurred: ' + error.message);
    }
}
```

## CORS Configuration

If you encounter CORS errors, make sure:

1. **Backend** - The `.env` file has the correct frontend URL:
```env
CORS_ORIGIN=http://localhost:8080
```

2. **Frontend** - The API client points to the correct backend URL:
```javascript
// In js/api-client.js
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    // ...
};
```

## Testing Checklist

- [ ] Backend server starts successfully
- [ ] Frontend loads without errors
- [ ] Can login with demo credentials
- [ ] Dashboard loads user data
- [ ] Can view bills
- [ ] Can process payments (all 5 methods)
- [ ] Can create service requests
- [ ] Can view notifications
- [ ] Can download statements
- [ ] Can logout and login again

## Production Deployment

### Backend

1. Set production environment variables:
```env
NODE_ENV=production
JWT_SECRET=your-strong-secret-key
DATABASE_URL=your-database-url
```

2. Deploy to hosting service (Heroku, DigitalOcean, AWS, etc.)

3. Update CORS settings to allow production frontend domain

### Frontend

1. Update API client base URL to production backend:
```javascript
const API_CONFIG = {
    baseURL: 'https://api.okahandja.gov.na/api',
    // ...
};
```

2. Deploy to static hosting (Netlify, Vercel, GitHub Pages, etc.)

## Troubleshooting

### Issue: "Failed to fetch"
- **Cause**: Backend server not running or wrong URL
- **Solution**: Verify backend is running on http://localhost:3000

### Issue: "401 Unauthorized"
- **Cause**: Token expired or invalid
- **Solution**: Login again to get new token

### Issue: "CORS Error"
- **Cause**: Backend not configured to accept requests from frontend
- **Solution**: Check CORS_ORIGIN in backend .env file

### Issue: Payment not processing
- **Cause**: Mock payment gateways not fully implemented
- **Solution**: Check backend console for errors, verify payment data format

## Next Steps

1. **Database Integration** - Replace mock data with real database
2. **Real Payment Gateways** - Integrate with actual payment APIs
3. **Email Notifications** - Set up SMTP for email notifications
4. **SMS Integration** - Add SMS notifications
5. **File Uploads** - Enable file attachments for service requests
6. **Testing** - Add automated tests
7. **Security Hardening** - Implement additional security measures

## Support

For questions or issues:
- Backend API: See `backend/README.md`
- API Client: See `js/api-client.js` documentation
- General: Contact support@okahandja.gov.na
