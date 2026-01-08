# Official Municipal Statements

This document explains how to use the official statement generation feature that matches the Municipality of Okahandja format.

## Overview

The official statement generator creates PDF documents that match the exact format used by the Municipality of Okahandja, including:

- **Tax Invoice/Statement Header** with municipality branding
- **Account Information** with all property details
- **Meter Readings** for water and electricity
- **Account Details** with itemized charges (land tax, building tax, fire brigade levy, etc.)
- **Aging Buckets** (120+ days, 90 days, 60 days, 30 days, current)
- **Remittance Advice** section
- **Banking Details** for payments
- **Warning Banner** for overdue accounts

## Features

### 1. Official Statement Format

The generated statements include:

- **Property Information**:
  - Account Number
  - Consumer Name
  - Postal Address
  - ERF Description
  - Land Area & Value
  - Building Value
  - Street Address

- **Tax Calculations**:
  - Residential Land Tax (calculated from land value)
  - Residential Building Tax (calculated from building value)
  - Fire Brigade Levy
  - Interest on overdue amounts

- **Service Charges**:
  - Water consumption with meter readings
  - Electricity consumption with meter readings
  - Refuse collection fees

- **Payment Information**:
  - Aging summary (120+, 90, 60, 30 days, current)
  - Opening balance
  - Closing balance
  - Due date
  - Banking details for payment

## How to Use

### Frontend Usage

#### 1. Download Official Statement

```javascript
// From the statement modal
downloadOfficialStatement('0010016773');
```

The statement will be generated as a PDF and automatically downloaded.

#### 2. Email Official Statement

```javascript
// Send statement via email
emailOfficialStatement('0010016773', 'customer@example.com');
```

#### 3. Print Official Statement

```javascript
// Open statement in print dialog
printOfficialStatement('0010016773');
```

### Backend API Endpoints

#### Get Official Statement Data

```http
GET /api/statements/:id/official
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountNumber": "0010016773",
    "consumerName": "WAKALENDA JOSEPH N",
    "postalAddress": "P.O. BOX 286\nOKAHANDJA",
    "postalCode": "9000",
    "accountDate": "18 DEC 2025",
    "taxInvoiceNo": "0010016773202512",
    "erfDescription": "0106 000004164 000000 0000",
    "landArea": 450.0000,
    "landValue": 248000.00,
    "buildingValue": 0.00,
    "meterReadings": [...],
    "accountDetails": [...],
    "aging": {
      "days120Plus": 0.00,
      "days90": 0.00,
      "days60": 0.00,
      "days30": 126.52,
      "current": 209.28
    },
    "closingBalance": 335.80,
    "dueDate": "15/01/2026",
    "bankingDetails": {
      "bankName": "Bank Windhoek",
      "accountName": "Municipality Of Okahandja",
      "accountNumber": "1070769806",
      "branchCode": "482773"
    }
  }
}
```

#### Generate Official Statement (Server-side)

