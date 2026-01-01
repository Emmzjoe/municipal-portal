/* ===================================
   OFFICIAL STATEMENT GENERATOR
   Generates statements matching Okahandja Municipality format
   =================================== */

/**
 * Generate official PDF statement matching municipal format
 */
function generateOfficialStatement(accountData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Page margins
    const margin = 15;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - (margin * 2);

    let yPos = margin;

    // Header - Warning Banner
    doc.setFillColor(255, 0, 0);
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('IF THIS ACCOUNT IS NOT PAID BY THE DUE DATE SERVICES WILL BE DISCONTINUED WITHOUT ANY FURTHER NOTICE.', pageWidth / 2, 5, { align: 'center' });

    yPos = 15;

    // Municipality Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Municipality Of Okahandja', pageWidth / 2, yPos, { align: 'center' });

    yPos += 6;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('PO Box 15 Okahandja Namibia', pageWidth / 2, yPos, { align: 'center' });

    yPos += 4;
    doc.text('Tel: +264 62 505100 / Fax: +264 62 501746', pageWidth / 2, yPos, { align: 'center' });

    yPos += 4;
    doc.text('Email: info@okahandja.org.na', pageWidth / 2, yPos, { align: 'center' });

    yPos += 4;
    doc.text('Website: www.okahandja.org.na', pageWidth / 2, yPos, { align: 'center' });

    yPos += 4;
    doc.text('VAT No.:0599055015', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    // TAX INVOICE / STATEMENT Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE / STATEMENT', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    // Account Information Grid
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.accountNumber, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Account Date:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.accountDate, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Consumer Name:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.consumerName, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Tax Invoice No.:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.taxInvoiceNo, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Postal Address:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.postalAddress, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Vat Registration No.:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.vatRegNo || '', rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.postalCode, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('ERF Description:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.erfDescription, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Deposit:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.deposit.toFixed(2), leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Building Value:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.buildingValue.toFixed(2), rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Internet PIN:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.internetPin, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Street:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.street, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Land Area:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountData.landArea.toFixed(4), rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Land Value:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(accountData.landValue), rightColX + 25, yPos);

    yPos += 10;

    // Meter Readings Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('METER READINGS', margin, yPos);

    yPos += 5;

    // Meter readings table
    drawTable(doc, margin, yPos, contentWidth, [
        { text: 'METER NO.', width: 25 },
        { text: 'METER TYPE', width: 30 },
        { text: 'OLD READING', width: 30 },
        { text: 'NEW READING', width: 30 },
        { text: 'CONSUMPTION', width: 30 },
        { text: 'LEVIED AMOUNT', width: 30 },
        { text: 'READING DATES', width: 25 }
    ], accountData.meterReadings || [], 5);

    yPos += (accountData.meterReadings && accountData.meterReadings.length > 0) ?
            (accountData.meterReadings.length * 5 + 10) : 10;

    // Account Details Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ACCOUNT DETAILS', margin, yPos);

    yPos += 5;

    // Account details table
    const detailsTableY = yPos;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    // Table headers
    const colWidths = [25, 15, 70, 25, 25, 20];
    let xPos = margin;

    doc.rect(margin, yPos, contentWidth, 5);
    doc.text('DATE', xPos + 2, yPos + 3.5);
    xPos += colWidths[0];
    doc.text('CODE', xPos + 2, yPos + 3.5);
    xPos += colWidths[1];
    doc.text('DESCRIPTION', xPos + 2, yPos + 3.5);
    xPos += colWidths[2];
    doc.text('UNITS', xPos + 2, yPos + 3.5);
    xPos += colWidths[3];
    doc.text('TARIFF', xPos + 2, yPos + 3.5);
    xPos += colWidths[4];
    doc.text('VALUE', xPos + 2, yPos + 3.5);

    yPos += 5;

    // Opening Balance
    doc.setFont('helvetica', 'normal');
    xPos = margin;
    doc.text('', xPos + 2, yPos + 3.5);
    xPos += colWidths[0];
    doc.text('', xPos + 2, yPos + 3.5);
    xPos += colWidths[1];
    doc.text('Opening Balance', xPos + 2, yPos + 3.5);
    xPos += colWidths[2] + colWidths[3] + colWidths[4];
    doc.text(accountData.openingBalance.toFixed(2), xPos + 2, yPos + 3.5);
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 5;

    // Line items
    accountData.accountDetails.forEach(item => {
        xPos = margin;
        doc.text(item.date || '', xPos + 2, yPos + 3.5);
        xPos += colWidths[0];
        doc.text(item.code || '', xPos + 2, yPos + 3.5);
        xPos += colWidths[1];
        doc.text(item.description, xPos + 2, yPos + 3.5);
        xPos += colWidths[2];
        doc.text((item.units || 0).toFixed(3), xPos + 2, yPos + 3.5);
        xPos += colWidths[3];
        doc.text((item.tariff || 0).toFixed(6), xPos + 2, yPos + 3.5);
        xPos += colWidths[4];
        doc.text(item.value.toFixed(2), xPos + 2, yPos + 3.5);
        doc.rect(margin, yPos, contentWidth, 5);
        yPos += 5;
    });

    yPos += 5;

    // Aging Summary
    doc.setFont('helvetica', 'bold');
    const agingY = yPos;
    const agingColWidth = contentWidth / 6;

    xPos = margin;
    ['120+ DAYS', '90 DAYS', '60 DAYS', '30 DAYS', 'CURRENT', 'CLOSING BALANCE'].forEach((header, index) => {
        doc.text(header, xPos + 2, yPos + 3.5);
        xPos += agingColWidth;
    });
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 5;

    doc.setFont('helvetica', 'normal');
    xPos = margin;
    [
        accountData.aging.days120Plus,
        accountData.aging.days90,
        accountData.aging.days60,
        accountData.aging.days30,
        accountData.aging.current,
        accountData.closingBalance
    ].forEach(amount => {
        doc.text(amount.toFixed(2), xPos + 2, yPos + 3.5);
        xPos += agingColWidth;
    });
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 10;

    // Important Notice
    if (accountData.notice) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const noticeLines = doc.splitTextToSize(accountData.notice, contentWidth);
        noticeLines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += 3;
        });
        yPos += 5;
    }

    // Remittance Advice Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('REMITTANCE ADVICE', margin, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text('ACCOUNT NUMBER:', margin, yPos);
    doc.text(accountData.accountNumber, margin + 40, yPos);

    yPos += 5;
    doc.text('CONSUMER NAME:', margin, yPos);
    doc.text(accountData.consumerName, margin + 40, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL DUE:', margin, yPos);
    doc.text(formatCurrency(accountData.closingBalance), margin + 40, yPos);

    yPos += 5;
    doc.text('TOTAL DUE ON OR BEFORE:', margin, yPos);
    doc.text(accountData.dueDate, margin + 60, yPos);

    yPos += 10;

    // Banking Details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BANKING DETAILS', margin, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text('BANK NAME:', margin, yPos);
    doc.text('Bank Windhoek', margin + 30, yPos);

    yPos += 5;
    doc.text('ACCOUNT NAME:', margin, yPos);
    doc.text('Municipality Of Okahandja', margin + 30, yPos);

    yPos += 5;
    doc.text('ACCOUNT NUMBER:', margin, yPos);
    doc.text('1070769806', margin + 30, yPos);

    yPos += 5;
    doc.text('BRANCH CODE:', margin, yPos);
    doc.text('482773', margin + 30, yPos);

    yPos += 5;
    doc.text('REFERENCE:', margin, yPos);
    doc.text(accountData.accountNumber, margin + 30, yPos);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Okahandja Municipal App', pageWidth / 2, 285, { align: 'center' });

    return doc;
}

