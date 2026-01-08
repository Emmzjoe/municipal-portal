# Statement Generation Guide

## Quick Start

Your Okahandja Municipal App now includes official statement generation that matches the exact format used by the Municipality of Okahandja.

### Features Added

1. **Official Tax Invoice/Statement** - Matches the PDF format exactly
2. **Consolidated Statement** - All services in one document
3. **Property Tax Calculations** - Land tax, building tax, fire brigade levy
4. **Aging Buckets** - Track overdue amounts (120+, 90, 60, 30 days, current)
5. **Banking Details** - Payment information for Bank Windhoek
6. **Meter Readings** - Water and electricity consumption tracking

## How to Use

### For Residents

#### View Statements

1. **Login** to your account
2. Navigate to the **Dashboard**
3. Click on any service card (Water, Electricity, Property Rates, Refuse, or Consolidated)
4. The statement modal will open

#### Download Official Statement

In the statement modal, you'll see three download buttons:

1. **📥 Download PDF** - Standard simplified format
2. **📄 Official Statement** - Official municipality format (Green button)
3. **🖨️ Print Statement** - Print preview

Click **"📄 Official Statement"** to download the official tax invoice format.

#### Consolidated Statement

To get a single statement for all services:

1. Click on the **"Consolidated"** statement card
2. Click **"📄 Official Consolidated"**
3. A PDF with all services will be downloaded

### For Administrators

#### Generate Statements for Users

You can generate official statements programmatically:

```javascript
// Generate official statement
downloadOfficialStatement('0010016773');

// Generate consolidated statement
generateConsolidatedStatement('0010016773');

// Email statement
emailOfficialStatement('0010016773', 'customer@example.com');
```

## Statement Components

### Official Statement Includes:

**Header Section:**
- Warning banner about service discontinuation
- Municipality contact information
- VAT registration number

**Account Information:**
- Account Number: `0010016773`
- Consumer Name: `WAKALENDA JOSEPH N`
- Postal Address: `P.O. BOX 286, OKAHANDJA`
- ERF Description: Property identifier
- Land Area: `450.0000 m²`
- Land Value: `N$ 248,000.00`
- Building Value: `N$ 0.00`

**Meter Readings:**
- Meter number
- Old and new readings
- Consumption
- Levied amount
- Reading dates

**Account Details:**
- Opening Balance
- Interest charges (if applicable)
- Residential Land Tax (Land Value × 0.009770)
- Residential Building Tax (Building Value × 0.002670)
- Fire Brigade Levy (N$ 6.37 flat rate)
- Water consumption charges
- Electricity consumption charges
- Refuse collection fees

**Aging Summary:**
- 120+ days overdue: `N$ 0.00`
- 90 days overdue: `N$ 0.00`
- 60 days overdue: `N$ 0.00`
- 30 days overdue: `N$ 126.52`
- Current charges: `N$ 209.28`
- **Closing Balance: `N$ 335.80`**

**Payment Information:**
- Bank: Bank Windhoek
- Account Name: Municipality Of Okahandja
- Account Number: 1070769806
- Branch Code: 482773
- Reference: Your account number
- Due Date: 15 days from statement date

## Customization

### Update Account Data

To customize the statement for different accounts, modify the data in [js/official-statement.js](js/official-statement.js):

```javascript
function getSampleStatementData(accountNumber) {
    return {
        accountNumber: accountNumber || '0010016773',
        consumerName: 'YOUR NAME',
        postalAddress: 'YOUR ADDRESS',
        landValue: 248000.00,
        buildingValue: 0.00,
        landArea: 450.0000,
        // ... other fields
    };
}
```

### Tax Rate Configuration

Update tax rates in the `accountDetails` array:

```javascript
{
    code: '050101',
    description: 'RESIDENTIAL LAND TAX',
    units: 248000.000,
    tariff: 0.009770,  // 0.977% tax rate
    value: 201.91
}
```

Current tax rates:
- **Residential Land Tax**: 0.009770 (0.977%)
- **Residential Building Tax**: 0.002670 (0.267%)
- **Fire Brigade Levy**: N$ 6.37 flat rate

### Add New Charge Types

To add additional charges:

```javascript
accountDetails: [
    // Existing charges...
    {
        date: '18/12/2025',
        code: '040101',
        description: 'SEWERAGE CHARGES',
        units: 1.000,
        tariff: 250.000000,
        value: 250.00
    }
]
```

## API Integration

### Backend Endpoints

#### Get Official Statement Data