```http
POST /api/statements/official/generate
Authorization: Bearer <token>
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

## Statement Components

### 1. Warning Banner

Red banner at the top warning about service discontinuation if payment is not made by the due date.

### 2. Municipality Header

Includes:
- Municipality name
- Contact information (phone, fax, email, website)
- VAT registration number

### 3. Account Information Grid

Two-column layout with:
- **Left Column**: Account number, consumer name, postal address, deposit, internet PIN
- **Right Column**: Account date, tax invoice number, VAT reg no., ERF description, building value, street, land area, land value

### 4. Meter Readings Table

Table showing:
- Meter Number
- Meter Type
- Old Reading
- New Reading
- Consumption
- Levied Amount
- Reading Dates

### 5. Account Details Table

Itemized list of charges:
- Opening balance
- Interest charges (if applicable)
- Residential land tax (land value × tariff)
- Residential building tax (building value × tariff)
- Fire brigade levy
- Water consumption charges
- Electricity consumption charges
- Refuse collection fees

### 6. Aging Summary

Shows outstanding amounts by age:
- 120+ days overdue
- 90 days overdue
- 60 days overdue
- 30 days overdue
- Current charges
- **Closing Balance** (total amount due)

### 7. Remittance Advice

Payment slip section with:
- Account number
- Consumer name
- Total due
- Due date

### 8. Banking Details

Payment information:
- Bank name: Bank Windhoek
- Account name: Municipality Of Okahandja
- Account number: 1070769806
- Branch code: 482773
- Reference: Account number

## Customization

### Update Statement Data

To customize the statement data for a specific account, modify the `getSampleStatementData()` function in [official-statement.js](js/official-statement.js):

```javascript
function getSampleStatementData(accountNumber) {
    return {
        accountNumber: accountNumber,
        consumerName: 'YOUR NAME HERE',
        postalAddress: 'YOUR ADDRESS HERE',
        // ... other fields
    };
}
```

### Add Custom Charges

To add new charge types, update the `accountDetails` array:

```javascript
accountDetails: [
    {
        date: '18/12/2025',
        code: '040101',
        description: 'SEWERAGE CHARGES',
        units: 1.000,
        tariff: 250.000000,
        value: 250.00
    }
    // ... other charges
]
```

### Modify Tax Rates

Update the tariff values in the account details:

```javascript
{
    code: '050101',
    description: 'RESIDENTIAL LAND TAX',
    units: 248000.000,
    tariff: 0.009770,  // Change this rate
    value: landValue * tariff
}
```

## UI Integration

### Statement Modal

When users view a statement, they will see three action buttons:

1. **Download PDF** - Standard statement format
2. **Official Statement** - Municipality format (green button)
3. **Print Statement** - Print preview

### Dashboard Integration

Add quick access buttons on the dashboard:

```html
<button onclick="downloadOfficialStatement('<?= $accountNumber ?>')">
    Download Official Statement
</button>
```

## Production Implementation

For production deployment:

### 1. Server-side PDF Generation

Install a PDF library like PDFKit or Puppeteer:

```bash
npm install pdfkit
# or
npm install puppeteer
```

### 2. Database Integration

Replace mock data with actual database queries:

```javascript
router.get('/:id/official', authenticateToken, async (req, res) => {
    const account = await Account.findOne({
        accountNumber: req.user.accountNumber
    });

    const charges = await Charge.find({
        accountNumber: account.accountNumber,
        period: req.params.id
    });

    // Generate statement data from database records
    const statementData = generateStatementData(account, charges);

    res.json({ success: true, data: statementData });
});
```

### 3. Email Service Integration

Set up email sending with SendGrid, Mailgun, or AWS SES:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function emailStatement(accountNumber, email, pdfBuffer) {
    const msg = {
        to: email,
        from: 'billing@okahandja.org.na',
        subject: `Municipal Statement - ${accountNumber}`,
        text: 'Please find your municipal statement attached.',
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

### 4. Cloud Storage

Store generated PDFs in cloud storage:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

async function uploadStatementToS3(accountNumber, pdfBuffer) {
    const key = `statements/${accountNumber}/${Date.now()}.pdf`;

    await s3.putObject({
        Bucket: 'okahandja-statements',
        Key: key,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
        ACL: 'private'
    }).promise();

    // Generate signed URL for download
    return s3.getSignedUrl('getObject', {
        Bucket: 'okahandja-statements',
        Key: key,
        Expires: 3600 // 1 hour
    });
}
```

## Testing

### Test Statement Generation

```javascript
// Test with sample data
const testData = getSampleStatementData('TEST001');
const doc = generateOfficialStatement(testData);
doc.save('test_statement.pdf');
```

### Verify Calculations

Ensure all calculations are correct:

```javascript
// Land tax calculation
const landTax = landValue * 0.009770;
console.assert(landTax === 2421.76, 'Land tax calculation error');

// Building tax calculation
const buildingTax = buildingValue * 0.002670;
console.assert(buildingTax === 0, 'Building tax calculation error');
```

## Troubleshooting

### PDF Not Generating

Check that jsPDF is loaded:
```javascript
if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF library not loaded');
}
```

### Incorrect Calculations

Verify tariff rates match municipal regulations:
- Residential land tax: 0.009770 (0.977%)
- Residential building tax: 0.002670 (0.267%)
- Fire brigade levy: N$6.37 flat rate

### Layout Issues

Adjust positioning in `generateOfficialStatement()`:
```javascript
let yPos = margin;  // Start position
yPos += 10;  // Add spacing
```

## Support

For issues or questions:
- Email: support@okahandja.org.na
- Phone: +264 62 505100
- Website: www.okahandja.org.na

## License

© 2025 Municipality Of Okahandja. All rights reserved.
