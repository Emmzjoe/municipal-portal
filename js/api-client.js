/* ===================================
   API CLIENT MODULE
   Handles all communication with backend API
   =================================== */

/**
 * API Client Configuration
 */
const API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
};

/**
 * CSRF Token Management
 */
let csrfToken = null;

/**
 * Get CSRF token from server
 */
async function getCsrfToken() {
    if (!csrfToken) {
        try {
            const response = await fetch(`${API_CONFIG.baseURL}/csrf-token`);
            const data = await response.json();
            if (data.success) {
                csrfToken = data.data.csrfToken;
            }
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error);
        }
    }
    return csrfToken;
}

/**
 * Reset CSRF token (call after each mutation request)
 */
function resetCsrfToken() {
    csrfToken = null;
}

/**
 * Get stored authentication token
 */
function getAuthToken() {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
}

/**
 * Set authentication token
 */
function setAuthToken(token, remember = false) {
    if (remember) {
        localStorage.setItem('authToken', token);
    } else {
        sessionStorage.setItem('authToken', token);
    }
}

/**
 * Clear authentication token
 */
function clearAuthToken() {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = getAuthToken();

    const config = {
        method: options.method || 'GET',
        headers: {
            ...API_CONFIG.headers,
            ...options.headers
        }
    };

    // Add authorization header if token exists
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for mutation requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
        const csrf = await getCsrfToken();
        if (csrf) {
            config.headers['X-CSRF-Token'] = csrf;
        }
    }

    // Add body for POST/PUT/PATCH requests
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.body = JSON.stringify(options.body);
    }

    try {
        console.log('API Request:', { method: config.method, url, body: config.body });
        const response = await fetch(url, config);
        console.log('API Response status:', response.status);

        const data = await response.json();
        console.log('API Response data:', data);

        // Reset CSRF token after mutation request (tokens are single-use)
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
            resetCsrfToken();
        }

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.error?.message || 'Request failed',
                details: data.error?.details || []
            };
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        console.error('Error type:', typeof error);
        console.error('Error name:', error.name);

        // Reset CSRF token on error too
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
            resetCsrfToken();
        }

        throw error;
    }
}

/**
 * API Client Object
 */
