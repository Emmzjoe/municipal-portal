/* ===================================
   ADMIN SERVICE REQUESTS MODULE
   Handles service request management for staff/admin
   =================================== */

/**
 * Fetch all service requests from API
 */
async function fetchServiceRequests() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/service-requests/all`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch service requests');
    }

    const data = await response.json();
    if (data.success) {
        allServiceRequests = data.data.serviceRequests || [];
    }
}

/**
 * Load service requests table
 */
function loadServiceRequestsTable() {
    const tbody = document.getElementById('serviceRequestsTableBody');
    if (!tbody) return;

    if (allServiceRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No service requests found</td></tr>';
        return;
    }

    tbody.innerHTML = allServiceRequests.map(request => {
        const statusClass = request.status === 'Open' ? 'due-soon' :
                           request.status === 'In Progress' ? 'due-soon' :
                           request.status === 'Resolved' ? 'paid' :
                           request.status === 'Closed' ? 'paid' : 'overdue';

        const priorityClass = request.priority === 'High' || request.priority === 'Urgent' ? 'overdue' :
                             request.priority === 'Medium' ? 'due-soon' : 'paid';

        const date = new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <tr>
                <td><strong>${request.requestId}</strong></td>
                <td>${request.accountNumber}</td>
                <td>${request.type}</td>
                <td>${request.category}</td>
                <td><span class="status-badge ${priorityClass}">${request.priority}</span></td>
                <td><span class="status-badge ${statusClass}">${request.status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewServiceRequest(${request.id})">View</button>
                    <button class="btn btn-secondary" onclick="updateServiceRequestStatus(${request.id})">Update</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Filter service requests by status and category
 */
function filterServiceRequests() {
    const statusFilter = document.getElementById('requestStatusFilter')?.value;
    const categoryFilter = document.getElementById('requestCategoryFilter')?.value;

    const filtered = allServiceRequests.filter(request => {
        const matchesStatus = !statusFilter || request.status === statusFilter;
        const matchesCategory = !categoryFilter || request.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });

    const tbody = document.getElementById('serviceRequestsTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No matching service requests</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(request => {
        const statusClass = request.status === 'Open' ? 'due-soon' :
                           request.status === 'In Progress' ? 'due-soon' :
                           request.status === 'Resolved' ? 'paid' :
                           request.status === 'Closed' ? 'paid' : 'overdue';

        const priorityClass = request.priority === 'High' || request.priority === 'Urgent' ? 'overdue' :
                             request.priority === 'Medium' ? 'due-soon' : 'paid';

        const date = new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <tr>
                <td><strong>${request.requestId}</strong></td>
                <td>${request.accountNumber}</td>
                <td>${request.type}</td>
                <td>${request.category}</td>
                <td><span class="status-badge ${priorityClass}">${request.priority}</span></td>
                <td><span class="status-badge ${statusClass}">${request.status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-primary" onclick="viewServiceRequest(${request.id})">View</button>
                    <button class="btn btn-secondary" onclick="updateServiceRequestStatus(${request.id})">Update</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * View service request details
 */
async function viewServiceRequest(requestId) {
    const request = allServiceRequests.find(r => r.id === requestId);
    if (!request) {
        alert('Service request not found');
        return;
    }

    const details = `
Service Request Details
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request ID: ${request.requestId}
Account: ${request.accountNumber}
Type: ${request.type}
Category: ${request.category}
Priority: ${request.priority}
Status: ${request.status}

Description:
${request.description}

Location:
${request.location || 'Not specified'}

Submitted: ${new Date(request.createdAt).toLocaleString()}
${request.updatedAt ? `Last Updated: ${new Date(request.updatedAt).toLocaleString()}` : ''}

${request.assignedTo ? `Assigned To: ${request.assignedTo}` : 'Not assigned'}
${request.resolutionNotes ? `\nResolution Notes:\n${request.resolutionNotes}` : ''}
    `;

    alert(details);
}

/**
 * Update service request status
 */
async function updateServiceRequestStatus(requestId) {
    const request = allServiceRequests.find(r => r.id === requestId);
    if (!request) {
        alert('Service request not found');
        return;
    }

    const newStatus = prompt(
        `Update Status for ${request.requestId}\n\nCurrent Status: ${request.status}\n\nSelect new status:\n1 - Open\n2 - In Progress\n3 - Resolved\n4 - Closed\n5 - Cancelled\n\nEnter number:`,
        request.status === 'Open' ? '1' : request.status === 'In Progress' ? '2' : request.status === 'Resolved' ? '3' : '4'
    );

    if (!newStatus) return;

    const statusMap = {
        '1': 'Open',
        '2': 'In Progress',
        '3': 'Resolved',
        '4': 'Closed',
        '5': 'Cancelled'
    };

    const selectedStatus = statusMap[newStatus];
    if (!selectedStatus) {
        alert('Invalid selection');
        return;
    }

    try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/service-requests/${requestId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: selectedStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update status');
        }

        const data = await response.json();
        if (data.success) {
            alert(`✅ Status updated to: ${selectedStatus}`);
            // Reload service requests
            await fetchServiceRequests();
            loadServiceRequestsTable();
        } else {
            alert('Failed to update status: ' + (data.error?.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating service request status:', error);
        alert('Error updating status. Please try again.');
    }
}
