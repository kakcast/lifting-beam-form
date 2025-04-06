document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const forgotPasswordLink = document.querySelector('.forgot-password');

    // Check if already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }

    // Populate remembered username
    const rememberedUser = localStorage.getItem('username');
    if (rememberedUser) {
        usernameInput.value = rememberedUser;
        rememberCheckbox.checked = true;
    }

    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;

        // Basic validation
        if (!username || !password) {
            alert('Please enter both username and password.');
            return;
        }

        // Simulated login (replace with actual authentication)
        if (username === 'admin' && password === 'password') {
            // Store login status
            if (remember) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
            } else {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
            }

            // Redirect to main page
            window.location.href = 'index.html';
        } else {
            alert('Invalid username or password');
        }
    });

    // Forgot password handler
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Please contact your system administrator to reset your password.');
    });
});
