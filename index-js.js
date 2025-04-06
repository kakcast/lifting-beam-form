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
            localStorage.removeItem('username');
            sessionStorage.removeItem('username');
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Display username if available
    const username = localStorage.getItem('username') || sessionStorage.getItem('username');
    const welcomeText = document.querySelector('.welcome-section h2');
    
    if (username && welcomeText) {
        welcomeText.textContent = `Welcome, ${username}!`;
    }
    
    // Handle navigation button clicks
    const actionButtons = document.querySelectorAll('.action-button');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // You can add any additional logic here before navigation
            // For example, logging the navigation, checking permissions, etc.
            console.log(`Navigating to: ${this.getAttribute('href')}`);
            
            // The actual navigation will happen through the href attribute
        });
    });
});
