/* ===================================
   ADMIN DASHBOARD MODULE
   =================================== */

// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Global data stores (loaded from API)
let allUsers = [];
let allBills = [];
let allPayments = [];
let allServiceRequests = [];

/**
 * Load admin dashboard data
 */
async function loadAdminDashboard() {
    try {
        // Fetch all data from API
        await Promise.all([
            fetchUsers(),
            fetchBills(),
            fetchPayments(),
            fetchServiceRequests()
        ]);

        // Update all dashboard sections
        calculateStats();
        loadUsersTable();
        loadBillsTable();
        loadServiceRequestsTable();
        loadReports();
        loadTransactions();
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        alert('Error loading dashboard data. Please check your connection and try again.');
    }
}

/**
 * Fetch all users from API
 */
async function fetchUsers() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    allUsers = data.users || [];
}

/**
 * Fetch all bills from API
 */
async function fetchBills() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/bills/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch bills');
    }

    const data = await response.json();
    allBills = data.bills || [];
}

/**
 * Fetch all payments from API
 */
async function fetchPayments() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/payments/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch payments');
    }

    const data = await response.json();
    allPayments = data.payments || [];
}

/**
 * Calculate and display statistics
 */
function calculateStats() {
    const totalUsers = allUsers.length;
    let totalOutstanding = 0;
    let totalRevenue = 0;

    // Calculate outstanding bills
    allBills.forEach(bill => {
        if (bill.status && bill.status.toLowerCase() !== 'paid') {
            totalOutstanding += parseFloat(bill.amount) || 0;
        }
    });

    // Calculate total revenue from payments
    allPayments.forEach(payment => {
        if (payment.status && payment.status.toLowerCase() === 'success') {
            totalRevenue += parseFloat(payment.amount) || 0;
        }
    });

    // Update DOM
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRevenue').textContent = `N$ ${totalRevenue.toFixed(2)}`;
    document.getElementById('totalOutstandingAdmin').textContent = `N$ ${totalOutstanding.toFixed(2)}`;
    document.getElementById('totalPayments').textContent = allPayments.length;
}

/**
 * Load users table
 */
function loadUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    allUsers.forEach(user => {
        // Calculate outstanding amount for this user
        let outstanding = 0;
        allBills.forEach(bill => {
            if (bill.accountNumber === user.accountNumber &&
                bill.status && bill.status.toLowerCase() !== 'paid') {
                outstanding += parseFloat(bill.amount) || 0;
            }
        });

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.accountNumber}</td>
            <td>${user.name}</td>
            <td>${user.address || 'N/A'}</td>
            <td>${user.propertyType || 'Residential'}</td>
            <td>N$ ${outstanding.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewUserDetails('${user.accountNumber}')">View</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Search users
 */
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * Load bills table
 */
function loadBillsTable() {
    const tbody = document.getElementById('billsTableBody');
    tbody.innerHTML = '';

    allBills.forEach(bill => {
        // Find user for this bill
        const user = allUsers.find(u => u.accountNumber === bill.accountNumber);
        const userName = user ? user.name : 'Unknown';

        const statusLower = (bill.status || '').toLowerCase();
        let statusClass = 'due-soon';
        let statusText = 'Due Soon';

        if (statusLower === 'paid') {
            statusClass = 'paid';
            statusText = 'Paid';
        } else if (statusLower === 'overdue') {
            statusClass = 'overdue';
            statusText = 'Overdue';
        }

        const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.accountNumber}</td>
            <td>${userName}</td>
            <td>${bill.service}</td>
            <td>N$ ${parseFloat(bill.amount || 0).toFixed(2)}</td>
            <td>${dueDate}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                ${statusLower !== 'paid' ? `<button class="btn btn-primary" onclick="markAsPaid(${bill.id})">Mark Paid</button>` : '<span style="color: var(--success);">✓ Paid</span>'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Filter bills
 */
function filterBills() {
    const serviceFilter = document.getElementById('serviceFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#billsTableBody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        const service = cells[2].textContent.toLowerCase();
        const status = cells[5].textContent.toLowerCase();

        let showService = serviceFilter === 'all' || service.includes(serviceFilter);
        let showStatus = statusFilter === 'all' || status.includes(statusFilter);

        row.style.display = (showService && showStatus) ? '' : 'none';
    });
}

/**
 * Mark bill as paid
 */
async function markAsPaid(billId) {
    if (confirm(`Mark this bill as paid?`)) {
        try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/api/bills/${billId}/pay`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark bill as paid');
            }

            // Reload data
            await loadAdminDashboard();
            alert('Bill marked as paid successfully!');
        } catch (error) {
            console.error('Error marking bill as paid:', error);
            alert('Error marking bill as paid. Please try again.');
        }
    }
}

/**
 * Load reports
 */
// Global chart instances
let revenueByServiceChart = null;
let monthlyTrendsChart = null;

function loadReports() {
    let waterRevenue = 0;
    let electricityRevenue = 0;
    let ratesRevenue = 0;
    let refuseRevenue = 0;

    // Calculate revenue by service from payments
    allPayments.forEach(payment => {
        if (payment.status && payment.status.toLowerCase() === 'success') {
            const amount = parseFloat(payment.amount) || 0;
            const service = (payment.service || '').toLowerCase();

            if (service === 'water') waterRevenue += amount;
            else if (service === 'electricity') electricityRevenue += amount;
            else if (service === 'property rates') ratesRevenue += amount;
            else if (service === 'refuse collection') refuseRevenue += amount;
        }
    });

    document.getElementById('waterRevenue').textContent = `N$ ${waterRevenue.toFixed(2)}`;
    document.getElementById('electricityRevenue').textContent = `N$ ${electricityRevenue.toFixed(2)}`;
    document.getElementById('ratesRevenue').textContent = `N$ ${ratesRevenue.toFixed(2)}`;
    document.getElementById('refuseRevenue').textContent = `N$ ${refuseRevenue.toFixed(2)}`;

    // Render charts
    renderRevenueByServiceChart(waterRevenue, electricityRevenue, ratesRevenue, refuseRevenue);
    renderMonthlyTrendsChart();
}

/**
 * Render Revenue by Service Pie Chart
 */
function renderRevenueByServiceChart(water, electricity, rates, refuse) {
    const ctx = document.getElementById('revenueByServiceChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (revenueByServiceChart) {
        revenueByServiceChart.destroy();
    }

    revenueByServiceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Water', 'Electricity', 'Property Rates', 'Refuse Collection'],
            datasets: [{
                data: [water, electricity, rates, refuse],
                backgroundColor: [
                    '#4A90E2',  // Blue for Water
                    '#FFB81C',  // Gold for Electricity
                    '#4A7C59',  // Green for Property Rates
                    '#E74C3C'   // Red for Refuse
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: N$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render Monthly Trends Line Chart
 */
function renderMonthlyTrendsChart() {
    const ctx = document.getElementById('monthlyTrendsChart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (monthlyTrendsChart) {
        monthlyTrendsChart.destroy();
    }

    // Get last 6 months of data
    const monthlyData = calculateMonthlyRevenue();

    monthlyTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: 'Water',
                    data: monthlyData.water,
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Electricity',
                    data: monthlyData.electricity,
                    borderColor: '#FFB81C',
                    backgroundColor: 'rgba(255, 184, 28, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Property Rates',
                    data: monthlyData.rates,
                    borderColor: '#4A7C59',
                    backgroundColor: 'rgba(74, 124, 89, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Refuse',
                    data: monthlyData.refuse,
                    borderColor: '#E74C3C',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: N$ ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'N$ ' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Calculate monthly revenue for the last 6 months
 */
function calculateMonthlyRevenue() {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const waterData = [];
    const electricityData = [];
    const ratesData = [];
    const refuseData = [];

    // Get last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }

    // Calculate revenue for each month
    months.forEach((month, index) => {
        let water = 0, electricity = 0, rates = 0, refuse = 0;

        allPayments.forEach(payment => {
            if (payment.status && payment.status.toLowerCase() === 'success' && payment.createdAt) {
                const paymentDate = new Date(payment.createdAt);
                const targetDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

                if (paymentDate.getMonth() === targetDate.getMonth() &&
                    paymentDate.getFullYear() === targetDate.getFullYear()) {
                    const amount = parseFloat(payment.amount) || 0;
                    const service = (payment.service || '').toLowerCase();

                    if (service === 'water') water += amount;
                    else if (service === 'electricity') electricity += amount;
                    else if (service === 'property rates') rates += amount;
                    else if (service === 'refuse collection') refuse += amount;
                }
            }
        });

        waterData.push(water);
        electricityData.push(electricity);
        ratesData.push(rates);
        refuseData.push(refuse);
    });

    return {
        labels: months,
        water: waterData,
        electricity: electricityData,
        rates: ratesData,
        refuse: refuseData
    };
}

/**
 * Update charts when period changes
 */
function updateCharts() {
    loadReports();
}

/**
 * Load transactions
 */
function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';

    // Sort payments by date (most recent first) and take latest 10
    const recentPayments = [...allPayments]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

    recentPayments.forEach(payment => {
        const date = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${payment.accountNumber}</td>
            <td>${payment.service}</td>
            <td>N$ ${parseFloat(payment.amount || 0).toFixed(2)}</td>
            <td>${payment.paymentReference || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Switch admin tabs
 */
function switchAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.remove('hidden');

    // Add active class to clicked tab
    event.target.classList.add('active');
}

/**
 * View user details
 */
function viewUserDetails(accountNumber) {
    const user = allUsers.find(u => u.accountNumber === accountNumber);
    if (!user) {
        alert('User not found');
        return;
    }

    // Get user's bills
    const userBills = allBills.filter(b => b.accountNumber === accountNumber);

    let billDetails = '';
    userBills.forEach(bill => {
        const status = bill.status || 'Unknown';
        billDetails += `\n${bill.service}: N$ ${parseFloat(bill.amount || 0).toFixed(2)} - ${status}`;
    });

    if (billDetails === '') {
        billDetails = '\nNo bills found';
    }

    alert(`User Details:\n\nAccount: ${accountNumber}\nName: ${user.name}\nEmail: ${user.email || 'N/A'}\nAddress: ${user.address || 'N/A'}\nProperty Type: ${user.propertyType || 'N/A'}\n\nBills:${billDetails}`);
}

/**
 * Show add user modal
 */
function showAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
}

/**
 * Close add user modal
 */
function closeAddUserModal() {
    document.getElementById('addUserModal').classList.add('hidden');
    document.getElementById('addUserForm').reset();
}

/**
 * Handle add user form submission
 */
document.addEventListener('DOMContentLoaded', function() {
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const accountNumber = document.getElementById('newAccountNumber').value;
            const name = document.getElementById('newUserName').value;
            const address = document.getElementById('newUserAddress').value;
            const propertyType = document.getElementById('newPropertyType').value;
            const password = document.getElementById('newUserPassword').value;
            const email = `${accountNumber}@okahandja.gov.na`;

            try {
                const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                const response = await fetch(`${API_BASE_URL}/api/users`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        accountNumber,
                        email,
                        password,
                        name,
                        firstName: name.split(' ')[0],
                        address,
                        propertyType,
                        role: 'customer'
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add user');
                }

                alert(`User ${name} added successfully!`);

                // Reload data and close modal
                await loadAdminDashboard();
                closeAddUserModal();
            } catch (error) {
                console.error('Error adding user:', error);
                alert(error.message || 'Error adding user. Please try again.');
            }
        });
    }
});

/**
 * Export bills data to CSV
 */
function exportBills() {
    // Create CSV header
    let csv = 'Account Number,Account Holder,Service,Amount (N$),Due Date,Status\n';

    // Add bill data rows
    allBills.forEach(bill => {
        const user = allUsers.find(u => u.accountNumber === bill.accountNumber);
        const userName = user ? user.name : 'Unknown';
        const statusLower = (bill.status || '').toLowerCase();
        const statusText = statusLower === 'paid' ? 'Paid' : statusLower === 'overdue' ? 'Overdue' : 'Due Soon';
        const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';

        csv += `${bill.accountNumber},${userName},${bill.service},${parseFloat(bill.amount || 0).toFixed(2)},${dueDate},${statusText}\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `Okahandja_Bills_Export_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Bills exported successfully to CSV file!');
}

/**
 * Export bills as PDF report
 */
function exportBillsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 4, 40);
    doc.text('OKAHANDJA MUNICIPALITY', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Bills Report', 105, yPos, { align: 'center' });

    yPos += 5;
    doc.setDrawColor(0, 4, 40);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;

    // Report date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);

    yPos += 10;

    // Statistics
    doc.setFontSize(12);
    doc.setTextColor(0, 4, 40);
    doc.text('Summary Statistics', 20, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Accounts: ${allUsers.length}`, 20, yPos);
    doc.text(`Total Revenue: ${document.getElementById('totalRevenue').textContent}`, 120, yPos);

    yPos += 6;
    doc.text(`Outstanding: ${document.getElementById('totalOutstandingAdmin').textContent}`, 20, yPos);
    doc.text(`Total Payments: ${allPayments.length}`, 120, yPos);

    yPos += 15;

    // Bills table header
    doc.setFontSize(12);
    doc.setTextColor(0, 4, 40);
    doc.text('Bills Breakdown', 20, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Account', 20, yPos);
    doc.text('Name', 45, yPos);
    doc.text('Service', 85, yPos);
    doc.text('Amount', 115, yPos);
    doc.text('Due Date', 145, yPos);
    doc.text('Status', 175, yPos);
    doc.setFont(undefined, 'normal');

    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(20, yPos, 190, yPos);

    yPos += 5;

    // Bills data
    allBills.forEach(bill => {
        const user = allUsers.find(u => u.accountNumber === bill.accountNumber);
        const userName = user ? user.name.substring(0, 15) : 'Unknown';
        const statusLower = (bill.status || '').toLowerCase();
        const statusText = statusLower === 'paid' ? 'Paid' : statusLower === 'overdue' ? 'Overdue' : 'Due Soon';
        const dueDate = bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A';

        if (yPos > 270) {
            doc.addPage();
            yPos = 20;

            // Repeat header on new page
            doc.setFont(undefined, 'bold');
            doc.text('Account', 20, yPos);
            doc.text('Name', 45, yPos);
            doc.text('Service', 85, yPos);
            doc.text('Amount', 115, yPos);
            doc.text('Due Date', 145, yPos);
            doc.text('Status', 175, yPos);
            doc.setFont(undefined, 'normal');

            yPos += 5;
            doc.line(20, yPos, 190, yPos);
            yPos += 5;
        }

        // Set color based on status
        if (statusLower === 'overdue') {
            doc.setTextColor(220, 53, 69);
        } else if (statusLower === 'paid') {
            doc.setTextColor(40, 167, 69);
        } else {
            doc.setTextColor(0, 0, 0);
        }

        doc.text(bill.accountNumber, 20, yPos);
        doc.text(userName, 45, yPos);
        doc.text(bill.service.substring(0, 15), 85, yPos);
        doc.text(`N$ ${parseFloat(bill.amount || 0).toFixed(2)}`, 115, yPos);
        doc.text(dueDate, 145, yPos);
        doc.text(statusText, 175, yPos);

        doc.setTextColor(0, 0, 0);
        yPos += 6;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('For queries, contact: support@okahandja.gov.na | Tel: +264 62 503 XXX', 105, 280, { align: 'center' });
    doc.text('Generated with Claude Code', 105, 285, { align: 'center' });

    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`Okahandja_Bills_Report_${timestamp}.pdf`);

    alert('✅ Bills report exported successfully to PDF!');
}

/**
 * Export revenue reports as CSV
 */
function exportReportsCSV() {
    // Calculate revenue by service
    let waterRevenue = 0;
    let electricityRevenue = 0;
    let ratesRevenue = 0;
    let refuseRevenue = 0;

    allPayments.forEach(payment => {
        if (payment.status && payment.status.toLowerCase() === 'success') {
            const amount = parseFloat(payment.amount) || 0;
            const service = (payment.service || '').toLowerCase();

            if (service === 'water') waterRevenue += amount;
            else if (service === 'electricity') electricityRevenue += amount;
            else if (service === 'property rates') ratesRevenue += amount;
            else if (service === 'refuse collection') refuseRevenue += amount;
        }
    });

    const totalRevenue = waterRevenue + electricityRevenue + ratesRevenue + refuseRevenue;

    // Create CSV header
    let csv = 'Okahandja Municipality - Revenue Report\n\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    csv += 'Service,Revenue (N$),Percentage\n';

    // Add revenue data rows
    csv += `Water,${waterRevenue.toFixed(2)},${((waterRevenue / totalRevenue) * 100).toFixed(1)}%\n`;
    csv += `Electricity,${electricityRevenue.toFixed(2)},${((electricityRevenue / totalRevenue) * 100).toFixed(1)}%\n`;
    csv += `Property Rates,${ratesRevenue.toFixed(2)},${((ratesRevenue / totalRevenue) * 100).toFixed(1)}%\n`;
    csv += `Refuse Collection,${refuseRevenue.toFixed(2)},${((refuseRevenue / totalRevenue) * 100).toFixed(1)}%\n`;
    csv += `\nTotal Revenue,${totalRevenue.toFixed(2)},100%\n\n`;

    // Add monthly breakdown
    const monthlyData = calculateMonthlyRevenue();
    csv += '\nMonthly Revenue Breakdown\n';
    csv += 'Month,Water,Electricity,Property Rates,Refuse,Total\n';

    monthlyData.labels.forEach((month, index) => {
        const water = monthlyData.water[index];
        const electricity = monthlyData.electricity[index];
        const rates = monthlyData.rates[index];
        const refuse = monthlyData.refuse[index];
        const monthTotal = water + electricity + rates + refuse;

        csv += `${month},${water.toFixed(2)},${electricity.toFixed(2)},${rates.toFixed(2)},${refuse.toFixed(2)},${monthTotal.toFixed(2)}\n`;
    });

    // Add recent transactions
    csv += '\n\nRecent Transactions (Last 20)\n';
    csv += 'Date,Account Number,Service,Amount (N$),Reference\n';

    const recentPayments = [...allPayments]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);

    recentPayments.forEach(payment => {
        const date = payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A';
        csv += `${date},${payment.accountNumber},${payment.service},${parseFloat(payment.amount || 0).toFixed(2)},${payment.paymentReference || 'N/A'}\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10);

    link.setAttribute('href', url);
    link.setAttribute('download', `Okahandja_Revenue_Report_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Revenue report exported successfully to CSV file!');
}

/**
 * Export revenue reports as PDF
 */
function exportReportsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 4, 40);
    doc.text('OKAHANDJA MUNICIPALITY', 105, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Revenue & Analytics Report', 105, yPos, { align: 'center' });

    yPos += 5;
    doc.setDrawColor(0, 4, 40);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;

    // Report date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);

    yPos += 15;

    // Calculate revenue by service
    let waterRevenue = 0;
    let electricityRevenue = 0;
    let ratesRevenue = 0;
    let refuseRevenue = 0;

    allPayments.forEach(payment => {
        if (payment.status && payment.status.toLowerCase() === 'success') {
            const amount = parseFloat(payment.amount) || 0;
            const service = (payment.service || '').toLowerCase();

            if (service === 'water') waterRevenue += amount;
            else if (service === 'electricity') electricityRevenue += amount;
            else if (service === 'property rates') ratesRevenue += amount;
            else if (service === 'refuse collection') refuseRevenue += amount;
        }
    });

    const totalRevenue = waterRevenue + electricityRevenue + ratesRevenue + refuseRevenue;

    // Revenue Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 4, 40);
    doc.text('Revenue Summary', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Revenue breakdown table
    const revenueData = [
        { service: 'Water', amount: waterRevenue, color: [74, 144, 226] },
        { service: 'Electricity', amount: electricityRevenue, color: [255, 184, 28] },
        { service: 'Property Rates', amount: ratesRevenue, color: [74, 124, 89] },
        { service: 'Refuse Collection', amount: refuseRevenue, color: [231, 76, 60] }
    ];

    revenueData.forEach(item => {
        const percentage = ((item.amount / totalRevenue) * 100).toFixed(1);

        // Color indicator
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.rect(20, yPos - 3, 4, 4, 'F');

        doc.text(item.service, 30, yPos);
        doc.text(`N$ ${item.amount.toFixed(2)}`, 100, yPos);
        doc.text(`${percentage}%`, 160, yPos);

        yPos += 7;
    });

    yPos += 5;
    doc.setDrawColor(0, 4, 40);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    yPos += 7;

    doc.setFont(undefined, 'bold');
    doc.text('Total Revenue', 30, yPos);
    doc.text(`N$ ${totalRevenue.toFixed(2)}`, 100, yPos);
    doc.text('100%', 160, yPos);
    doc.setFont(undefined, 'normal');

    yPos += 15;

    // Statistics
    doc.setFontSize(14);
    doc.setTextColor(0, 4, 40);
    doc.text('Key Metrics', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`Total Users: ${allUsers.length}`, 20, yPos);
    doc.text(`Total Payments: ${allPayments.length}`, 110, yPos);

    yPos += 7;
    doc.text(`Outstanding Bills: ${document.getElementById('totalOutstandingAdmin').textContent}`, 20, yPos);
    doc.text(`Payments This Month: ${document.getElementById('totalPayments').textContent}`, 110, yPos);

    yPos += 15;

    // Monthly trends section
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 4, 40);
    doc.text('Monthly Revenue Trends', 20, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Month', 20, yPos);
    doc.text('Water', 60, yPos);
    doc.text('Electricity', 90, yPos);
    doc.text('Rates', 125, yPos);
    doc.text('Refuse', 150, yPos);
    doc.text('Total', 175, yPos);
    doc.setFont(undefined, 'normal');

    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(20, yPos, 190, yPos);

    yPos += 5;

    const monthlyData = calculateMonthlyRevenue();
    monthlyData.labels.forEach((month, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        const water = monthlyData.water[index];
        const electricity = monthlyData.electricity[index];
        const rates = monthlyData.rates[index];
        const refuse = monthlyData.refuse[index];
        const monthTotal = water + electricity + rates + refuse;

        doc.text(month, 20, yPos);
        doc.text(water.toFixed(0), 60, yPos);
        doc.text(electricity.toFixed(0), 90, yPos);
        doc.text(rates.toFixed(0), 125, yPos);
        doc.text(refuse.toFixed(0), 150, yPos);
        doc.setFont(undefined, 'bold');
        doc.text(`N$ ${monthTotal.toFixed(0)}`, 175, yPos);
        doc.setFont(undefined, 'normal');

        yPos += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Okahandja Municipality © 2025 - Confidential Report', 105, 285, { align: 'center' });

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`Okahandja_Revenue_Report_${timestamp}.pdf`);

    alert('✅ Revenue report exported successfully to PDF file!');
}

/**
 * Save settings
 */
function saveSettings() {
    alert('Settings saved successfully! In a production environment, these would be saved to a database.');
}
