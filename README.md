# 🏛️ Okahandja Municipality Portal

A comprehensive, modern web application for Okahandja municipality residents and administrators to manage municipal services, bills, payments, and more.

## ✨ Latest Updates

### 🎉 NEW FEATURES ADDED!

**MySQL Database Integration:**
- 🗄️ **Full Database Support**: MySQL/MariaDB integration with complete schema
- 📝 **User Registration**: New account creation with email verification
- 🔐 **Secure Authentication**: Bcrypt password hashing and JWT tokens
- 📊 **Data Persistence**: All user data, bills, payments stored in database
- 🔍 **Activity Logging**: Complete audit trail of all system actions
- 🛡️ **Production Ready**: Optimized queries, indexes, and relationships

**Backend API Integration:**
- 🚀 **Complete REST API**: 80+ endpoints for all features
- 🔐 **JWT Authentication**: Secure token-based authentication
- 💳 **Payment Gateway API**: Integration with 5 payment methods
- 📊 **Real-time Data**: Connect frontend to live backend data
- 🔒 **Security Middleware**: Rate limiting, CORS, helmet protection
- 📝 **API Client Library**: Easy-to-use JavaScript API wrapper
- 🌐 **Production Ready**: Deployable backend infrastructure

**Payment Gateway Integration:**
- 💰 **Nam Post Mobile Money**: Instant mobile payment processing
- 🏦 **Bank Transfer**: FNB, Bank Windhoek, Standard Bank, Nedbank
- 💳 **Card Payments**: Visa, Mastercard with secure processing
- 📱 **Mobile Money**: MTC Mobile Money, TN Mobile integration
- 💵 **Cash Payments**: Generate payment slips for office payments

**Resident Portal Enhancements:**
- 📊 **Usage Analytics Charts**: Visual consumption trends for water and electricity
- 🔔 **Smart Notifications**: Real-time alerts for bills, payments, and usage spikes
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📥 **PDF Receipts**: Auto-generated receipts after payment
- 📋 **Service Requests**: Submit and track maintenance requests
- 💰 **Payment Plans**: Setup flexible installment plans
- 🔐 **Password Reset & 2FA**: Enhanced security features

**Administrator Portal:**
- 🛡️ **Complete Admin Dashboard**: Manage users, bills, and system settings
- 📈 **Revenue Reports**: Track income by service type
- 📝 **Activity Log**: Full audit trail of all system actions
- 📧 **Bulk Operations**: Send reminders to multiple users
- 👥 **User Management**: Add, view, and manage resident accounts
- 📊 **Advanced Analytics**: Real-time statistics and insights

## 🎯 Core Features

### For Residents

#### 🔐 Authentication & Security
- **User Registration**: Create new accounts with email verification
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Role-based Access**: Separate portals for Resident/Staff/Admin
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent login with auto-logout
- **Database Security**: Prepared statements prevent SQL injection

#### 📊 Dashboard & Analytics
- Personalized welcome message with account info
- Total outstanding balance tracker
- **Interactive Charts** (NEW):
  - Water consumption trends
  - Electricity usage patterns
  - Monthly spending overview
- Quick access to all services

#### 💰 Bill Management
- **Four Service Categories**:
  - 💧 Water (with meter readings)
  - ⚡ Electricity (kWh tracking)
  - 🏠 Property Rates (valuation-based)
  - 🗑️ Refuse Collection
- Color-coded status badges (Paid, Overdue, Due Soon)
- Detailed bill breakdowns
- One-click payments with PDF receipts

#### 📄 Statement System
- View statements for last 4 months
- Service-specific and consolidated views
- Detailed charge breakdowns
- Payment history per statement
- Download PDF and Print options

#### 🔔 Smart Notifications (NEW)
- Overdue bill warnings
- High usage alerts (25%+ increase detection)
- Payment confirmations
- Notification center with unread badges
- Auto-mark as read

