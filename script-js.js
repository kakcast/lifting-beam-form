// Initialize system on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin user if no users exist
    initializeSystem();
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up event listeners based on page type
    setupPageEventListeners();
});

// Initialize the system with default admin user if needed
function initializeSystem() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
        // Create default admin user
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        };
        
        localStorage.setItem('users', JSON.stringify([defaultAdmin]));
        console.log('Default admin user created');
    }
}

// Set up page-specific event listeners
function setupPageEventListeners() {
    // Get current page
    const currentPage = window.location.pathname;
    
    // Check for signature elements (inspection form page)
    const inspectorCanvas = document.getElementById('inspectorSignature');
    const clientCanvas = document.getElementById('clientSignature');
    
    if (inspectorCanvas && clientCanvas) {
        setupSignaturePads(inspectorCanvas, clientCanvas);
        setupFormButtons();
    }
    
    // Check for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        setupLoginForm();
    }
    
    // Check for user management form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        setupUserManagement();
    }
    
    // Set up logout button if present
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
            window.location.href = './login.html';
        });
    }
}

// ===== SIGNATURE PAD FUNCTIONS =====

// Setup signature pads
function setupSignaturePads(inspectorCanvas, clientCanvas) {
    const inspectorPlaceholder = document.getElementById('inspectorPlaceholder');
    const clientPlaceholder = document.getElementById('clientPlaceholder');
    
    // Initialize with options
    const signatureOptions = {
        minWidth: 1,
        maxWidth: 2.5,
        penColor: "blue"
    };
    
    // Create signature pads
    const inspectorSignaturePad = new SignaturePad(inspectorCanvas, signatureOptions);
    const clientSignaturePad = new SignaturePad(clientCanvas, signatureOptions);
    
    // Functions to handle placeholder visibility
    function updateInspectorPlaceholder() {
        if (inspectorSignaturePad.isEmpty()) {
            inspectorPlaceholder.style.display = 'block';
        } else {
            inspectorPlaceholder.style.display = 'none';
        }
    }
    
    function updateClientPlaceholder() {
        if (clientSignaturePad.isEmpty()) {
            clientPlaceholder.style.display = 'block';
        } else {
            clientPlaceholder.style.display = 'none';
        }
    }
    
    // Update placeholder visibility initially
    updateInspectorPlaceholder();
    updateClientPlaceholder();
    
    // Add event listeners for signature changes
    inspectorSignaturePad.addEventListener("endStroke", updateInspectorPlaceholder);
    clientSignaturePad.addEventListener("endStroke", updateClientPlaceholder);
    
    // Clear signature buttons
    document.getElementById('clearInspectorSignature').addEventListener('click', function() {
        inspectorSignaturePad.clear();
        updateInspectorPlaceholder();
    });
    
    document.getElementById('clearClientSignature').addEventListener('click', function() {
        clientSignaturePad.clear();
        updateClientPlaceholder();
    });
    
    // Resize canvas for better display
    function resizeCanvas(canvas, signaturePad) {
        try {
            // Get the display width of the canvas
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            
            // Check if canvas is visible and has dimensions
            if (width && height) {
                // High-DPI scaling
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = width * ratio;
                canvas.height = height * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
                signaturePad.clear();
            } else {
                console.warn("Canvas not visible or has no dimensions");
                // Set reasonable default dimensions
                canvas.width = 300;
                canvas.height = 100;
            }
        } catch (error) {
            console.error("Error resizing canvas:", error);
        }
    }
    
    // Initialize canvas sizes
    setTimeout(function() {
        resizeCanvas(inspectorCanvas, inspectorSignaturePad);
        resizeCanvas(clientCanvas, clientSignaturePad);
    }, 500);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        resizeCanvas(inspectorCanvas, inspectorSignaturePad);
        resizeCanvas(clientCanvas, clientSignaturePad);
    });
}

