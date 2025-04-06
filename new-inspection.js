document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get form element
    const inspectionForm = document.getElementById('inspectionForm');
    const saveAsDraftBtn = document.getElementById('saveAsDraft');
    
    // Set default inspection date to today
    const todayDate = new Date().toISOString().split('T')[0];
    document.getElementById('inspectionDate').value = todayDate;
    
    // Set default inspector name if available
    const username = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (username) {
        document.getElementById('inspectorName').value = username;
    }
    
    // Calculate next inspection date as 1 year from now
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    document.getElementById('nextInspectionDate').value = nextYearDate.toISOString().split('T')[0];
    
    // Helper function to get form data as an object
    function getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            // Handle file inputs separately
            if (key === 'photos') {
                if (!data[key]) {
                    data[key] = [];
                }
                if (value.name) { // Only add if a file was selected
                    data[key].push(value);
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    // Save as draft functionality
    saveAsDraftBtn.addEventListener('click', function(e) {
        const formData = getFormData(inspectionForm);
        
        // Add status to indicate it's a draft
        formData.status = 'draft';
        formData.savedAt = new Date().toISOString();
        
        // Store in localStorage (in a real app, you might want to limit the number of drafts)
        const drafts = JSON.parse(localStorage.getItem('inspectionDrafts') || '[]');
        
        // Generate a draft ID if it doesn't exist
        if (!formData.draftId) {
            formData.draftId = 'draft_' + Date.now();
        }
        
        // If it's an existing draft, update it, otherwise add a new one
        const existingDraftIndex = drafts.findIndex(draft => draft.draftId === formData.draftId);
        if (existingDraftIndex >= 0) {
            drafts[existingDraftIndex] = formData;
        } else {
            drafts.push(formData);
        }
        
        localStorage.setItem('inspectionDrafts', JSON.stringify(drafts));
        
        alert('Inspection saved as draft');
    });
    
    // Form submission
    inspectionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = getFormData(this);
        formData.status = 'submitted';
        formData.submittedAt = new Date().toISOString();
        
        // Generate a unique ID for the inspection
        const inspectionId = 'INS-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
        formData.inspectionId = inspectionId;
        
        // In a real application, you would send this data to your server
        console.log('Submitting inspection:', formData);
        
        // For this demo, we'll store it in localStorage
        const inspections = JSON.parse(localStorage.getItem('completedInspections') || '[]');
        inspections.push(formData);
        localStorage.setItem('completedInspections', JSON.stringify(inspections));
        
        // Show success message and redirect
        alert('Inspection submitted successfully. Inspection ID: ' + inspectionId);
        window.location.href = 'view-inspections.html';
    });
    
    // Dynamic validation - change inspection result based on checklist items
    const checklistRadios = document.querySelectorAll('.checklist input[type="radio"]');
    const inspectionResultSelect = document.getElementById('inspectionResult');
    
    checklistRadios.forEach(radio => {
        radio.addEventListener('change', updateInspectionResult);
    });
    
    function updateInspectionResult() {
        // Get all selected values
        const selectedValues = Array.from(document.querySelectorAll('.checklist input[type="radio"]:checked'))
            .map(radio => radio.value);
        
        // If any are fail, suggest a fail result
        if (selectedValues.includes('fail')) {
            inspectionResultSelect.value = 'fail';
        } 
        // If all are pass, suggest a pass result
        else if (selectedValues.length > 0 && !selectedValues.includes('fail') && !selectedValues.includes('na')) {
            inspectionResultSelect.value = 'pass';
        }
        // Otherwise leave it as is
    }
    
    // Photo upload preview (if we add this functionality later)
    const photoInput = document.getElementById('photos');
    if (photoInput) {
        photoInput.addEventListener('change', function() {
            // This would be where we'd implement a photo preview
            console.log(`${this.files.length} photos selected`);
        });
    }
});