#### 📋 Service Requests (NEW)
- Submit requests for:
  - Water leaks
  - Meter issues
  - Billing queries
  - Street lights
  - Refuse collection
  - Other issues
- Priority levels (Low, Medium, High, Urgent)
- Request tracking with unique IDs
- Status monitoring

#### 💰 Payment Plans (NEW)
- Flexible installment options (3, 4, 6, 12 months)
- Auto-calculated monthly payments
- Visual progress tracking
- Next payment reminders

#### 📥 PDF Receipt Generation (NEW)
- Professional receipts with branding
- Auto-download after payment
- Include all transaction details

### For Administrators

#### 🛡️ Admin Dashboard
- **Key Statistics**:
  - Total users count
  - Total revenue
  - Outstanding bills
  - Monthly payments
- Real-time calculations

#### 👥 User Management
- View all resident accounts
- Search by account number or name
- Add new users via modal form
- View detailed user information
- Track outstanding balances per user

#### 💵 Bill Management
- Comprehensive bill overview
- Filter by service type and status
- Mark bills as paid
- **Bulk Operations** (NEW):
  - Send payment reminders to all overdue accounts
  - Export data to CSV/Excel
- Real-time updates

#### 📊 Reports & Analytics
- Revenue breakdown by service
- Period selector (Month, Quarter, Year)
- Recent transactions table
- Payment reference tracking

#### 📝 Activity Log & Audit Trail (NEW)
- Complete system activity tracking
- User logins, bill updates, payments
- Date range filtering
- IP address logging
- User attribution

#### ⚙️ System Settings
- Configure service rates (Water, Electricity, Rates, Refuse)
- Notification settings
- Email reminder controls

## 🎨 UI/UX Features

- 🌙 **Dark Mode**: Toggle for comfortable viewing
- 📱 **Fully Responsive**: Works on all devices
- 🎨 **Modern Design**: Orange/brown gradient theme
- ⚡ **Smooth Animations**: Polished interactions
- 🎯 **Intuitive Navigation**: Easy to use interface

## 📁 Project Structure

```
okahandja-municipal-app/
├── Frontend
│   ├── index.html              # Main HTML with all screens and modals
│   ├── README.md               # This file - Quick start guide
│   ├── SETUP.md                # Detailed setup instructions
│   ├── INTEGRATION_GUIDE.md    # Frontend-backend integration guide
│   ├── css/
│   │   └── styles.css          # All CSS styles (1700+ lines)
│   └── js/
│       ├── api-client.js       # Backend API integration (NEW)
│       ├── data.js             # User data and statement data
│       ├── auth.js             # Authentication logic
│       ├── statements.js       # Statement viewing functionality
│       ├── app.js              # General app functionality & payments
│       ├── admin.js            # Admin dashboard functionality
│       ├── payments.js         # Payment gateway integration (NEW)
│       └── features.js         # Charts, notifications, service requests
│
└── Backend API (NEW)
    ├── server.js               # Express server
    ├── package.json            # Dependencies
    ├── .env.example            # Environment template
    ├── README.md               # API documentation
    ├── middleware/
    │   └── auth.js             # JWT authentication
    └── routes/
        ├── auth.js             # Authentication endpoints
        ├── users.js            # User management
        ├── bills.js            # Bill management
        ├── payments.js         # Payment processing
        ├── statements.js       # Statement generation
        ├── serviceRequests.js  # Service request handling
        ├── notifications.js    # Notification management
        ├── reports.js          # Reports & analytics
        └── settings.js         # Settings management
```

## Getting Started