// Setup form buttons (submit, download, reset)
function setupFormButtons() {
    // Set current date as default for inspection date
    if (document.getElementById('inspectionDate')) {
        document.getElementById('inspectionDate').valueAsDate = new Date();
    }
    
    // Submit button
    if (document.getElementById('submitBtn')) {
        document.getElementById('submitBtn').addEventListener('click', function() {
            // Get signature pads
            const inspectorCanvas = document.getElementById('inspectorSignature');
            const clientCanvas = document.getElementById('clientSignature');
            const inspectorSignaturePad = new SignaturePad(inspectorCanvas);
            const clientSignaturePad = new SignaturePad(clientCanvas);
            
            // Validate signatures
            if (inspectorSignaturePad.isEmpty()) {
                alert('Please provide inspector signature before submitting');
                return;
            }
            
            if (clientSignaturePad.isEmpty()) {
                alert('Please provide client representative signature before submitting');
                return;
            }
            
            // Collect form data
            const formData = collectFormData();
            
            // Add user information from session
            const currentUser = getUserInfo();
            if (currentUser) {
                formData.submittedBy = currentUser.username;
                formData.userRole = currentUser.role;
            }
            
            // Send to storage
            const success = sendFormData(formData);
            
            if (success) {
                alert('Form submitted successfully!');
                // Optionally redirect to reports
                // window.location.href = './reports.html';
            }
        });
    }
    
    // Download PDF button
    if (document.getElementById('downloadPdfBtn')) {
        document.getElementById('downloadPdfBtn').addEventListener('click', function() {
            // Get signature pads
            const inspectorCanvas = document.getElementById('inspectorSignature');
            const clientCanvas = document.getElementById('clientSignature');
            const inspectorSignaturePad = new SignaturePad(inspectorCanvas);
            const clientSignaturePad = new SignaturePad(clientCanvas);
            
            // Validate signatures
            if (inspectorSignaturePad.isEmpty()) {
                alert('Please provide inspector signature before generating PDF');
                return;
            }
            
            if (clientSignaturePad.isEmpty()) {
                alert('Please provide client representative signature before generating PDF');
                return;
            }
            
            generatePDF();
        });
    }
    
    // Reset button
    if (document.getElementById('resetBtn')) {
        document.getElementById('resetBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
                document.getElementById('liftingBeamForm').reset();
                
                // Clear signatures
                const inspectorCanvas = document.getElementById('inspectorSignature');
                const clientCanvas = document.getElementById('clientSignature');
                const inspectorSignaturePad = new SignaturePad(inspectorCanvas);
                const clientSignaturePad = new SignaturePad(clientCanvas);
                
                inspectorSignaturePad.clear();
                clientSignaturePad.clear();
                
                // Update placeholders
                document.getElementById('inspectorPlaceholder').style.display = 'block';
                document.getElementById('clientPlaceholder').style.display = 'block';
                
                // Reset date fields to current date
                if (document.getElementById('inspectionDate')) {
                    document.getElementById('inspectionDate').valueAsDate = new Date();
                }
            }
        });
    }
}

// Collect form data
function collectFormData() {
    const data = {};
    
    // Get all input elements
    const inputs = document.querySelectorAll('input[type="text"], input[type="date"], input[type="tel"], input[type="email"], textarea, select');
    inputs.forEach(input => {
        if (input.id) {
            data[input.id] = input.value;
        }
    });
    
    // Get radio button values
    const radioGroups = ['examType', 'firstExam', 'installedCorrectly', 'interval', 'ndtRequired'];
    radioGroups.forEach(group => {
        const selected = document.querySelector(`input[name="${group}"]:checked`);
        data[group] = selected ? selected.value : '';
    });
    
    // Get checkbox values
    const checkboxes = ['minorFinding', 'criticalFinding'];
    checkboxes.forEach(checkbox => {
        const element = document.getElementById(checkbox);
        if (element) {
            data[checkbox] = element.checked;
        }
    });
    
    // Get signature data
    const inspectorCanvas = document.getElementById('inspectorSignature');
    const clientCanvas = document.getElementById('clientSignature');
    
    if (inspectorCanvas && clientCanvas) {
        const inspectorSignaturePad = new SignaturePad(inspectorCanvas);
        const clientSignaturePad = new SignaturePad(clientCanvas);
        
        data.inspectorSignature = inspectorSignaturePad.toDataURL();
        data.clientSignature = clientSignaturePad.toDataURL();
    }
    
    // Add timestamp
    data.timestamp = new Date().toISOString();
    
    return data;
}

// Send form data to storage
function sendFormData(data) {
    try {
        // In a production environment, this would be an API call to your server
        // For this example, we're storing in localStorage
        const reports = JSON.parse(localStorage.getItem('liftingBeamReports') || '[]');
        reports.push(data);
        localStorage.setItem('liftingBeamReports', JSON.stringify(reports));
        
        console.log("Data saved:", data);
        return true;
    } catch (error) {
        console.error("Error saving data:", error);
        alert('There was an error submitting the form. Please try again.');
        return false;
    }
}

