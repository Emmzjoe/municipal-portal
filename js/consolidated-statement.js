/* ===================================
   CONSOLIDATED STATEMENT GENERATOR
   Generates consolidated statements for all services
   =================================== */

/**
 * Generate consolidated official statement
 * This combines all services (Water, Electricity, Property Rates, Refuse) into one statement
 */
function generateConsolidatedStatement(accountNumber) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const margin = 15;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);

    let yPos = margin;

    // Get current user data
    const currentUser = localStorage.getItem('currentUser');
    const userData = currentUser ? JSON.parse(currentUser) : null;
    const consumerName = userData ? userData.name.toUpperCase() : 'ACCOUNT HOLDER';

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

    // CONSOLIDATED TAX INVOICE / STATEMENT Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSOLIDATED TAX INVOICE / STATEMENT', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    // Account Information
    const currentDate = new Date();
    const accountDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const dueDate = new Date(currentDate.getTime() + (15 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const leftColX = margin;
    const rightColX = pageWidth / 2 + 5;

    doc.setFontSize(9);

    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Account Number:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountNumber, leftColX + 35, yPos);

    doc.setFont('helvetica', 'bold');
    doc.text('Account Date:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(accountDate, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Consumer Name:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(consumerName, leftColX + 35, yPos);

    const taxInvoiceNo = accountNumber + currentDate.getFullYear() + String(currentDate.getMonth() + 1).padStart(2, '0');
    doc.setFont('helvetica', 'bold');
    doc.text('Tax Invoice No.:', rightColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(taxInvoiceNo, rightColX + 25, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Type:', leftColX, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('CONSOLIDATED - ALL SERVICES', leftColX + 35, yPos);

    yPos += 10;

    // Summary Box
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 30, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin, yPos, contentWidth, 30);

    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT SUMMARY', margin + 5, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Service totals
    const waterTotal = 1245.00;
    const electricityTotal = 1785.50;
    const propertyRatesTotal = 201.91;
    const refuseTotal = 548.00;
    const fireBrigadeLevy = 6.37;
    const interest = 1.00;
    const openingBalance = 126.52;

    doc.text('💧 Water Services:', margin + 5, yPos);
    doc.text('N$ ' + waterTotal.toFixed(2), pageWidth - margin - 5, yPos, { align: 'right' });

    yPos += 5;
    doc.text('⚡ Electricity Services:', margin + 5, yPos);
    doc.text('N$ ' + electricityTotal.toFixed(2), pageWidth - margin - 5, yPos, { align: 'right' });

    yPos += 5;
    doc.text('🏠 Property Rates:', margin + 5, yPos);
    doc.text('N$ ' + propertyRatesTotal.toFixed(2), pageWidth - margin - 5, yPos, { align: 'right' });

    yPos += 5;
    doc.text('🗑️ Refuse Collection:', margin + 5, yPos);
    doc.text('N$ ' + refuseTotal.toFixed(2), pageWidth - margin - 5, yPos, { align: 'right' });

    yPos += 10;

    // Detailed breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DETAILED ACCOUNT BREAKDOWN', margin, yPos);

    yPos += 5;

    // Account details table
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

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
    xPos += colWidths[0] + colWidths[1];
    doc.text('Opening Balance', xPos + 2, yPos + 3.5);
    xPos += colWidths[2] + colWidths[3] + colWidths[4];
    doc.text(openingBalance.toFixed(2), xPos + 2, yPos + 3.5);
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 5;

    // All line items
    const accountDetails = [
        { date: '17/12/2025', code: '009009', description: 'INTEREST', units: 0, tariff: 0, value: interest },
        { date: '18/12/2025', code: '010101', description: 'WATER CONSUMPTION', units: 32.000, tariff: 38.906250, value: waterTotal },
        { date: '18/12/2025', code: '020101', description: 'ELECTRICITY CONSUMPTION', units: 357.000, tariff: 5.000000, value: electricityTotal },
        { date: '18/12/2025', code: '050101', description: 'RESIDENTIAL LAND TAX', units: 248000.000, tariff: 0.000814, value: propertyRatesTotal },
        { date: '18/12/2025', code: '030101', description: 'REFUSE COLLECTION', units: 1.000, tariff: 548.000000, value: refuseTotal },
        { date: '18/12/2025', code: '010145', description: 'FIRE BRIGADE LEVY', units: 1.000, tariff: 6.370000, value: fireBrigadeLevy }
    ];

    accountDetails.forEach(item => {
        xPos = margin;
        doc.text(item.date || '', xPos + 2, yPos + 3.5);
        xPos += colWidths[0];
        doc.text(item.code || '', xPos + 2, yPos + 3.5);
        xPos += colWidths[1];
        doc.text(item.description, xPos + 2, yPos + 3.5);
        xPos += colWidths[2];
        doc.text(item.units.toFixed(3), xPos + 2, yPos + 3.5);
        xPos += colWidths[3];
        doc.text(item.tariff.toFixed(6), xPos + 2, yPos + 3.5);
        xPos += colWidths[4];
        doc.text(item.value.toFixed(2), xPos + 2, yPos + 3.5);
        doc.rect(margin, yPos, contentWidth, 5);
        yPos += 5;
    });

    yPos += 5;

    // Aging Summary
    const totalCharges = waterTotal + electricityTotal + propertyRatesTotal + refuseTotal + fireBrigadeLevy + interest;
    const closingBalance = openingBalance + totalCharges;

    doc.setFont('helvetica', 'bold');
    const agingColWidth = contentWidth / 6;

    xPos = margin;
    ['120+ DAYS', '90 DAYS', '60 DAYS', '30 DAYS', 'CURRENT', 'CLOSING BALANCE'].forEach((header) => {
        doc.text(header, xPos + 2, yPos + 3.5);
        xPos += agingColWidth;
    });
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 5;

    doc.setFont('helvetica', 'normal');
    xPos = margin;
    [0.00, 0.00, 0.00, openingBalance, totalCharges, closingBalance].forEach(amount => {
        doc.text(amount.toFixed(2), xPos + 2, yPos + 3.5);
        xPos += agingColWidth;
    });
    doc.rect(margin, yPos, contentWidth, 5);

    yPos += 10;

    // Notice
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    const notice = 'DEAR VALUED CLIENTS KINDLY TAKE NOTE THAT THIS IS A CONSOLIDATED STATEMENT COVERING ALL MUNICIPAL SERVICES. SEASON BLESSINGS';
    const noticeLines = doc.splitTextToSize(notice, contentWidth);
    noticeLines.forEach(line => {
        doc.text(line, margin, yPos);
        yPos += 3;
    });

    yPos += 5;

    // Remittance Advice
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('REMITTANCE ADVICE', margin, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    doc.text('ACCOUNT NUMBER:', margin, yPos);
    doc.text(accountNumber, margin + 40, yPos);

    yPos += 5;
    doc.text('CONSUMER NAME:', margin, yPos);
    doc.text(consumerName, margin + 40, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(211, 84, 0);
    doc.text('TOTAL DUE:', margin, yPos);
    doc.text('N$ ' + closingBalance.toFixed(2), margin + 40, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL DUE ON OR BEFORE:', margin, yPos);
    doc.text(dueDate, margin + 60, yPos);

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
    doc.text(accountNumber, margin + 30, yPos);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Okahandja Municipal App - Consolidated Statement', pageWidth / 2, 285, { align: 'center' });

    // Save
    const fileName = `Consolidated_Statement_${accountNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    alert('✅ Consolidated statement downloaded successfully!');
}

/**
 * Email consolidated statement
 */
function emailConsolidatedStatement(accountNumber, email) {
    alert(`📧 Consolidated statement would be sent to ${email}.\n\nThis includes all services:\n- Water\n- Electricity\n- Property Rates\n- Refuse Collection\n\nFor demo purposes, downloading instead...`);
    generateConsolidatedStatement(accountNumber);
}
