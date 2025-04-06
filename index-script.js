document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get elements
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Toggle sidebar
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('sidebar-collapsed');
        
        // On mobile, toggle a different class
        if (window.innerWidth <= 992) {
            sidebar.classList.toggle('active');
        }
    });
    
    // Handle responsive behavior
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('sidebar-collapsed');
            if (sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
            } else {
                sidebar.classList.remove('active');
            }
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 992 && 
            !sidebar.contains(event.target) && 
            !sidebarToggle.contains(event.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // Action buttons in the recent inspections table
    const viewButtons = document.querySelectorAll('.view-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const printButtons = document.querySelectorAll('.print-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the inspection ID from the parent row
            const row = this.closest('tr');
            const inspectionId = row.querySelector('td:first-child').textContent;
            
            // Redirect to inspection details page
            console.log('View inspection:', inspectionId);
            // window.location.href = `inspection-details.html?id=${inspectionId.replace('#', '')}`;
            alert(`Viewing inspection ${inspectionId}`);
        });
    });
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the inspection ID from the parent row
            const row = this.closest('tr');
            const inspectionId = row.querySelector('td:first-child').textContent;
            
            // Redirect to edit inspection page
            console.log('Edit inspection:', inspectionId);
            // window.location.href = `edit-inspection.html?id=${inspectionId.replace('#', '')}`;
            alert(`Editing inspection ${inspectionId}`);
        });
    });
    
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the inspection ID from the parent row
            const row = this.closest('tr');
            const inspectionId = row.querySelector('td:first-child').textContent;
            
            // Print inspection
            console.log('Print inspection:', inspectionId);
            alert(`Printing inspection ${inspectionId}`);
        });
    });
    
    // Logout functionality
    const logoutButton = document.querySelector('.sidebar-logout a');
    
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear login status
        sessionStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isLoggedIn');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
    
    // Update login script to properly set isLoggedIn
    // This is just for reference, should be in login.js
    /*
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // ... authentication logic ...
        
        // Set login status
        if (remember) {
            localStorage.setItem('isLoggedIn', 'true');
        } else {
            sessionStorage.setItem('isLoggedIn', 'true');
        }
        
        // Redirect to dashboard
        window.location.href = 'index.html';
    });
    */
});
