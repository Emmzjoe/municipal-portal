/* ===================================
   AUTHENTICATION MODULE
   =================================== */

// Session timeout configuration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
let sessionTimer = null;
let lastActivityTime = Date.now();

/**
 * Initialize session management
 */
function initSessionManagement() {
    // Set up activity listeners
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetSessionTimer, true);
    });

    // Start initial timer
    resetSessionTimer();

    // Check for expired sessions on page load
    checkSessionExpiry();
}

/**
 * Reset session timeout timer
 */
function resetSessionTimer() {
    lastActivityTime = Date.now();

    // Clear existing timer
    if (sessionTimer) {
        clearTimeout(sessionTimer);
    }

    // Set new timer
    sessionTimer = setTimeout(() => {
        handleSessionTimeout();
    }, SESSION_TIMEOUT);

    // Store last activity time
    sessionStorage.setItem('lastActivity', lastActivityTime.toString());
}

/**
 * Check if session has expired
 */
function checkSessionExpiry() {
    const lastActivity = sessionStorage.getItem('lastActivity');
    if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceActivity > SESSION_TIMEOUT) {
            handleSessionTimeout();
        }
    }
}

/**
 * Handle session timeout
 */
function handleSessionTimeout() {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        alert('Your session has expired due to inactivity. Please log in again.');
        logout();
    }
}

// Initialize session management when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSessionManagement);
} else {
    initSessionManagement();
}

// Login form submission handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;

    try {
        // Use API for authentication
        const response = await API.auth.login(accountNumber, password, rememberMe);

        console.log('Login response:', response);

        if (response.success && response.data && response.data.user) {
            const user = response.data.user;

            // Check if admin or regular user
            if (user.role === 'admin') {
                loginAdmin(user);
            } else {
                login(user);
            }
        } else {
            console.error('Login failed: Invalid response structure', response);
            alert('Invalid account number or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error details:', error);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        alert('Invalid account number or password. Please try again.');
    }
});

/**
 * Handle user login
 * @param {object} user - The user object from API
 */
function login(user) {
    // Store session
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('accountNumber', user.accountNumber);
    sessionStorage.setItem('userName', user.name);
    sessionStorage.setItem('userFirstName', user.firstName);

    // Update dashboard with user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAccount').textContent = 'A/C: ' + user.accountNumber;
    document.getElementById('welcomeName').textContent = user.firstName;
    document.getElementById('dashAccountNumber').textContent = user.accountNumber;

    // Get initials for avatar
    const initials = user.name.split(' ').map(n => n[0]).join('');
    document.getElementById('userAvatar').textContent = initials;

    // Switch screens
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
}

/**
 * Handle user logout
 */
async function logout() {
    try {
        // Call API logout endpoint
        if (typeof API !== 'undefined' && API.auth && API.auth.logout) {
            await API.auth.logout();
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear session data regardless of API call result
        sessionStorage.clear();
        localStorage.removeItem('authToken');

        // Clear session timer
        if (sessionTimer) {
            clearTimeout(sessionTimer);
            sessionTimer = null;
        }

        // Hide all dashboards
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('adminDashboardScreen').classList.add('hidden');

        // Show login screen
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('loginForm').reset();
    }
}

/**
 * Handle admin login
 * @param {object} user - The admin user object from API
 */
function loginAdmin(user) {
    // Store session
    sessionStorage.setItem('loggedIn', 'true');
    sessionStorage.setItem('role', 'admin');
    sessionStorage.setItem('accountNumber', user.accountNumber);
    sessionStorage.setItem('adminName', user.name);

    // Update admin dashboard with admin info
    document.getElementById('adminUserName').textContent = user.name;

    // Get initials for avatar
    const initials = user.name.split(' ').map(n => n[0]).join('');
    document.getElementById('adminUserAvatar').textContent = initials;

    // Switch screens
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboardScreen').classList.remove('hidden');

    // Load admin data
    if (typeof loadAdminDashboard === 'function') {
        loadAdminDashboard();
    }
}

/**
 * Handle admin logout
 */
function adminLogout() {
    sessionStorage.clear();
    document.getElementById('adminDashboardScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginForm').reset();
}

/**
 * Check if user is already logged in on page load
 */
window.addEventListener('load', function() {
    if (sessionStorage.getItem('loggedIn') === 'true') {
        const role = sessionStorage.getItem('role');
        if (role === 'admin') {
            const username = sessionStorage.getItem('username');
            loginAdmin(username);
        } else {
            const accountNumber = sessionStorage.getItem('accountNumber');
            login(accountNumber);
        }
    }
});
