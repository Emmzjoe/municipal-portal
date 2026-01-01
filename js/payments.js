/* ===================================
   PAYMENT GATEWAY MODULE
   =================================== */

/**
 * Payment Gateway Configuration
 * Supports multiple payment providers for Namibia
 */
const paymentGateways = {
    nampost: {
        name: 'Nam Post Mobile Money',
        icon: '📱',
        enabled: true,
        description: 'Pay with Nam Post Mobile Money',
        requiresPhone: true
    },
    banktransfer: {
        name: 'Bank Transfer',
        icon: '🏦',
        enabled: true,
        description: 'Direct bank transfer (FNB, Bank Windhoek, Standard Bank)',
        requiresAccount: true
    },
    card: {
        name: 'Debit/Credit Card',
        icon: '💳',
        enabled: true,
        description: 'Visa, Mastercard accepted',
        requiresCard: true
    },
    mobilemoney: {
        name: 'Mobile Money',
        icon: '📲',
        enabled: true,
        description: 'MTC Mobile Money, TN Mobile',
        requiresPhone: true
    },
    cash: {
        name: 'Pay at Office',
        icon: '💵',
        enabled: true,
        description: 'Visit municipal office to pay in cash',
        requiresNothing: true
    }
};

/**
 * Show payment modal with gateway selection
 * @param {string} service - The service being paid for
 * @param {number} amount - The amount to pay
 */
function showPaymentModal(service, amount) {
    const modal = document.getElementById('paymentModal');

    // Set payment details
    document.getElementById('paymentService').textContent = service;
    document.getElementById('paymentAmount').textContent = `N$ ${amount.toFixed(2)}`;

    // Store current payment details
    window.currentPayment = { service, amount };

    // Render payment methods
    renderPaymentMethods();

    // Show modal
    modal.classList.remove('hidden');
}

/**
 * Close payment modal
 */
function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');

    // Reset all payment forms
    document.querySelectorAll('.payment-method-form').forEach(form => {
        form.classList.add('hidden');
        form.querySelector('form')?.reset();
    });

    // Clear selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
}

/**
 * Render available payment methods
 */
