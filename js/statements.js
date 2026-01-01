/* ===================================
   STATEMENTS MODULE
   =================================== */

let currentService = '';
let currentPeriod = 'current';

/**
 * Open the statement modal for a specific service
 * @param {string} service - The service name (Water, Electricity, etc.)
 */
function openStatements(service) {
    currentService = service;
    currentPeriod = 'current';
    
    document.getElementById('statementTitle').textContent = service + ' Statement';
    document.getElementById('statementModal').classList.remove('hidden');
    
    // Reset period selector
    const periods = document.querySelectorAll('.statement-period');
    periods.forEach((p, index) => {
        if (index === 0) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
    
    renderStatement(service, currentPeriod);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

/**
 * Close the statement modal
 */
function closeStatements() {
    document.getElementById('statementModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/**
 * Select a different statement period
 * @param {string} period - The period identifier (current, nov2025, etc.)
 * @param {HTMLElement} element - The clicked period element
 */
function selectPeriod(period, element) {
    currentPeriod = period;
    
    // Update active state
    document.querySelectorAll('.statement-period').forEach(p => {
        p.classList.remove('active');
    });
    element.classList.add('active');
    
    renderStatement(currentService, period);
}

/**
 * Render the statement content for the given service and period
 * @param {string} service - The service name
 * @param {string} period - The period identifier
 */
function renderStatement(service, period) {
    const data = statementData[service].periods[period];
    const icon = statementData[service].icon;
    
    let html = `
        <div class="statement-header-info">
            <div class="statement-header-grid">
                <div class="statement-item">
                    <span class="statement-item-label">Account Number</span>
                    <span class="statement-item-value">${data.accountNumber}</span>
                </div>
                <div class="statement-item">
                    <span class="statement-item-label">Property Address</span>
                    <span class="statement-item-value">${data.propertyAddress}</span>
                </div>
                <div class="statement-item">
                    <span class="statement-item-label">Statement Date</span>
                    <span class="statement-item-value">${data.statementDate}</span>
                </div>
                <div class="statement-item">
                    <span class="statement-item-label">Due Date</span>
                    <span class="statement-item-value">${data.dueDate}</span>
                </div>
            </div>
        </div>
    `;
    
    // Add meter readings if available
    if (data.readings) {
        html += `
            <div class="statement-breakdown">
                <h4>${icon} Meter Readings</h4>
                <table class="statement-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Reading</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Previous Reading</td>
                            <td style="text-align: right;">${data.readings.previous}</td>
                        </tr>
                        <tr>
                            <td>Current Reading</td>
                            <td style="text-align: right;">${data.readings.current}</td>
                        </tr>
                        <tr style="font-weight: 700;">
                            <td>Total Usage</td>
                            <td style="text-align: right;">${data.readings.usage}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Charges breakdown
    html += `
        <div class="statement-breakdown">
            <h4>Charges Breakdown</h4>
            <table class="statement-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount (N$)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    data.items.forEach(item => {
        html += `
            <tr>
                <td>${item.description}</td>
                <td style="text-align: right;">${item.amount.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    // Payments if any
    if (data.payments && data.payments.length > 0) {
        html += `
            <div class="statement-breakdown">
                <h4>Payments Received</h4>
                <table class="statement-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th style="text-align: right;">Amount (N$)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.payments.forEach(payment => {
            html += `
                <tr style="color: var(--success);">
                    <td>${payment.date}</td>
                    <td>${payment.description}</td>
                    <td style="text-align: right;">${payment.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Total
    const totalColor = data.total > 0 ? 'var(--danger)' : 'var(--success)';
    html += `
        <div class="statement-total" style="background: linear-gradient(135deg, ${totalColor} 0%, ${totalColor} 100%);">
            <div class="statement-total-label">Total ${data.total > 0 ? 'Outstanding' : 'Balance'}</div>
            <div class="statement-total-amount">N$ ${data.total.toFixed(2)}</div>
        </div>
    `;
    
    // Action buttons
    const isConsolidated = currentService === 'Consolidated';
    html += `
        <div class="statement-actions">
            <button class="btn btn-primary btn-download" onclick="downloadStatement()">
                📥 Download PDF
            </button>
            ${isConsolidated ?
                `<button class="btn btn-primary btn-download" onclick="generateConsolidatedStatement('${data.accountNumber}')" style="background: #27ae60;">
                    📄 Official Consolidated
                </button>` :
                `<button class="btn btn-primary btn-download" onclick="downloadOfficialStatement('${data.accountNumber}')" style="background: #27ae60;">
                    📄 Official Statement
                </button>`
            }
            <button class="btn btn-secondary btn-print" onclick="printStatement()">
                🖨️ Print Statement
            </button>
        </div>
    `;
    
    document.getElementById('statementContent').innerHTML = html;
}

/**
 * Download statement as PDF
 */
function downloadStatement() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const data = statementData[currentService].periods[currentPeriod];
    const icon = statementData[currentService].icon;

    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(211, 84, 0);
    doc.text('OKAHANDJA MUNICIPALITY', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${icon} ${currentService} Statement`, 105, yPos, { align: 'center' });

    // Line
    yPos += 5;
    doc.setDrawColor(211, 84, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;

    // Account Information
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Account Information', 20, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Account Number: ${data.accountNumber}`, 20, yPos);
    yPos += 6;
    doc.text(`Property Address: ${data.propertyAddress}`, 20, yPos);
    yPos += 6;
    doc.text(`Statement Date: ${data.statementDate}`, 20, yPos);
    doc.text(`Due Date: ${data.dueDate}`, 120, yPos);

    yPos += 10;

    // Meter Readings (if available)
    if (data.readings) {
        doc.setFontSize(12);
        doc.setTextColor(211, 84, 0);
        doc.text('Meter Readings', 20, yPos);

        yPos += 7;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Previous Reading:', 20, yPos);
        doc.text(data.readings.previous, 70, yPos);
        yPos += 6;
        doc.text('Current Reading:', 20, yPos);
        doc.text(data.readings.current, 70, yPos);
        yPos += 6;
        doc.setFont(undefined, 'bold');
        doc.text('Total Usage:', 20, yPos);
        doc.text(data.readings.usage, 70, yPos);
        doc.setFont(undefined, 'normal');

        yPos += 10;
    }

    // Charges Breakdown
    doc.setFontSize(12);
    doc.setTextColor(211, 84, 0);
    doc.text('Charges Breakdown', 20, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    data.items.forEach(item => {
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(item.description, 20, yPos);
        doc.text(`N$ ${item.amount.toFixed(2)}`, 190, yPos, { align: 'right' });
        yPos += 6;
    });

    yPos += 5;

    // Payments (if any)
    if (data.payments && data.payments.length > 0) {
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(211, 84, 0);
        doc.text('Payments Received', 20, yPos);

        yPos += 7;
        doc.setFontSize(10);
        doc.setTextColor(0, 150, 0);

        data.payments.forEach(payment => {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`${payment.date} - ${payment.description}`, 20, yPos);
            doc.text(`N$ ${payment.amount.toFixed(2)}`, 190, yPos, { align: 'right' });
            yPos += 6;
        });

        yPos += 5;
    }

    // Total
    if (yPos > 245) {
        doc.addPage();
        yPos = 20;
    }

    doc.setDrawColor(211, 84, 0);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);

    yPos += 8;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const totalColor = data.total > 0 ? [220, 53, 69] : [40, 167, 69];
    doc.setTextColor(...totalColor);
    doc.text(`Total ${data.total > 0 ? 'Outstanding' : 'Balance'}:`, 20, yPos);
    doc.text(`N$ ${data.total.toFixed(2)}`, 190, yPos, { align: 'right' });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.setFont(undefined, 'normal');
    doc.text('For queries, contact: support@okahandja.gov.na | Tel: +264 62 503 XXX', 105, 280, { align: 'center' });
    doc.text('Generated with Claude Code', 105, 285, { align: 'center' });

    // Save PDF
    const periodText = data.period.replace(/\s+/g, '_');
    doc.save(`${currentService}_Statement_${periodText}.pdf`);

    alert('✅ Statement downloaded successfully!');
}

/**
 * Print the current statement
 */
function printStatement() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const data = statementData[currentService].periods[currentPeriod];
    const icon = statementData[currentService].icon;

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${currentService} Statement - ${data.period}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000428; padding-bottom: 20px; }
                .header h1 { color: #000428; font-size: 28px; margin-bottom: 10px; }
                .header h2 { color: #333; font-size: 20px; }
                .info-section { margin-bottom: 25px; }
                .info-section h3 { color: #000428; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
                .info-item { font-size: 14px; }
                .info-label { font-weight: bold; color: #666; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; font-weight: bold; color: #333; }
                .amount { text-align: right; }
                .total-section { margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-left: 5px solid #000428; }
                .total-label { font-size: 18px; font-weight: bold; color: #333; }
                .total-amount { font-size: 24px; font-weight: bold; color: #000428; margin-top: 10px; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>OKAHANDJA MUNICIPALITY</h1>
                <h2>${icon} ${currentService} Statement</h2>
            </div>

            <div class="info-section">
                <h3>Account Information</h3>
                <div class="info-grid">
                    <div class="info-item"><span class="info-label">Account Number:</span> ${data.accountNumber}</div>
                    <div class="info-item"><span class="info-label">Statement Date:</span> ${data.statementDate}</div>
                    <div class="info-item"><span class="info-label">Property Address:</span> ${data.propertyAddress}</div>
                    <div class="info-item"><span class="info-label">Due Date:</span> ${data.dueDate}</div>
                </div>
            </div>
    `;

    // Add meter readings if available
    if (data.readings) {
        html += `
            <div class="info-section">
                <h3>Meter Readings</h3>
                <table>
                    <tr><td>Previous Reading</td><td class="amount">${data.readings.previous}</td></tr>
                    <tr><td>Current Reading</td><td class="amount">${data.readings.current}</td></tr>
                    <tr style="font-weight: bold;"><td>Total Usage</td><td class="amount">${data.readings.usage}</td></tr>
                </table>
            </div>
        `;
    }

    // Add charges breakdown
    html += `
        <div class="info-section">
            <h3>Charges Breakdown</h3>
            <table>
                <thead>
                    <tr><th>Description</th><th class="amount">Amount (N$)</th></tr>
                </thead>
                <tbody>
    `;

    data.items.forEach(item => {
        html += `<tr><td>${item.description}</td><td class="amount">${item.amount.toFixed(2)}</td></tr>`;
    });

    html += `</tbody></table></div>`;

    // Add payments if any
    if (data.payments && data.payments.length > 0) {
        html += `
            <div class="info-section">
                <h3>Payments Received</h3>
                <table>
                    <thead>
                        <tr><th>Date</th><th>Description</th><th class="amount">Amount (N$)</th></tr>
                    </thead>
                    <tbody>
        `;

        data.payments.forEach(payment => {
            html += `<tr style="color: green;"><td>${payment.date}</td><td>${payment.description}</td><td class="amount">${payment.amount.toFixed(2)}</td></tr>`;
        });

        html += `</tbody></table></div>`;
    }

    // Add total
    html += `
        <div class="total-section">
            <div class="total-label">Total ${data.total > 0 ? 'Outstanding' : 'Balance'}</div>
            <div class="total-amount">N$ ${data.total.toFixed(2)}</div>
        </div>

        <div class="footer">
            <p>For queries, contact: support@okahandja.gov.na | Tel: +264 62 503 XXX</p>
            <p style="margin-top: 10px;">Generated with Claude Code</p>
        </div>
    </body>
    </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = function() {
        printWindow.print();
    };
}

// Close modal when clicking outside
document.getElementById('statementModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeStatements();
    }
});