### Prerequisites
- **MySQL** (v5.7+) or **MariaDB** (v10.2+) - [Download MySQL](https://dev.mysql.com/downloads/mysql/)
- **Node.js** (v14 or higher) for backend - [Download here](https://nodejs.org/)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A code editor (VS Code recommended, optional)

### Quick Start (10 Minutes)

#### 1. Setup MySQL Database

```bash
# Install MySQL (if not installed)
# macOS: brew install mysql
# Ubuntu: sudo apt install mysql-server

# Run automated setup script
./setup-database.sh
```

Or manually:
```bash
# Start MySQL
mysql -u root -p

# Import schema
mysql -u root -p okahandja_municipal < backend/database/schema.sql
```

**See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed instructions**

#### 2. Start the Backend API

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Configure database credentials in .env
cp .env.example .env
nano .env  # Update DB_PASSWORD

# Start the server
npm run dev
```

**Backend will run on:** http://localhost:3000

You should see:
```
✅ Database connected successfully
```

#### 3. Start the Frontend

```bash
# In the main project directory (not backend)
cd ..

# Option A: Using Python
python3 -m http.server 8080

# Option B: Using Node.js
npx http-server -p 8080

# Option C: Direct file opening
# Just open index.html in your browser
```

**Frontend will run on:** http://localhost:8080

#### 4. Create Account and Login

1. Open http://localhost:8080 in your browser
2. Click **"Create Account"** to register a new user
3. Fill in your details (account number, email, password, etc.)
4. After registration, you'll be automatically logged in
5. Try the features:
   - View bills and statements
   - Make payments (5 payment methods)
   - Submit service requests
   - Check notifications
   - View usage analytics

**Or login with existing demo credentials (see below)**

### Demo Credentials

**Note:** With MySQL database, only registered users can login. You can either:
1. **Register a new account** using the "Create Account" button
2. **Use the default admin** (created by database schema)

**Default Administrator Account:**
```
Account Number: ADMIN001
Email: admin@okahandja-municipality.na
Password: (Check backend/database/schema.sql for bcrypt hash - or register a new admin)
```

**Creating Your First User:**
1. Click "Create Account" on login screen
2. Fill in all required fields
3. Password must have: 8+ chars, 1 uppercase, 1 lowercase, 1 number
4. After successful registration, you'll be logged in automatically

### 📚 Documentation

- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - MySQL database setup and configuration
- **[SETUP.md](SETUP.md)** - Detailed setup and configuration guide
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Frontend-backend integration tutorial
- **[backend/README.md](backend/README.md)** - Complete API documentation

## Customization Guide

### Adding New Users

Edit `js/data.js` to add more user accounts:

```javascript
const users = {
    '12345678': {
        password: 'demo123',
        name: 'John Doe',
        firstName: 'John',
        address: '123 Main Street, Okahandja',
        propertyType: 'Residential'
    },
    '87654321': {  // Add new user
        password: 'password456',
        name: 'Jane Smith',
        firstName: 'Jane',
        address: '456 Oak Avenue, Okahandja',
        propertyType: 'Commercial'
    }
};
```

### Modifying Bill Amounts

Update bill amounts in `index.html` by editing the bill card sections. The total is automatically calculated in `js/app.js`.

### Changing Color Scheme

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --primary: #d35400;        /* Main brand color */
    --primary-dark: #a04000;   /* Darker shade */
    --secondary: #2c5f2d;      /* Secondary color */
    --accent: #e67e22;         /* Accent color */
    /* ... other variables ... */
}
```

### Adding Statement Data

To add more statement periods, edit `js/data.js` and add new period objects under each service:

```javascript
'Water': {
    icon: '💧',
    periods: {
        'current': { /* ... */ },
        'nov2025': { /* ... */ },
        // Add new period
        'aug2025': {
            period: 'August 2025',
            accountNumber: '12345678',
            // ... rest of the data
        }
    }
}
```

## Backend API Integration

The application now includes a complete backend API! Here's how to use it:

### Using the API Client

The `js/api-client.js` library makes it easy to interact with the backend:

```javascript
// Login
const response = await API.auth.login('12345678', 'password123', true);
if (response.success) {
    console.log('Logged in!', response.data.user);
}

// Get bills
const bills = await API.bills.getAll();
console.log('Bills:', bills.data.bills);

// Process payment
const payment = await API.payments.process({
    service: 'Water',
    amount: 1245.00,
    paymentMethod: 'card',
    paymentDetails: {
        cardNumber: '4111111111111111',
        cardName: 'John Doe',
        cardExpiry: '12/25',
        cardCVV: '123'
    }
});
console.log('Payment reference:', payment.data.reference);

// Create service request
const request = await API.serviceRequests.create({
    type: 'Water Leak',
    category: 'Water',
    description: 'Water leak on main road',
    location: '123 Main Street, Okahandja'
});
console.log('Request ID:', request.data.id);

// Get notifications
const notifications = await API.notifications.getAll(1, 20, true);
console.log('Unread notifications:', notifications.data.summary.unreadCount);
```

### API Endpoints

The backend provides **80+ REST API endpoints** across 9 modules:

- **`/api/auth`** - Authentication (login, register, password reset)
- **`/api/users`** - User management and profiles
- **`/api/bills`** - Bill CRUD operations
- **`/api/payments`** - Payment processing (5 payment methods)
- **`/api/statements`** - Statement generation and downloads
- **`/api/service-requests`** - Service request management
- **`/api/notifications`** - Notification delivery and preferences
- **`/api/reports`** - Reports and analytics
- **`/api/settings`** - System configuration and tariffs

**Complete API documentation:** See [backend/README.md](backend/README.md)

### Payment Gateway Integration

The payment system supports **5 payment methods**:

1. **Nam Post Mobile Money** - Instant, N$ 0 fee
2. **Bank Transfer** - FNB, Bank Windhoek, Standard Bank, Nedbank
3. **Card Payment** - Visa, Mastercard (2.5% fee)
4. **Mobile Money** - MTC, TN Mobile (N$ 3 fee)
5. **Cash at Office** - Generates payment slip

All payment methods are integrated in the backend API and ready to connect to real payment gateways.

## 🔧 Technologies Used

### Frontend
- **HTML5** - Semantic structure and accessibility
- **CSS3** - Modern styling (Grid, Flexbox, Animations, Gradients)
- **JavaScript (ES6+)** - Vanilla JS for all functionality
- **Chart.js 4.4.0** - Interactive data visualizations and analytics
- **jsPDF 2.5.1** - Client-side PDF generation for receipts
- **Google Fonts** - Bebas Neue & Work Sans typography

### Backend
- **Node.js (v14+)** - Runtime environment
- **Express.js** - Web framework
- **JWT (jsonwebtoken)** - Authentication and authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **morgan** - HTTP request logging
- **express-rate-limit** - Rate limiting protection
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1920px and above)
- Laptops (1024px - 1920px)
- Tablets (768px - 1024px)
- Mobile phones (320px - 768px)

## Future Enhancements

Potential improvements for future versions:

1. **Backend Integration**
   - Real-time data from municipal database
   - Secure authentication with JWT
   - Payment gateway integration

2. **Additional Features**
   - Email/SMS notifications for due bills
   - Auto-pay setup
   - Usage analytics and graphs
   - Service request submission
   - Chat support

3. **Enhanced Statements**
   - Actual PDF generation
   - Email delivery
   - Multi-year archive

4. **Mobile App**
   - Native iOS and Android apps
   - Push notifications
   - Offline mode

## Security Considerations

For production deployment:

1. **Use HTTPS** - Always serve over secure connection
2. **Implement proper authentication** - Use secure tokens (JWT)
3. **Validate all inputs** - Prevent injection attacks
4. **Hash passwords** - Never store plain text passwords
5. **Rate limiting** - Prevent brute force attacks
6. **Session management** - Implement secure session handling
7. **CORS policies** - Configure proper cross-origin policies

## Support

For questions or issues:
- Email: support@okahandja-municipality.na
- Phone: +264 62 503 XXX
- Office: Okahandja Municipality, Main Street

## License

© 2025 Okahandja Municipality. All rights reserved.

## Contributing

This is a municipal project. For contributions or suggestions, please contact the IT department at Okahandja Municipality.

---

**Built with ❤️ for the residents of Okahandja**
