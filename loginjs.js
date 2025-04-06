document.addEventListener('DOMContentLoaded', function() {
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
        
        // For demonstration purposes, we're using simple client-side authentication
        // In a real application, this would be handled securely on the server
        
        // Store authentication status
        if (remember) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
        } else {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
        }
        
        // Redirect to main page
        window.location.href = 'index.html';
    });
    
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
    
    // Populate remembered username if exists
    const rememberedUser = localStorage.getItem('username');
    if (rememberedUser && document.getElementById('username')) {
        document.getElementById('username').value = rememberedUser;
        if (document.getElementById('remember')) {
            document.getElementById('remember').checked = true;
        }
    }
    
    // Handle forgot password link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Please contact your administrator to reset your password.');
        });
    }
});
