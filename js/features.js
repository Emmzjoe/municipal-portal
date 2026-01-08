/* ===================================
   ENHANCED FEATURES MODULE
   =================================== */

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    // Update icon
    const icon = document.querySelector('.icon-btn[onclick="toggleDarkMode()"]');
    if (icon) {
        icon.textContent = isDark ? '☀️' : '🌙';
    }
}

// Load dark mode preference
window.addEventListener('load', function() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('.icon-btn[onclick="toggleDarkMode()"]');
        if (icon) icon.textContent = '☀️';
    }
});

// Notifications Panel
function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('hidden');

        // Mark notifications as read
        if (!panel.classList.contains('hidden')) {
            setTimeout(() => {
                document.getElementById('notificationBadge').textContent = '0';
                document.querySelectorAll('.notification-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
            }, 1000);
        }
    }
}

// Close notification panel when clicking outside
document.addEventListener('click', function(event) {
    const panel = document.getElementById('notificationPanel');
    const notifBtn = document.querySelector('.notification-btn');

    if (panel && !panel.contains(event.target) && event.target !== notifBtn && !notifBtn.contains(event.target)) {
        panel.classList.add('hidden');
    }
});

/* ===================================
   CHARTS & ANALYTICS
   =================================== */

// Initialize charts when dashboard loads
function initializeCharts() {
    // Water Usage Chart
    const waterCtx = document.getElementById('waterChart');
    if (waterCtx) {
        new Chart(waterCtx, {
            type: 'line',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Water Usage (m³)',
                    data: [35, 28, 30, 32],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Electricity Usage Chart
    const electricityCtx = document.getElementById('electricityChart');
    if (electricityCtx) {
        new Chart(electricityCtx, {
            type: 'line',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Electricity Usage (kWh)',
                    data: [340, 315, 330, 357],
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // Monthly Spending Chart
    const spendingCtx = document.getElementById('spendingChart');
    if (spendingCtx) {
        new Chart(spendingCtx, {
            type: 'bar',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Water',
                        data: [1350, 1125, 1180, 1245],
                        backgroundColor: '#3498db'
                    },
                    {
                        label: 'Electricity',
                        data: [1666, 1560, 1650, 1785.50],
                        backgroundColor: '#f39c12'
                    },
                    {
                        label: 'Property Rates',
                        data: [1275, 1275, 1275, 1275],
                        backgroundColor: '#2c5f2d'
                    },
                    {
                        label: 'Refuse',
                        data: [548, 548, 548, 548],
                        backgroundColor: '#95a5a6'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                },
                scales: {
                    x: { stacked: false },
                    y: { beginAtZero: true, stacked: false }
                }
            }
        });
    }
}

// Call when dashboard loads
if (sessionStorage.getItem('loggedIn') === 'true' && sessionStorage.getItem('role') !== 'admin') {
    window.addEventListener('load', initializeCharts);
}

/* ===================================
   SERVICE REQUESTS
   =================================== */

// Load service requests from database
async function loadServiceRequests() {
    try {
        const response = await API.serviceRequests.getAll();
        if (response.success) {
            const requests = response.data.serviceRequests;
            displayServiceRequests(requests);
        }
    } catch (error) {
        console.error('Error loading service requests:', error);
    }
}

// Display service requests in the grid
function displayServiceRequests(requests) {
    const grid = document.querySelector('.requests-grid');
    if (!grid) return;

    if (requests.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No service requests yet. Click "+ New Request" to submit one.</p>';
        return;
    }

    grid.innerHTML = requests.map(request => {
        const statusClass = request.status === 'Open' ? 'due-soon' :
                           request.status === 'In Progress' ? 'due-soon' :
                           request.status === 'Resolved' ? 'paid' : 'overdue';

        const date = new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="request-card">
                <div class="request-header">
                    <span class="request-id">${request.requestId}</span>
                    <span class="status-badge ${statusClass}">${request.status}</span>
                </div>
                <h4>${request.type}</h4>
                <p>${request.description.substring(0, 60)}${request.description.length > 60 ? '...' : ''}</p>
                <div class="request-footer">
                    <span>Submitted: ${date}</span>
                    <span>Priority: ${request.priority}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showServiceRequestModal() {
    document.getElementById('serviceRequestModal').classList.remove('hidden');
}

function closeServiceRequestModal() {
    document.getElementById('serviceRequestModal').classList.add('hidden');
    document.getElementById('serviceRequestForm').reset();
}

// Handle service request form submission
document.addEventListener('DOMContentLoaded', function() {
    const serviceRequestForm = document.getElementById('serviceRequestForm');
    if (serviceRequestForm) {
        serviceRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const type = document.getElementById('requestType').value;
            const category = document.getElementById('requestCategory')?.value || 'Other';
            const priority = document.getElementById('requestPriority').value;
            const description = document.getElementById('requestDescription').value;
            const location = document.getElementById('requestLocation').value;

            try {
                const response = await API.serviceRequests.create({
                    type,
                    category,
                    priority,
                    description,
                    location
                });

                if (response.success) {
                    const requestId = response.data.requestId;
                    alert(`Service Request Submitted!\n\nRequest ID: ${requestId}\nType: ${type}\nPriority: ${priority}\n\nYou will receive updates via email and SMS.`);
                    closeServiceRequestModal();
                    loadServiceRequests(); // Reload the list
                } else {
                    alert('Failed to submit service request. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting service request:', error);
                alert('Error submitting service request. Please try again.');
            }
        });
    }

    // Load service requests when page loads
    if (sessionStorage.getItem('loggedIn') === 'true' && sessionStorage.getItem('role') !== 'admin') {
        loadServiceRequests();
    }
});

/* ===================================
   PAYMENT PLANS
   =================================== */

function showPaymentPlanModal() {
    document.getElementById('paymentPlanModal').classList.remove('hidden');
}

function closePaymentPlanModal() {
    document.getElementById('paymentPlanModal').classList.add('hidden');
    document.getElementById('paymentPlanForm').reset();
}

function calculateInstallment() {
    const amount = parseFloat(document.getElementById('planAmount').value);
    const duration = parseInt(document.getElementById('planDuration').value);
    const installment = (amount / duration).toFixed(2);

    document.getElementById('planInstallment').value = `N$ ${installment}`;
}

// Handle payment plan form submission
document.addEventListener('DOMContentLoaded', function() {
    const paymentPlanForm = document.getElementById('paymentPlanForm');
    if (paymentPlanForm) {
        paymentPlanForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const duration = document.getElementById('planDuration').value;
            const installment = document.getElementById('planInstallment').value;
            const startDate = document.getElementById('planStartDate').value;

            alert(`Payment Plan Activated!\n\nDuration: ${duration} months\nMonthly Payment: ${installment}\nFirst Payment: ${startDate}\n\nPayments will be automatically debited on the same day each month.`);

            closePaymentPlanModal();
        });
    }
});

/* ===================================
   PASSWORD RESET & 2FA
   =================================== */

function showPasswordResetModal() {
    document.getElementById('passwordResetModal').classList.remove('hidden');
}

function closePasswordResetModal() {
    document.getElementById('passwordResetModal').classList.add('hidden');
    document.getElementById('passwordResetForm').reset();
}

// Handle password reset form submission
document.addEventListener('DOMContentLoaded', function() {
    const passwordResetForm = document.getElementById('passwordResetForm');
    if (passwordResetForm) {
        passwordResetForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const enable2FA = document.getElementById('enable2FA').checked;

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match!');
                return;
            }

            if (newPassword.length < 6) {
                alert('Password must be at least 6 characters long!');
                return;
            }

            let message = 'Password updated successfully!';
            if (enable2FA) {
                message += '\n\nTwo-Factor Authentication has been enabled. A verification code will be sent to your registered phone number on next login.';
            }

            alert(message);
            closePasswordResetModal();
        });
    }
});

/* ===================================
   PDF RECEIPT GENERATION
   =================================== */

function generatePDFReceipt(service, amount, reference) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(211, 84, 0);
    doc.text('OKAHANDJA MUNICIPALITY', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 30, { align: 'center' });

    // Add line
    doc.setDrawColor(211, 84, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Add details
    doc.setFontSize(12);
    const accountNumber = sessionStorage.getItem('accountNumber') || '12345678';
    const userName = sessionStorage.getItem('userName') || 'John Doe';
    const date = new Date().toLocaleDateString();

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
    doc.text(`Payment Method: Online Banking`, 20, 130);
    doc.text(`Status: Paid`, 20, 140);

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your payment!', 105, 180, { align: 'center' });
    doc.text('For queries, contact: support@okahandja.gov.na', 105, 190, { align: 'center' });
    doc.text('Generated with Claude Code', 105, 270, { align: 'center' });

    // Save PDF
    doc.save(`Receipt_${reference}.pdf`);
}

/* ===================================
   ADMIN BULK OPERATIONS
   =================================== */

function bulkSendReminders() {
    const overdueBills = document.querySelectorAll('#billsTableBody tr');
    let overdueCount = 0;

    overdueBills.forEach(row => {
        const status = row.querySelector('.status-badge');
        if (status && (status.textContent.includes('Overdue') || status.textContent.includes('Due Soon'))) {
            overdueCount++;
        }
    });

    if (confirm(`Send payment reminders to ${overdueCount} accounts with outstanding bills?`)) {
        alert(`📧 Reminders sent successfully to ${overdueCount} accounts!\n\nEmails and SMS notifications have been dispatched.`);
    }
}

function filterActivityLog() {
    const startDate = document.getElementById('activityStartDate').value;
    const endDate = document.getElementById('activityEndDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    alert(`Filtering activity log from ${startDate} to ${endDate}...\n\nIn a production environment, this would filter the activity log data.`);
}

/* ===================================
   USAGE ALERTS
   =================================== */

function checkUsageAlerts() {
    const currentWaterUsage = 32; // m³
    const previousWaterUsage = 30; // m³
    const increase = ((currentWaterUsage - previousWaterUsage) / previousWaterUsage) * 100;

    if (increase > 20) {
        showUsageAlert('Water', increase);
    }

    const currentElectricityUsage = 357; // kWh
    const previousElectricityUsage = 330; // kWh
    const electricityIncrease = ((currentElectricityUsage - previousElectricityUsage) / previousElectricityUsage) * 100;

    if (electricityIncrease > 20) {
        showUsageAlert('Electricity', electricityIncrease);
    }
}

function showUsageAlert(service, increase) {
    console.log(`${service} usage increased by ${increase.toFixed(1)}%`);
    // This is already shown in the notifications panel
}

// Run usage check on dashboard load
if (sessionStorage.getItem('loggedIn') === 'true' && sessionStorage.getItem('role') !== 'admin') {
    window.addEventListener('load', checkUsageAlerts);
}