```http
GET /api/statements/:id/official
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "0010016773",
    "consumerName": "WAKALENDA JOSEPH N",
    "closingBalance": 335.80,
    "dueDate": "15/01/2026",
    "accountDetails": [...],
    "aging": {...},
    "bankingDetails": {...}
  }
}
```

#### Generate Statement PDF (Server-side)

```http
POST /api/statements/official/generate
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "accountNumber": "0010016773",
  "period": "2025-12"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Official statement generated",
  "data": {
    "downloadUrl": "/api/statements/official/download/0010016773/2025-12",
    "expiresAt": "2025-12-24T15:30:00.000Z"
  }
}
```

## Testing

### Test with Demo Account

The app includes a demo account for testing:

**Account Number:** `12345678`
**Password:** `password123`

1. Login with demo credentials
2. Navigate to statements
3. Download official statement
4. Verify all calculations match expected values

### Verify Calculations

Check that calculations are correct:

**Land Tax Example:**
- Land Value: N$ 248,000.00
- Tax Rate: 0.009770
- Tax Amount: 248,000 × 0.009770 = **N$ 2,422.96**

**Fire Brigade Levy:**
- Flat rate: **N$ 6.37** per property

## Production Deployment

### Environment Variables

Set these in your `.env` file:

```bash
# Email Service
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=billing@okahandja.org.na

# Cloud Storage
AWS_S3_BUCKET=okahandja-statements
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Database
DATABASE_URL=your_database_url
```

### Email Integration

Install SendGrid:

```bash
npm install @sendgrid/mail
```

Configure email service in [backend/routes/statements.js](backend/routes/statements.js):

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendStatementEmail(email, pdfBuffer, accountNumber) {
    const msg = {
        to: email,
        from: 'billing@okahandja.org.na',
        subject: `Municipal Statement - ${accountNumber}`,
        text: 'Please find your municipal statement attached.',
        html: `
            <h2>Municipal Statement</h2>
            <p>Dear Valued Customer,</p>
            <p>Please find your municipal statement attached.</p>
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            <p>You can also pay online at: www.okahandja.org.na</p>
        `,
        attachments: [{
            content: pdfBuffer.toString('base64'),
            filename: `statement_${accountNumber}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
        }]
    };

    await sgMail.send(msg);
}
```

### Database Integration

Create database schema for statements:

```sql
CREATE TABLE statements (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    period DATE NOT NULL,
    opening_balance DECIMAL(10, 2) DEFAULT 0,
    closing_balance DECIMAL(10, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    UNIQUE(account_number, period)
);

CREATE TABLE statement_items (
    id SERIAL PRIMARY KEY,
    statement_id INTEGER REFERENCES statements(id),
    item_date DATE,
    code VARCHAR(20),
    description TEXT,
    units DECIMAL(10, 3),
    tariff DECIMAL(10, 6),
    value DECIMAL(10, 2)
);

CREATE TABLE meter_readings (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    meter_number VARCHAR(50),
    meter_type VARCHAR(20),
    reading_date DATE,
    reading_value INTEGER,
    consumption INTEGER
);
```

## Troubleshooting

### Issue: PDF Not Generating

**Solution:** Check that jsPDF is loaded
```javascript
if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF library not loaded');
    // Load from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
}
```

### Issue: Incorrect Tax Calculations

**Solution:** Verify tariff rates
```javascript
// Residential Land Tax
const landTax = landValue * 0.009770;

// Residential Building Tax
const buildingTax = buildingValue * 0.002670;

// Fire Brigade Levy
const fireBrigadeLevy = 6.37; // flat rate
```

### Issue: Missing Banking Details

**Solution:** Check banking details object
```javascript
bankingDetails: {
    bankName: 'Bank Windhoek',
    accountName: 'Municipality Of Okahandja',
    accountNumber: '1070769806',
    branchCode: '482773',
    reference: accountNumber
}
```

## Support

For technical support:

**Email:** support@okahandja.org.na
**Phone:** +264 62 505100
**Website:** www.okahandja.org.na

## Files Added

The following files were created for this feature:

1. [js/official-statement.js](js/official-statement.js) - Official statement generator
2. [js/consolidated-statement.js](js/consolidated-statement.js) - Consolidated statement generator
3. [OFFICIAL_STATEMENTS.md](OFFICIAL_STATEMENTS.md) - Detailed technical documentation
4. [STATEMENT_GENERATION_GUIDE.md](STATEMENT_GENERATION_GUIDE.md) - This user guide

## Next Steps

1. **Test the feature** with demo account
2. **Customize account data** for your properties
3. **Configure email service** for statement delivery
4. **Set up database** for production data
5. **Deploy to production** server

Enjoy your new official statement generation feature!