const API = {
    // ==================== AUTHENTICATION ====================
    auth: {
        /**
         * User login
         */
        login: async (accountNumber, password, remember = false) => {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: { accountNumber, password }
            });

            if (response.success && response.data.token) {
                setAuthToken(response.data.token, remember);
                // Store user info
                sessionStorage.setItem('accountNumber', response.data.user.accountNumber);
                sessionStorage.setItem('userName', response.data.user.name);
                sessionStorage.setItem('userRole', response.data.user.role);
            }

            return response;
        },

        /**
         * User registration
         */
        register: async (userData) => {
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: userData
            });

            if (response.success && response.data.token) {
                setAuthToken(response.data.token, false);
            }

            return response;
        },

        /**
         * User logout
         */
        logout: async () => {
            try {
                await apiRequest('/auth/logout', { method: 'POST' });
            } finally {
                clearAuthToken();
                sessionStorage.clear();
                localStorage.clear();
            }
        },

        /**
         * Get current user
         */
        getCurrentUser: async () => {
            return await apiRequest('/auth/me');
        },

        /**
         * Forgot password
         */
        forgotPassword: async (email) => {
            return await apiRequest('/auth/forgot-password', {
                method: 'POST',
                body: { email }
            });
        },

        /**
         * Reset password
         */
        resetPassword: async (token, newPassword) => {
            return await apiRequest('/auth/reset-password', {
                method: 'POST',
                body: { token, newPassword }
            });
        }
    },

    // ==================== USERS ====================
    users: {
        /**
         * Get user profile
         */
        getProfile: async () => {
            return await apiRequest('/users/profile');
        },

        /**
         * Update user profile
         */
        updateProfile: async (profileData) => {
            return await apiRequest('/users/profile', {
                method: 'PUT',
                body: profileData
            });
        },

        /**
         * Change password
         */
        changePassword: async (currentPassword, newPassword) => {
            return await apiRequest('/users/change-password', {
                method: 'POST',
                body: { currentPassword, newPassword }
            });
        },

        /**
         * Get account summary
         */
        getAccountSummary: async () => {
            return await apiRequest('/users/account-summary');
        }
    },

    // ==================== BILLS ====================
    bills: {
        /**
         * Get all bills
         */
        getAll: async () => {
            return await apiRequest('/bills');
        },

        /**
         * Get bill by ID
         */
        getById: async (billId) => {
            return await apiRequest(`/bills/${billId}`);
        },

        /**
         * Get bills by service
         */
        getByService: async (serviceName) => {
            return await apiRequest(`/bills/service/${serviceName}`);
        },

        /**
         * Get outstanding summary
         */
        getOutstandingSummary: async () => {
            return await apiRequest('/bills/outstanding/summary');
        },

        /**
         * Get billing history
         */
        getHistory: async (page = 1, limit = 20) => {
            return await apiRequest(`/bills/history/all?page=${page}&limit=${limit}`);
        }
    },

    // ==================== PAYMENTS ====================
    payments: {
        /**
         * Process payment
         */
        process: async (paymentData) => {
            return await apiRequest('/payments/process', {
                method: 'POST',
                body: paymentData
            });
        },

        /**
         * Get payment history
         */
        getHistory: async (page = 1, limit = 20) => {
            return await apiRequest(`/payments/history?page=${page}&limit=${limit}`);
        },

        /**
         * Get payment by ID
         */
        getById: async (paymentId) => {
            return await apiRequest(`/payments/${paymentId}`);
        },

        /**
         * Verify payment
         */
        verify: async (reference) => {
            return await apiRequest('/payments/verify', {
                method: 'POST',
                body: { reference }
            });
        },

        /**
         * Get available payment methods
         */
        getMethods: async () => {
            return await apiRequest('/payments/methods/available');
        },

        /**
         * Get payment receipt
         */
        getReceipt: async (reference) => {
            return await apiRequest(`/payments/receipts/${reference}`);
        }
    },

    // ==================== STATEMENTS ====================
    statements: {
        /**
         * Get all statements
         */
        getAll: async () => {
            return await apiRequest('/statements');
        },

        /**
         * Get statement by ID
         */
        getById: async (statementId) => {
            return await apiRequest(`/statements/${statementId}`);
        },

        /**
         * Download statement
         */
        download: async (statementId) => {
            return await apiRequest(`/statements/${statementId}/download`);
        },

        /**
         * Get yearly statements
         */
        getByYear: async (year) => {
            return await apiRequest(`/statements/year/${year}`);
        },

        /**
         * Get annual summary
         */
        getAnnualSummary: async (year) => {
            return await apiRequest(`/statements/summary/annual?year=${year}`);
        },

        /**
         * Email statement
         */
        email: async (statementId, email) => {
            return await apiRequest('/statements/email', {
                method: 'POST',
                body: { statementId, email }
            });
        }
    },

    // ==================== SERVICE REQUESTS ====================
    serviceRequests: {
        /**
         * Get all service requests
         */
        getAll: async (status = null) => {
            const url = status ? `/service-requests?status=${status}` : '/service-requests';
            return await apiRequest(url);
        },

        /**
         * Get service request by ID
         */
        getById: async (requestId) => {
            return await apiRequest(`/service-requests/${requestId}`);
        },

        /**
         * Create service request
         */
        create: async (requestData) => {
            return await apiRequest('/service-requests', {
                method: 'POST',
                body: requestData
            });
        },

        /**
         * Update service request
         */
        update: async (requestId, requestData) => {
            return await apiRequest(`/service-requests/${requestId}`, {
                method: 'PUT',
                body: requestData
            });
        },

        /**
         * Cancel service request
         */
        cancel: async (requestId) => {
            return await apiRequest(`/service-requests/${requestId}`, {
                method: 'DELETE'
            });
        },

        /**
         * Add comment to service request
         */
        addComment: async (requestId, comment) => {
            return await apiRequest(`/service-requests/${requestId}/comment`, {
                method: 'POST',
                body: { comment }
            });
        },

        /**
         * Get service request categories
         */
        getCategories: async () => {
            return await apiRequest('/service-requests/categories/list');
        }
    },

    // ==================== NOTIFICATIONS ====================
    notifications: {
        /**
         * Get all notifications
         */
        getAll: async (page = 1, limit = 20, unreadOnly = false) => {
            return await apiRequest(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
        },

        /**
         * Get notification by ID
         */
        getById: async (notificationId) => {
            return await apiRequest(`/notifications/${notificationId}`);
        },

        /**
         * Mark notification as read
         */
        markAsRead: async (notificationId) => {
            return await apiRequest(`/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
        },

        /**
         * Mark all notifications as read
         */
        markAllAsRead: async () => {
            return await apiRequest('/notifications/read-all', {
                method: 'PUT'
            });
        },

        /**
         * Delete notification
         */
        delete: async (notificationId) => {
            return await apiRequest(`/notifications/${notificationId}`, {
                method: 'DELETE'
            });
        },

        /**
         * Get notification preferences
         */
        getPreferences: async () => {
            return await apiRequest('/notifications/preferences/settings');
        },

        /**
         * Update notification preferences
         */
        updatePreferences: async (preferences) => {
            return await apiRequest('/notifications/preferences/settings', {
                method: 'PUT',
                body: preferences
            });
        },

        /**
         * Get notification statistics
         */
        getStats: async () => {
            return await apiRequest('/notifications/stats/summary');
        }
    },

    // ==================== REPORTS ====================
    reports: {
        /**
         * Get user summary report
         */
        getUserSummary: async (year) => {
            return await apiRequest(`/reports/user-summary?year=${year}`);
        },

        /**
         * Get billing history report
         */
        getBillingHistory: async (startDate, endDate, service = null) => {
            let url = `/reports/billing-history?startDate=${startDate}&endDate=${endDate}`;
            if (service) url += `&service=${service}`;
            return await apiRequest(url);
        },

        /**
         * Get payment history report
         */
        getPaymentHistory: async (startDate, endDate) => {
            return await apiRequest(`/reports/payment-history?startDate=${startDate}&endDate=${endDate}`);
        },

        /**
         * Get consumption report
         */
        getConsumption: async (service, period = 'year') => {
            return await apiRequest(`/reports/consumption?service=${service}&period=${period}`);
        },

        /**
         * Export report
         */
        export: async (reportType, format, startDate, endDate) => {
            return await apiRequest('/reports/export', {
                method: 'POST',
                body: { reportType, format, startDate, endDate }
            });
        }
    },

    // ==================== SETTINGS ====================
    settings: {
        /**
         * Get user settings
         */
        getUserSettings: async () => {
            return await apiRequest('/settings/user');
        },

        /**
         * Update user settings
         */
        updateUserSettings: async (settings) => {
            return await apiRequest('/settings/user', {
                method: 'PUT',
                body: settings
            });
        },

        /**
         * Get FAQs
         */
        getFAQs: async (category = null) => {
            const url = category ? `/settings/faqs?category=${category}` : '/settings/faqs';
            return await apiRequest(url);
        }
    }
};

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return !!getAuthToken();
}

/**
 * Get current user role
 */
function getUserRole() {
    return sessionStorage.getItem('userRole') || 'customer';
}

/**
 * Check if user has admin role
 */
function isAdmin() {
    return getUserRole() === 'admin';
}

/**
 * Check if user has staff role or higher
 */
function isStaff() {
    const role = getUserRole();
    return role === 'admin' || role === 'staff';
}
