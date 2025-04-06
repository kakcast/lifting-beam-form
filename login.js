document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const passwordField = document.getElementById('password');
    const passwordToggle = document.querySelector('.password-toggle');
    
    passwordToggle.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Toggle eye icon
        const eyeIcon = this.querySelector('i');
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Basic validation
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }
        
        // Here you would normally send the login request to your server
        console.log('Login attempt:', { username, password, remember });
        
        // For demonstration purposes, simulate successful login
        // Replace this with your actual authentication logic
        setTimeout(function() {
            // Store user info if remember is checked
            if (remember) {
                localStorage.setItem('rememberedUser', username);
                localStorage.setItem('isLoggedIn', 'true');
            } else {
                localStorage.removeItem('rememberedUser');
                sessionStorage.setItem('isLoggedIn', 'true');
            }
            
            // Redirect to dashboard after successful login
            window.location.href = 'index.html';
        }, 1000);
    });
    
    // Social login buttons
    const googleBtn = document.querySelector('.social-btn.google');
    const microsoftBtn = document.querySelector('.social-btn.microsoft');
    
    googleBtn.addEventListener('click', function() {
        console.log('Google login clicked');
        // Implement Google OAuth login
        // For demonstration, we'll just log in
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    });
    
    microsoftBtn.addEventListener('click', function() {
        console.log('Microsoft login clicked');
        // Implement Microsoft OAuth login
        // For demonstration, we'll just log in
        sessionStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    });
    
    // Check for remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
    
    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'index.html';
    }
});
