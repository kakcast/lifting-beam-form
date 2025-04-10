// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember');
    
    // Check if there are stored credentials
    checkStoredCredentials();
    
    // Add form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Basic validation
        if (!validateForm()) {
            return;
        }
        
        // Get form values
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;
        
        // If "Remember Me" is checked, store the username
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        // Here you would typically send the data to a server for authentication
        // For demo purposes, we'll just log to console and show an alert
        console.log('Login attempt:', { username, password, rememberMe });
        
        // Simulate a login process
        simulateLogin(username, password);
    });
    
    // Add input validation on blur
    usernameInput.addEventListener('blur', function() {
        validateField(usernameInput, 'Please enter a username or email');
    });
    
    passwordInput.addEventListener('blur', function() {
        validateField(passwordInput, 'Please enter your password');
    });
    
    // Function to check for stored credentials
    function checkStoredCredentials() {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            usernameInput.value = rememberedUsername;
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Function to validate a single form field
    function validateField(field, errorMessage) {
        const value = field.value.trim();
        if (!value) {
            field.classList.add('error');
            showError(field, errorMessage);
            return false;
        } else {
            field.classList.remove('error');
            clearError(field);
            return true;
        }
    }
    
    // Function to validate the entire form
    function validateForm() {
        let isValid = true;
        
        if (!validateField(usernameInput, 'Please enter a username or email')) {
            isValid = false;
        }
        
        if (!validateField(passwordInput, 'Please enter your password')) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to show error message
    function showError(field, message) {
        // Remove any existing error message
        clearError(field);
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message after the field
        field.parentNode.appendChild(errorDiv);
    }
    
    // Function to clear error message
    function clearError(field) {
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Function to simulate login process
    function simulateLogin(username, password) {
        // Show loading state
        const loginButton = document.querySelector('.login-button');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;
        
        // Simulate API call delay
        setTimeout(function() {
            // Reset button
            loginButton.textContent = originalText;
            loginButton.disabled = false;
            
            // In a real application, you would check the server response
            // For demo, just show success
            alert(`Welcome back, ${username}!`);
            
            // Redirect to dashboard in a real app
            // window.location.href = 'dashboard.html';
        }, 1500);
    }
});
