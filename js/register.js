/* ===================================
   REGISTRATION MODULE
   =================================== */

/**
 * Show registration modal
 */
function showRegisterModal() {
    document.getElementById('registerModal').classList.remove('hidden');
    document.getElementById('registerForm').reset();
    document.getElementById('registerError').classList.add('hidden');
    document.getElementById('registerSuccess').classList.add('hidden');
    resetPasswordStrength();
}

/**
 * Close registration modal
 */
function closeRegisterModal() {
    document.getElementById('registerModal').classList.add('hidden');
    document.getElementById('registerForm').reset();
    resetPasswordStrength();
}

/**
 * Reset password strength indicator
 */
function resetPasswordStrength() {
    const strengthBar = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');

    strengthBar.className = 'strength-bar-fill';
    strengthBar.style.width = '0%';
    strengthText.textContent = 'Password strength: Weak';
    strengthText.className = '';
}

/**
 * Calculate password strength
 * @param {string} password - The password to evaluate
 * @returns {Object} Strength info
 */
function calculatePasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    // Calculate strength score
    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 20;
    if (checks.lowercase) strength += 20;
    if (checks.number) strength += 20;
    if (checks.special) strength += 20;

    // Determine strength level
    let level = 'weak';
    let text = 'Weak';
    if (strength >= 80) {
        level = 'strong';
        text = 'Strong';
    } else if (strength >= 60) {
        level = 'medium';
        text = 'Medium';
    }

    return { strength, level, text, checks };
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength() {
    const password = document.getElementById('regPassword').value;
    const strengthBar = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');

    if (!password) {
        resetPasswordStrength();
        return;
    }

    const { strength, level, text } = calculatePasswordStrength(password);

    // Update strength bar
    strengthBar.className = `strength-bar-fill ${level}`;
    strengthBar.style.width = `${strength}%`;

    // Update strength text
    strengthText.textContent = `Password strength: ${text}`;
    strengthText.className = level;
}

/**
 * Validate registration form
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
function validateRegistrationForm(formData) {
    const errors = [];

    // Account number validation
    if (formData.accountNumber.length < 8 || formData.accountNumber.length > 50) {
        errors.push('Account number must be 8-50 characters');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }

    // Name validation
    if (formData.name.length < 2 || formData.name.length > 255) {
        errors.push('Full name must be 2-255 characters');
    }

    // First name validation
    if (!formData.firstName.trim()) {
        errors.push('First name is required');
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        errors.push('Please enter a valid phone number (10-15 digits)');
    }

    // Address validation (optional but check length if provided)
    if (formData.address && formData.address.length > 500) {
        errors.push('Address must be less than 500 characters');
    }

    // Password validation
    const { checks } = calculatePasswordStrength(formData.password);
    if (!checks.length) {
        errors.push('Password must be at least 8 characters');
    }
    if (!checks.uppercase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!checks.lowercase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!checks.number) {
        errors.push('Password must contain at least one number');
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }

    // Terms and conditions
    if (!formData.acceptTerms) {
        errors.push('You must accept the Terms of Service and Privacy Policy');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showRegisterError(message) {
    const errorDiv = document.getElementById('registerError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    document.getElementById('registerSuccess').classList.add('hidden');
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showRegisterSuccess(message) {
    const successDiv = document.getElementById('registerSuccess');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    document.getElementById('registerError').classList.add('hidden');
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submit event
 */
async function handleRegisterSubmit(e) {
    e.preventDefault();

    // Hide previous messages
    document.getElementById('registerError').classList.add('hidden');
    document.getElementById('registerSuccess').classList.add('hidden');

    // Collect form data
    const formData = {
        accountNumber: document.getElementById('regAccountNumber').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        name: document.getElementById('regName').value.trim(),
        firstName: document.getElementById('regFirstName').value.trim(),
        phone: document.getElementById('regPhone').value.trim().replace(/\s/g, ''),
        address: document.getElementById('regAddress').value.trim(),
        propertyType: document.getElementById('regPropertyType').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value,
        acceptTerms: document.getElementById('regTerms').checked
    };

    // Validate form
    const validation = validateRegistrationForm(formData);
    if (!validation.valid) {
        showRegisterError(validation.errors.join('. '));
        return;
    }

    // Disable submit button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        // Call API to register user
        const response = await API.auth.register({
            accountNumber: formData.accountNumber,
            email: formData.email,
            password: formData.password,
            name: formData.name,
            firstName: formData.firstName,
            phone: formData.phone,
            address: formData.address || undefined,
            propertyType: formData.propertyType
        });

        if (response.success) {
            // Show success message
            showRegisterSuccess(response.message || 'Registration successful! Redirecting to dashboard...');

            // Wait 2 seconds then login automatically
            setTimeout(() => {
                // Store user data
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('accountNumber', response.data.user.accountNumber);
                sessionStorage.setItem('userName', response.data.user.name);
                sessionStorage.setItem('userFirstName', response.data.user.firstName);

                // Update dashboard with user info
                document.getElementById('userName').textContent = response.data.user.name;
                document.getElementById('userAccount').textContent = 'A/C: ' + response.data.user.accountNumber;
                document.getElementById('welcomeName').textContent = response.data.user.firstName;
                document.getElementById('dashAccountNumber').textContent = response.data.user.accountNumber;

                // Get initials for avatar
                const initials = response.data.user.name.split(' ').map(n => n[0]).join('');
                document.getElementById('userAvatar').textContent = initials;

                // Close modal and switch to dashboard
                closeRegisterModal();
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('dashboardScreen').classList.remove('hidden');
            }, 2000);

        } else {
            // Show error from API
            showRegisterError(response.error?.message || 'Registration failed. Please try again.');
        }

    } catch (error) {
        console.error('Registration error:', error);

        // Provide more detailed error message
        let errorMessage = 'An error occurred during registration. ';

        if (error.message) {
            errorMessage += error.message;
        } else if (!navigator.onLine) {
            errorMessage += 'Please check your internet connection.';
        } else {
            errorMessage += 'Please ensure the backend server is running and the database is configured.';
        }

        showRegisterError(errorMessage);
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Initialize registration module
 */
function initializeRegistration() {
    // Add form submit listener
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    // Add password strength listener
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }

    // Add password match indicator
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = document.getElementById('regPassword').value;
            const confirmPassword = confirmPasswordInput.value;

            if (confirmPassword && password !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }

    // Close modal on overlay click
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                closeRegisterModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !registerModal.classList.contains('hidden')) {
            closeRegisterModal();
        }
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRegistration);
} else {
    initializeRegistration();
}