function renderPaymentMethods() {
    const container = document.getElementById('paymentMethodsList');
    container.innerHTML = '';

    Object.keys(paymentGateways).forEach(gatewayId => {
        const gateway = paymentGateways[gatewayId];

        if (!gateway.enabled) return;

        const card = document.createElement('div');
        card.className = 'payment-method-card';
        card.onclick = () => selectPaymentMethod(gatewayId);

        card.innerHTML = `
            <div class="payment-method-icon">${gateway.icon}</div>
            <div class="payment-method-info">
                <h4>${gateway.name}</h4>
                <p>${gateway.description}</p>
            </div>
            <div class="payment-method-radio">
                <input type="radio" name="paymentMethod" value="${gatewayId}">
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Select a payment method
 * @param {string} gatewayId - The selected gateway ID
 */
function selectPaymentMethod(gatewayId) {
    // Update UI selection
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Check the radio button
    document.querySelector(`input[value="${gatewayId}"]`).checked = true;

    // Hide all forms
    document.querySelectorAll('.payment-method-form').forEach(form => {
        form.classList.add('hidden');
    });

    // Show relevant form
    const formId = `${gatewayId}Form`;
    const form = document.getElementById(formId);
    if (form) {
        form.classList.remove('hidden');
    }

    // Show proceed button
    document.getElementById('proceedPaymentBtn').classList.remove('hidden');
}

/**
 * Process payment based on selected gateway
 */
function proceedWithPayment() {
    const selectedGateway = document.querySelector('input[name="paymentMethod"]:checked');

    if (!selectedGateway) {
        alert('Please select a payment method');
        return;
    }

    const gatewayId = selectedGateway.value;
    const { service, amount } = window.currentPayment;

    // Process based on gateway type
    switch (gatewayId) {
        case 'nampost':
            processNamPostPayment(service, amount);
            break;
        case 'banktransfer':
            processBankTransferPayment(service, amount);
            break;
        case 'card':
            processCardPayment(service, amount);
            break;
        case 'mobilemoney':
            processMobileMoneyPayment(service, amount);
            break;
        case 'cash':
            processCashPayment(service, amount);
            break;
        default:
            alert('Invalid payment method');
    }
}

/**
 * Process Nam Post Mobile Money payment
 */
function processNamPostPayment(service, amount) {
    const phone = document.getElementById('nampostPhone').value;

    if (!phone) {
        alert('Please enter your phone number');
        return;
    }

    // Simulate payment processing
    showPaymentProcessing();

    setTimeout(() => {
        hidePaymentProcessing();
        completePayment(service, amount, 'Nam Post Mobile Money', `NMMP-${Date.now()}`);
    }, 2000);
}

/**
 * Process Bank Transfer payment
 */
function processBankTransferPayment(service, amount) {
    const bank = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('bankAccountNumber').value;
    const accountHolder = document.getElementById('bankAccountHolder').value;

    if (!bank || !accountNumber || !accountHolder) {
        alert('Please fill in all bank transfer details');
        return;
    }

    // Simulate payment processing
    showPaymentProcessing();

    setTimeout(() => {
        hidePaymentProcessing();
        completePayment(service, amount, `Bank Transfer (${bank})`, `BT-${Date.now()}`);
    }, 2500);
}

/**
 * Process Card payment
 */
function processCardPayment(service, amount) {
    const cardNumber = document.getElementById('cardNumber').value;
    const cardName = document.getElementById('cardName').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;

    if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        alert('Please fill in all card details');
        return;
    }

    // Basic card validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
    }

    if (cardCVV.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return;
    }

    // Simulate payment processing
    showPaymentProcessing();

    setTimeout(() => {
        hidePaymentProcessing();
        const maskedCard = '**** **** **** ' + cardNumber.slice(-4);
        completePayment(service, amount, `Card Payment (${maskedCard})`, `CARD-${Date.now()}`);
    }, 3000);
}

/**
 * Process Mobile Money payment
 */
function processMobileMoneyPayment(service, amount) {
    const provider = document.getElementById('mobileProvider').value;
    const phone = document.getElementById('mobilePhone').value;

    if (!provider || !phone) {
        alert('Please select provider and enter phone number');
        return;
    }

    // Simulate payment processing
    showPaymentProcessing();

    setTimeout(() => {
        hidePaymentProcessing();
        completePayment(service, amount, `${provider} Mobile Money`, `MM-${Date.now()}`);
    }, 2000);
}

/**
 * Process Cash payment (generate payment slip)
 */
function processCashPayment(service, amount) {
    const reference = `CASH-${Date.now()}`;

    // Generate payment slip
    generatePaymentSlip(service, amount, reference);

    alert(`Payment slip generated!\n\nReference: ${reference}\n\nPlease print this slip and bring it to any Okahandja Municipality office to complete your payment.\n\nOffice Hours: Mon-Fri 8:00 AM - 4:30 PM`);

    closePaymentModal();
}

/**
 * Show payment processing indicator
 */
function showPaymentProcessing() {
    const indicator = document.getElementById('paymentProcessing');
    indicator.classList.remove('hidden');
}

/**
 * Hide payment processing indicator
 */
function hidePaymentProcessing() {
    const indicator = document.getElementById('paymentProcessing');
    indicator.classList.add('hidden');
}

/**
 * Complete payment and update system
 */
function completePayment(service, amount, paymentMethod, reference) {
    // Close payment modal
    closePaymentModal();

    // Show success message
    alert(`✅ Payment Successful!\n\nService: ${service}\nAmount: N$ ${amount.toFixed(2)}\nMethod: ${paymentMethod}\nReference: ${reference}\n\nDownloading receipt...`);

    // Generate PDF receipt
    if (typeof generatePDFReceipt === 'function') {
        generatePDFReceipt(service, amount, reference, paymentMethod);
    }

    // Update payment history
    addToPaymentHistory({
        date: new Date().toLocaleDateString(),
        service: service,
        amount: amount,
        method: paymentMethod,
        reference: reference,
        status: 'Success'
    });

    // Send email confirmation (simulated)
    sendPaymentConfirmation(service, amount, reference);
}

/**
 * Add payment to history
 */
function addToPaymentHistory(payment) {
    const history = JSON.parse(localStorage.getItem('paymentHistory') || '[]');
    history.unshift(payment);

    // Keep last 50 transactions
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem('paymentHistory', JSON.stringify(history));
}

/**
 * Send payment confirmation email (simulated)
 */
function sendPaymentConfirmation(service, amount, reference) {
    console.log(`📧 Sending confirmation email for payment ${reference}`);

    // In production, this would call a backend API to send actual email
    // For now, just log to console
    const accountNumber = sessionStorage.getItem('accountNumber');
    const userName = sessionStorage.getItem('userName');

    console.log(`Email sent to user ${userName} (${accountNumber})`);
    console.log(`Service: ${service}, Amount: N$ ${amount}, Reference: ${reference}`);
}

/**
 * Generate payment slip for cash payments
 */
function generatePaymentSlip(service, amount, reference) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const accountNumber = sessionStorage.getItem('accountNumber') || '12345678';
    const userName = sessionStorage.getItem('userName') || 'John Doe';
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(211, 84, 0);
    doc.text('OKAHANDJA MUNICIPALITY', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('CASH PAYMENT SLIP', 105, 30, { align: 'center' });

    // Line
    doc.setDrawColor(211, 84, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Instructions
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Please present this slip at any Okahandja Municipality office', 105, 45, { align: 'center' });

    // Payment details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    doc.text('Payment Reference:', 20, 60);
    doc.setFont(undefined, 'bold');
    doc.text(reference, 80, 60);
    doc.setFont(undefined, 'normal');

    doc.text('Date Issued:', 20, 70);
    doc.text(date, 80, 70);

    doc.text('Account Number:', 20, 80);
    doc.text(accountNumber, 80, 80);

    doc.text('Account Holder:', 20, 90);
    doc.text(userName, 80, 90);

    doc.text('Service:', 20, 100);
    doc.text(service, 80, 100);

    doc.text('Amount to Pay:', 20, 110);
    doc.setFontSize(16);
    doc.setTextColor(211, 84, 0);
    doc.text(`N$ ${amount.toFixed(2)}`, 80, 110);

    // Barcode placeholder
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('*' + reference + '*', 105, 130, { align: 'center' });

    // Office locations
    doc.setFontSize(12);
    doc.setTextColor(211, 84, 0);
    doc.text('Payment Locations:', 20, 150);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('• Main Office: Voortrekker Street, Okahandja', 20, 160);
    doc.text('• Hours: Monday - Friday, 8:00 AM - 4:30 PM', 20, 168);
    doc.text('• Closed on public holidays', 20, 176);

    // Terms
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('This payment slip is valid for 30 days from date of issue.', 20, 200);
    doc.text('Please keep this slip as proof of payment until transaction is confirmed.', 20, 207);

    // Footer
    doc.setFontSize(9);
    doc.text('For queries: support@okahandja.gov.na | Tel: +264 62 503 XXX', 105, 270, { align: 'center' });
    doc.text('Generated with Claude Code', 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Payment_Slip_${reference}.pdf`);
}

/**
 * Enhanced PDF receipt with payment method
 */
function generatePDFReceipt(service, amount, reference, paymentMethod = 'Online Banking') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(211, 84, 0);
    doc.text('OKAHANDJA MUNICIPALITY', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 30, { align: 'center' });

    // Line
    doc.setDrawColor(211, 84, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Add details
    doc.setFontSize(12);
    const accountNumber = sessionStorage.getItem('accountNumber') || '12345678';
    const userName = sessionStorage.getItem('userName') || 'John Doe';
    const date = new Date().toLocaleString();

    doc.text(`Receipt Number: ${reference}`, 20, 50);
    doc.text(`Date: ${date}`, 20, 60);
    doc.text(`Account Number: ${accountNumber}`, 20, 70);
    doc.text(`Account Holder: ${userName}`, 20, 80);

    // Add payment details
    doc.setFontSize(14);
    doc.setTextColor(211, 84, 0);
    doc.text('Payment Details', 20, 100);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Service: ${service}`, 20, 110);
    doc.text(`Amount Paid: N$ ${amount.toFixed(2)}`, 20, 120);
    doc.text(`Payment Method: ${paymentMethod}`, 20, 130);
    doc.text(`Status: Paid`, 20, 140);

    // Success stamp
    doc.setFontSize(40);
    doc.setTextColor(40, 167, 69);
    doc.text('PAID', 105, 180, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your payment!', 105, 210, { align: 'center' });
    doc.text('This is a computer-generated receipt and is valid without signature.', 105, 220, { align: 'center' });
    doc.text('For queries, contact: support@okahandja.gov.na', 105, 240, { align: 'center' });
    doc.text('Generated with Claude Code', 105, 270, { align: 'center' });

    // Save PDF
    doc.save(`Receipt_${reference}.pdf`);
}

/**
 * Format card number with spaces
 */
function formatCardNumber(input) {
    const value = input.value.replace(/\s/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formatted;
}

/**
 * Format expiry date MM/YY
 */
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

/**
 * Restrict CVV to 3 digits
 */
function restrictCVV(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 3);
}