// Generate PDF from form
function generatePDF() {
    // Hide buttons during PDF generation
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.display = 'none';
    });
    
    // Use html2canvas to capture the form as an image
    html2canvas(document.getElementById('inspectionForm')).then(canvas => {
        // Restore buttons
        buttons.forEach(button => {
            button.style.display = 'inline-block';
        });
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calculate aspect ratio to fit in PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm (portrait)
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add image to first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add new pages if the form is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Add user info in footer
        const user = getUserInfo();
        if (user) {
            const currentDate = new Date().toLocaleString();
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Generated by: ${user.username} (${user.role}) on ${currentDate}`, 10, 290);
        }
        
        // Save PDF
        const fileName = `Lifting_Beam_Inspection_${document.getElementById('inspectionDate').value || new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
    });
}

// ===== AUTHENTICATION FUNCTIONS =====

// Setup login form
function setupLoginForm() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Process login
        if (login(username, password)) {
            window.location.href = './index.html'; // Redirect to main form page
        } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
            document.getElementById('loginError').style.display = 'block';
        }
    });
}

// Check if user is logged in and manage access
function checkAuthStatus() {
    const currentUser = getUserInfo();
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!currentUser && !isLoginPage) {
        // Redirect to login page if not logged in
        window.location.href = './login.html';
        return false;
    } else if (currentUser && isLoginPage) {
        // Redirect to main page if already logged in
        window.location.href = './index.html';
        return true;
    }
    
    // Update UI with user info if logged in
    if (currentUser) {
        const userInfoElement = document.getElementById('userInfo');
        if (userInfoElement) {
            userInfoElement.textContent = `${currentUser.username} (${currentUser.role})`;
        }
        
        // Show/hide admin links based on role
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = currentUser.role === 'admin' ? 'block' : 'none';
        });
    }
    
    return !!currentUser;
}

// Login function
function login(username, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store logged in user info in sessionStorage (cleared when browser closes)
        const userInfo = {
            username: user.username,
            role: user.role
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userInfo));
        return true;
    }
    
    return false;
}

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
}

// Get current user info
function getUserInfo() {
    return JSON.parse(sessionStorage.getItem('currentUser'));
}

// ===== USER MANAGEMENT FUNCTIONS =====

// Setup user management page
function setupUserManagement() {
    // Load users list
    loadUsers();
    
    // Setup user form submission
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const role = document.getElementById('userRole').value;
        
        if (addUser(username, password, role)) {
            alert('User added successfully');
            loadUsers(); // Refresh user list
            document.getElementById('userForm').reset();
        } else {
            alert('Failed to add user. Username may already exist.');
        }
    });
}

// Load users for admin panel
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersList = document.getElementById('usersList');
    
    if (!usersList) return;
    
    // Clear list
    usersList.innerHTML = '';
    
    // Add users to table
    users.forEach(user => {
        const row = document.createElement('tr');
        
        const usernameCell = document.createElement('td');
        usernameCell.textContent = user.username;
        
        const roleCell = document.createElement('td');
        roleCell.textContent = user.role;
        
        const actionsCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function() {
            if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
                deleteUser(user.username);
            }
        };
        
        actionsCell.appendChild(deleteBtn);
        row.appendChild(usernameCell);
        row.appendChild(roleCell);
        row.appendChild(actionsCell);
        
        usersList.appendChild(row);
    });
}

// Add new user
function addUser(username, password, role) {
    // Simple validation
    if (!username || !password || !role) {
        return false;
    }
    
    // Get current users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return false;
    }
    
    // Add new user
    users.push({
        username,
        password, // In a real app, this should be hashed
        role
    });
    
    // Save users
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
}

// Delete user
function deleteUser(username) {
    // Get current users
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Don't delete if it's the last admin
    const adminUsers = users.filter(user => user.role === 'admin');
    if (adminUsers.length === 1 && adminUsers[0].username === username) {
        alert('Cannot delete the last admin user!');
        return;
    }
    
    // Filter out user to delete
    users = users.filter(user => user.username !== username);
    
    // Save updated users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Reload user list
    loadUsers();
}