/**
 * Draw a table in the PDF
 */
function drawTable(doc, x, y, width, headers, rows, rowHeight) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    // Draw headers
    let xPos = x;
    headers.forEach(header => {
        doc.rect(xPos, y, header.width, rowHeight);
        doc.text(header.text, xPos + 2, y + 3.5);
        xPos += header.width;
    });

    y += rowHeight;

    // Draw rows
    if (rows.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.text('No meter readings', x + 2, y + 3.5);
        doc.rect(x, y, width, rowHeight);
    } else {
        doc.setFont('helvetica', 'normal');
        rows.forEach(row => {
            xPos = x;
            headers.forEach(header => {
                const key = header.text.toLowerCase().replace(/\s+/g, '');
                doc.text(row[key] || '', xPos + 2, y + 3.5);
                doc.rect(xPos, y, header.width, rowHeight);
                xPos += header.width;
            });
            y += rowHeight;
        });
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return amount.toLocaleString('en-NA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Generate sample statement data
 */
function getSampleStatementData(accountNumber) {
    const currentDate = new Date();
    const accountDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const dueDate = new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return {
        accountNumber: accountNumber || '0010016773',
        consumerName: 'WAKALENDA JOSEPH N',
        postalAddress: 'P.O. BOX 286\nOKAHANDJA',
        postalCode: '9000',
        deposit: 0.00,
        internetPin: '0920226340',
        accountDate: accountDate,
        taxInvoiceNo: accountNumber + currentDate.getFullYear() + String(currentDate.getMonth() + 1).padStart(2, '0'),
        vatRegNo: '',
        erfDescription: '0106 000004164 000000 0000',
        buildingValue: 0.00,
        street: 'EXT 6',
        landArea: 450.0000,
        landValue: 248000.00,

        meterReadings: [
            // Empty for properties without meters
        ],

        openingBalance: 126.52,

        accountDetails: [
            {
                date: '17/12/2025',
                code: '009009',
                description: 'INTEREST',
                units: 0,
                tariff: 0,
                value: 1.00
            },
            {
                date: '18/12/2025',
                code: '050101',
                description: 'RESIDENTIAL LAND TAX',
                units: 248000.000,
                tariff: 0.009770,
                value: 201.91
            },
            {
                date: '18/12/2025',
                code: '050201',
                description: 'RESIDENTIAL BLD TAX',
                units: 0,
                tariff: 0.002670,
                value: 0.00
            },
            {
                date: '18/12/2025',
                code: '010145',
                description: 'FIRE BRIGADE LEVY',
                units: 1.000,
                tariff: 6.370000,
                value: 6.37
            }
        ],

        aging: {
            days120Plus: 0.00,
            days90: 0.00,
            days60: 0.00,
            days30: 126.52,
            current: 209.28
        },

        closingBalance: 335.80,
        dueDate: dueDate,

        notice: 'DEAR VALUED CLIENTS KINDLY TAKE NOTE THAT THE DEBT COLLECTION FEES FROM JUNE UP TO DATE ARE UPLOADED ON YOUR NOV AND DEC BILLS. AND WE ARE STILL PROCESSING SEASON BLESSINGS'
    };
}

/**
 * Download official statement
 */
function downloadOfficialStatement(accountNumber) {
    const statementData = getSampleStatementData(accountNumber);
    const doc = generateOfficialStatement(statementData);

    const fileName = `Statement_${accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    alert('✅ Official statement downloaded successfully!');
}

/**
 * Email official statement
 */
function emailOfficialStatement(accountNumber, email) {
    // Generate statement
    const statementData = getSampleStatementData(accountNumber);
    const doc = generateOfficialStatement(statementData);

    // In a real app, this would send the PDF via email API
    alert(`📧 Statement would be sent to ${email}.\n\nIn production, this would:\n1. Generate the PDF\n2. Send via email service (e.g., SendGrid)\n3. Include payment links\n4. Track delivery`);

    // For demo, just download
    const fileName = `Statement_${accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

/**
 * Print official statement
 */
function printOfficialStatement(accountNumber) {
    const statementData = getSampleStatementData(accountNumber);
    const doc = generateOfficialStatement(statementData);

    // Open in new window and trigger print
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
}
