/* ===================================
   MAIN APP MODULE
   =================================== */

/**
 * Handle payment for a specific service
 * @param {string} service - The service name to pay for
 */
function payBill(service) {
    const amounts = {
        'Water': 1245.00,
        'Electricity': 1785.50,
        'Property Rates': 1275.00,
        'Refuse Collection': 548.00
    };

    const amount = amounts[service] || 0;

    // Show payment gateway modal
    if (typeof showPaymentModal === 'function') {
        showPaymentModal(service, amount);
    } else {
        // Fallback to old payment method
        if (confirm(`Process payment of N$ ${amount.toFixed(2)} for ${service}?`)) {
            setTimeout(() => {
                const reference = `PAY-2025-${Date.now()}`;
                alert(`Payment Successful!\n\nService: ${service}\nAmount: N$ ${amount.toFixed(2)}\nReference: ${reference}\n\nDownloading receipt...`);

                if (typeof generatePDFReceipt === 'function') {
                    generatePDFReceipt(service, amount, reference);
                }
            }, 500);
        }
    }
}

/**
 * Calculate and display total outstanding balance
 */
function calculateTotal() {
    const total = 1245.00 + 1785.50 + 1275.00 + 548.00;
    document.getElementById('totalOutstanding').textContent = total.toFixed(2);
}

// Initialize the app
calculateTotal();
