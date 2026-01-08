# Okahandja Municipality API Backend

Complete REST API backend for the Okahandja Municipality Portal with payment gateway integration.

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Bill Management** - Create, read, update bills for water, electricity, property rates, refuse collection
- **Payment Processing** - Integration with 5 payment gateways (Nam Post, Bank Transfer, Card, Mobile Money, Cash)
- **Account Statements** - Generate and download monthly/annual statements
- **Service Requests** - Submit and track service requests (water leaks, streetlights, etc.)
- **Notifications** - User notifications with preferences management
- **Reports & Analytics** - Comprehensive reporting for users and admins
- **Settings Management** - User preferences and system configuration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your environment variables:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here-change-in-production
```

### 3. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 4. Test the API

Visit `http://localhost:3000` to see the API information and available endpoints.

Health check: `http://localhost:3000/api/health`

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Demo Users

```javascript
// Customer Account
{
  accountNumber: "12345678",
  password: "password123" // (any password works in demo mode)
}

// Admin Account
{
  accountNumber: "ADMIN001",
  password: "admin123" // (any password works in demo mode)
}
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| POST | `/logout` | User logout | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |
| GET | `/me` | Get current user | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/change-password` | Change password | Yes |
| GET | `/account-summary` | Get account summary | Yes |
| GET | `/` | Get all users | Admin |
| GET | `/:id` | Get user by ID | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |

### Bills (`/api/bills`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user bills | Yes |
| GET | `/:id` | Get bill details | Yes |
| GET | `/service/:serviceName` | Get bills by service | Yes |
| GET | `/outstanding/summary` | Get outstanding summary | Yes |
| GET | `/history/all` | Get billing history | Yes |
| POST | `/` | Create bill | Staff |
| PUT | `/:id` | Update bill | Staff |
| DELETE | `/:id` | Delete bill | Staff |

### Payments (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/process` | Process payment | Yes |
| GET | `/history` | Get payment history | Yes |
| GET | `/:id` | Get payment details | Yes |
| POST | `/verify` | Verify payment status | Yes |
| GET | `/methods/available` | Get payment methods | No |
| GET | `/receipts/:reference` | Get receipt | Yes |
| GET | `/` | Get all payments | Staff |

### Statements (`/api/statements`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get statements | Yes |
| GET | `/:id` | Get statement details | Yes |
| GET | `/:id/download` | Download statement PDF | Yes |
| GET | `/year/:year` | Get yearly statements | Yes |
| GET | `/summary/annual` | Get annual summary | Yes |
| POST | `/email` | Email statement | Yes |
| POST | `/generate` | Generate statement | Staff |

### Service Requests (`/api/service-requests`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get service requests | Yes |
| GET | `/:id` | Get request details | Yes |
| POST | `/` | Create request | Yes |
| PUT | `/:id` | Update request | Yes |
| DELETE | `/:id` | Cancel request | Yes |
| POST | `/:id/comment` | Add comment | Yes |
| GET | `/categories/list` | Get categories | No |
| PUT | `/:id/status` | Update status | Staff |
| PUT | `/:id/assign` | Assign request | Staff |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | Yes |
| GET | `/:id` | Get notification | Yes |
| PUT | `/:id/read` | Mark as read | Yes |
| PUT | `/read-all` | Mark all as read | Yes |
| DELETE | `/:id` | Delete notification | Yes |
| GET | `/preferences/settings` | Get preferences | Yes |
| PUT | `/preferences/settings` | Update preferences | Yes |
| POST | `/send` | Send notification | Staff |

### Reports (`/api/reports`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user-summary` | User summary report | Yes |
| GET | `/billing-history` | Billing history | Yes |
| GET | `/payment-history` | Payment history | Yes |
| GET | `/consumption` | Consumption analysis | Yes |
| POST | `/export` | Export report | Yes |
| GET | `/analytics/dashboard` | Analytics dashboard | Staff |
| GET | `/financial/summary` | Financial summary | Admin |

### Settings (`/api/settings`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user` | Get user settings | Yes |
| PUT | `/user` | Update user settings | Yes |
| GET | `/system` | Get system settings | Admin |
| PUT | `/system` | Update system settings | Admin |
| GET | `/tariffs` | Get tariffs | Admin |
| PUT | `/tariffs` | Update tariffs | Admin |
| GET | `/faqs` | Get FAQs | No |
| POST | `/faqs` | Add FAQ | Admin |

## Request/Response Examples

### Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "12345678",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "accountNumber": "12345678",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    }
  }
}
```

### Process Payment

**Request:**
```bash
curl -X POST http://localhost:3000/api/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "billId": 1,
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

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": 1702195200000,
    "accountNumber": "12345678",
    "service": "Water",
    "amount": 1245.00,
    "paymentMethod": "card",
    "reference": "CARD-1702195200000",
    "status": "success",
    "createdAt": "2024-12-14T10:30:00.000Z"
  }
}
```

### Get Bills

**Request:**
```bash
curl http://localhost:3000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bills": [
      {
        "id": 1,
        "service": "Water",
        "amount": 1245.00,
        "dueDate": "2025-01-15",
        "status": "Outstanding"
      }
    ],
    "summary": {
      "totalOutstanding": 4853.50,
      "totalBills": 4
    }
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400,
    "details": []
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Payment Gateway Integration

The API supports 5 payment methods:

1. **Nam Post Mobile Money** - Instant processing
2. **Bank Transfer** - 1-2 business days processing
3. **Debit/Credit Card** - Instant processing (2.5% fee)
4. **Mobile Money** (MTC, TN Mobile) - Instant processing (N$ 3 fee)
5. **Cash** - Pay at office, generates payment slip

### Payment Flow

1. Client calls `/api/payments/process` with payment details
2. Server validates payment information
3. Server processes payment through respective gateway
4. Server returns payment reference and status
5. Client can verify payment using `/api/payments/verify`
6. Receipt available at `/api/payments/receipts/:reference`

## Database Integration

Currently, the API uses in-memory mock data. To integrate with a database:

1. Install database driver (e.g., `mysql2`, `pg`, `mongodb`)
2. Create database schema
3. Replace mock data with database queries in route files
4. Look for comments: `// Mock data - replace with database query`

## Security

- JWT tokens expire after 24 hours
- Rate limiting: 100 requests per 15 minutes per IP
- Helmet.js for security headers
- CORS enabled for specified origins
- Password hashing with bcrypt (when implemented)
- Input validation on all endpoints

## Next Steps

1. **Add Database** - Replace mock data with MySQL/PostgreSQL
2. **Implement Real Payment Gateways** - Integrate actual payment APIs
3. **Email Service** - Add nodemailer for email notifications
4. **SMS Service** - Add SMS notifications
5. **File Upload** - Implement file upload for service requests
6. **Testing** - Add unit and integration tests
7. **API Documentation** - Generate Swagger/OpenAPI docs
8. **Logging** - Implement proper logging with Winston
9. **Monitoring** - Add APM and error tracking

## Support

For issues or questions, contact: support@okahandja.gov.na

## License

© 2024 Okahandja Municipality. All rights reserved.
