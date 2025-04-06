document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get the logout link
    const logoutLink = document.querySelector('.logout-link');
    
    // Add logout functionality
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear authentication data
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('isLoggedIn');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Other functionality can be added here
    // For example, handling button clicks, loading data, etc.
});
