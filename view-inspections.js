document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
    
    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // DOM Elements
    const completedTab = document.querySelector('[data-tab="completed"]');
    const draftsTab = document.querySelector('[data-tab="drafts"]');
    const completedTabContent = document.getElementById('completed-tab');
    const draftsTabContent = document.getElementById('drafts-tab');
    const completedTable = document.getElementById('completedInspectionsTable').querySelector('tbody');
    const draftsTable = document.getElementById('draftInspectionsTable').querySelector('tbody');
    const modal = document.getElementById('inspectionModal');
    const closeButtons = document.querySelectorAll('.close-button, .close-modal-button');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearFiltersButton = document.getElementById('clearFilters');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const printButton = document.getElementById('printInspection');
    const exportPDFButton = document.getElementById('exportPDF');
    
    // Pagination state
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredCompletedInspections = [];
    let filteredDraftInspections = [];
    
    // Load inspections from localStorage
    let completedInspections = JSON.parse(localStorage.getItem('completedInspections') || '[]');
    let draftInspections = JSON.parse(localStorage.getItem('inspectionDrafts') || '[]');
    
    // Sort inspections by date (newest first)
    completedInspections.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    draftInspections.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    // Initialize with all inspections
    filteredCompletedInspections = [...completedInspections];
    filteredDraftInspections = [...draftInspections];
    
    // Tab switching
    completedTab.addEventListener('click', function() {
        draftsTab.classList.remove('active');
        completedTab.classList.add('active');
        draftsTabContent.classList.remove('active');
        completedTabContent.classList.add('active');
        currentPage = 1;
        updateTables();
    });
    
    draftsTab.addEventListener('click', function() {
        completedTab.classList.remove('active');
        draftsTab.classList.add('active');
        completedTabContent.classList.remove('active');
        draftsTabContent.classList.add('active');
        currentPage = 1;
        updateTables();
    });
    
    // Modal functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Format date helper function
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Status badge helper function
    function getStatusBadge(status) {
        let badgeClass = '';
        let badgeText = status;
        
        switch(status) {
            case 'pass':
                badgeClass = 'pass';
                badgeText = 'Pass';
                break;
            case 'fail':
                badgeClass = 'fail';
                badgeText = 'Fail';
                break;
            case 'conditional':
                badgeClass = 'conditional';
                badgeText = 'Conditional';
                break;
            case 'draft':
                badgeClass = 'draft';
                badgeText = 'Draft';
                break;
            default:
                badgeClass = 'draft';
                badgeText = status;
        }
        
        return `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
    }
    
    // Render completed inspections table
    function renderCompletedTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredCompletedInspections.slice(start, end);
        
        if (paginatedItems.length === 0) {
            completedTable.innerHTML = `
                <tr class="empty-state">
                    <td colspan="7">
                        <div class="empty-message">
                            <p>No completed inspections found.</p>
                            <a href="new-inspection.html" class="action-button small">Start New Inspection</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        let tableContent = '';
        
        paginatedItems.forEach(inspection => {
            tableContent += `
                <tr data-id="${inspection.inspectionId}">
                    <td>${inspection.inspectionId || '-'}</td>
                    <td>${formatDate(inspection.inspectionDate)}</td>
                    <td>${inspection.inspectorName || '-'}</td>
                    <td>${inspection.beamId || '-'}</td>
                    <td>${inspection.location || '-'}</td>
                    <td>${getStatusBadge(inspection.inspectionResult)}</td>
                    <td>
                        <div class="action-links">
                            <span class="action-link view-inspection">View</span>
                            <span class="action-link print-inspection">Print</span>
                            <span class="action-link delete-inspection">Delete</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        completedTable.innerHTML = tableContent;
        
        // Add event listeners to new elements
        document.querySelectorAll('.view-inspection').forEach(link => {
            link.addEventListener('click', function() {
                const row = this.closest('tr');
                const inspectionId = row.getAttribute('data-id');
                showInspectionDetails(inspectionId);
            });
        });
        
        document.querySelectorAll('.print-inspection').forEach(link => {
            link.addEventListener('click', function() {
                const row = this.closest('tr');
                const inspectionId = row.getAttribute('data-id');
                printInspection(inspectionId);
            });
        });
        
        document.querySelectorAll('.delete-inspection').forEach(link => {
            link.addEventListener('click', function() {
                const row = this.closest('tr');
                const inspectionId = row.getAttribute('data-id');
                deleteInspection(inspectionId);
            });
        });
    }
    
    // Render drafts table
    function renderDraftsTable() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = filteredDraftInspections.slice(start, end);
        
        if (paginatedItems.length === 0) {
            draftsTable.innerHTML = `
                <tr class="empty-state">
                    <td colspan="6">
                        <div class="empty-message">
                            <p>No draft inspections found.</p>
                            <a href="new-inspection.html" class="action-button small">Start New Inspection</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        let tableContent = '';
        
        paginatedItems.forEach(draft => {
            tableContent += `
                <tr data-id="${draft.draftId}">
                    <td>${draft.draftId || '-'}</td>
                    <td>${formatDate(draft.savedAt)}</td>
                    <td>${draft.inspectorName || '-'}</td>
                    <td>${draft.beamId || '-'}</td>
                    <td>${draft.location || '-'}</td>
                    <td>
                        <div class="action-links">
                            <span class="action-link continue-draft">Continue</span>
                            <span class="action-link delete-draft">Delete</span>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        draftsTable.innerHTML = tableContent;
        
        // Add event listeners to new elements
        document.querySelectorAll('.continue-draft').forEach(link => {
            link.addEventListener('click', function() {
                const row = this.closest('tr');
                const draftId = row.getAttribute('data-id');
                continueDraft(draftId);
            });
        });
        
        document.querySelectorAll('.delete-draft').forEach(link => {
            link.addEventListener('click', function() {
                const row = this.closest('tr');
                const draftId = row.getAttribute('data-id');
                deleteDraft(draftId);
            });
        });
    }
    
    // Update tables and pagination
    function updateTables() {
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        
        if (activeTab === 'completed') {
            renderCompletedTable();
            updatePagination(filteredCompletedInspections.length);
        } else {
            renderDraftsTable();
            updatePagination(filteredDraftInspections.length);
        }
    }
    
    // Update pagination controls
    function updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
        
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }
    
    // Pagination event listeners
    prevPageButton.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updateTables();
        }
    });
    
    nextPageButton.addEventListener('click', function() {
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        const totalItems = activeTab === 'completed' ? filteredCompletedInspections.length : filteredDraftInspections.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        
        if (currentPage < totalPages) {
            currentPage++;
            updateTables();
        }
    });
    
    // Search and Filter functionality
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const dateValue = dateFilter.value;
        
        // Filter completed inspections
        filteredCompletedInspections = completedInspections.filter(inspection => {
            // Search term filter
            const searchMatches = 
                (inspection.inspectionId && inspection.inspectionId.toLowerCase().includes(searchTerm)) ||
                (inspection.inspectorName && inspection.inspectorName.toLowerCase().includes(searchTerm)) ||
                (inspection.beamId && inspection.beamId.toLowerCase().includes(searchTerm)) ||
                (inspection.location && inspection.location.toLowerCase().includes(searchTerm));
            
            // Status filter
            const statusMatches = statusValue === 'all' || inspection.inspectionResult === statusValue;
            
            // Date filter
            let dateMatches = true;
            if (dateValue !== 'all') {
                const inspectionDate = new Date(inspection.inspectionDate);
                const today = new Date();
                const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const thisYearStart = new Date(today.getFullYear(), 0, 1);
                
                switch(dateValue) {
                    case 'today':
                        dateMatches = (
                            inspectionDate.getDate() === today.getDate() &&
                            inspectionDate.getMonth() === today.getMonth() &&
                            inspectionDate.getFullYear() === today.getFullYear()
                        );
                        break;
                    case 'week':
                        dateMatches = inspectionDate >= thisWeekStart;
                        break;
                    case 'month':
                        dateMatches = inspectionDate >= thisMonthStart;
                        break;
                    case 'year':
                        dateMatches = inspectionDate >= thisYearStart;
                        break;
                }
            }
            
            return searchMatches && statusMatches && dateMatches;
        });
        
        // Filter draft inspections
        filteredDraftInspections = draftInspections.filter(draft => {
            // Search term filter
            const searchMatches = 
                (draft.draftId && draft.draftId.toLowerCase().includes(searchTerm)) ||
                (draft.inspectorName && draft.inspectorName.toLowerCase().includes(searchTerm)) ||
                (draft.beamId && draft.beamId.toLowerCase().includes(searchTerm)) ||
                (draft.location && draft.location.toLowerCase().includes(searchTerm));
            
            // Date filter for drafts
            let dateMatches = true;
            if (dateValue !== 'all') {
                const draftDate = new Date(draft.savedAt);
                const today = new Date();
                const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const thisYearStart = new Date(today.getFullYear(), 0, 1);
                
                switch(dateValue) {
                    case 'today':
                        dateMatches = (
                            draftDate.getDate() === today.getDate() &&
                            draftDate.getMonth() === today.getMonth() &&
                            draftDate.getFullYear() === today.getFullYear()
                        );
                        break;
                    case 'week':
                        dateMatches = draftDate >= thisWeekStart;
                        break;
                    case 'month':
                        dateMatches = draftDate >= thisMonthStart;
                        break;
                    case 'year':
                        dateMatches = draftDate >= thisYearStart;
                        break;
                }
            }
            
            // Status is always draft for draft inspections
            return searchMatches && dateMatches && (statusValue === 'all' || statusValue === 'draft');
        });
        
        // Reset to page 1
        currentPage = 1;
        
        // Update tables with filtered data
        updateTables();
    }
    
    // Search and filter event listeners
    searchButton.addEventListener('click', applyFilters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    statusFilter.addEventListener('change', applyFilters);
    dateFilter.addEventListener('change', applyFilters);
    
    clearFiltersButton.addEventListener('click', function() {
        searchInput.value = '';
        statusFilter.value = 'all';
        dateFilter.value = 'all';
        applyFilters();
    });
    
    // Show inspection details
    function showInspectionDetails(inspectionId) {
        const inspection = completedInspections.find(i => i.inspectionId === inspectionId);
        
        if (!inspection) return;
        
        // Populate modal with inspection details
        document.getElementById('detail-inspectionId').textContent = inspection.inspectionId || '-';
        document.getElementById('detail-inspectionDate').textContent = formatDate(inspection.inspectionDate) || '-';
        document.getElementById('detail-inspectorName').textContent = inspection.inspectorName || '-';
        document.getElementById('detail-beamId').textContent = inspection.beamId || '-';
        document.getElementById('detail-location').textContent = inspection.location || '-';
        document.getElementById('detail-inspectionResult').innerHTML = getStatusBadge(inspection.inspectionResult);
        
        document.getElementById('detail-manufacturer').textContent = inspection.manufacturer || '-';
        document.getElementById('detail-model').textContent = inspection.model || '-';
        document.getElementById('detail-capacity').textContent = inspection.capacity ? `${inspection.capacity} kg` : '-';
        document.getElementById('detail-length').textContent = inspection.length ? `${inspection.length} mm` : '-';
        
        document.getElementById('detail-observations').textContent = inspection.observations || 'No additional observations';
        document.getElementById('detail-recommendations').textContent = inspection.recommendations || 'No recommendations provided';
        document.getElementById('detail-nextInspectionDate').textContent = inspection.nextInspectionDate ? formatDate(inspection.nextInspectionDate) : 'Not specified';
        
        // Populate checklist results
        const checklistContainer = document.getElementById('detail-checklist');
        checklistContainer.innerHTML = '';
        
        const checklistItems = [
            { key: 'structuralIntegrity', label: 'Structural Integrity', desc: 'Cracks, bends, or deformation' },
            { key: 'welds', label: 'Welds and Joints', desc: 'Cracks or degradation in welded areas' },
            { key: 'corrosion', label: 'Corrosion', desc: 'Rust or corrosion affecting structural integrity' },
            { key: 'liftingPoints', label: 'Lifting Points', desc: 'Security and condition of lifting points/lugs' },
            { key: 'markings', label: 'Markings and Labels', desc: 'Legibility of SWL and identification markings' }
        ];
        
        checklistItems.forEach(item => {
            if (inspection[item.key]) {
                const result = inspection[item.key];
                const notes = inspection[item.key + '_notes'] || '';
                
                const resultHtml = `
                    <div class="checklist-result">
                        <div class="checklist-result-label">
                            <strong>${item.label}</strong>
                            <small>${item.desc}</small>
                        </div>
                        <div class="checklist-result-value ${result}">
                            ${result.charAt(0).toUpperCase() + result.slice(1)}
                        </div>
                    </div>
                    ${notes ? `<div class="checklist-result-notes">Notes: ${notes}</div>` : ''}
                `;
                
                checklistContainer.innerHTML += resultHtml;
            }
        });
        
        // Display modal
        modal.style.display = 'block';
    }
    
    // Print inspection
    function printInspection(inspectionId) {
        const inspection = completedInspections.find(i => i.inspectionId === inspectionId);
        
        if (!inspection) return;
        
        // In a real application, this would generate a proper print layout
        alert(`Printing inspection ${inspectionId}.\nIn a real application, this would open a print dialog with a formatted report.`);
    }
    
    // Export inspection as PDF
    printButton.addEventListener('click', function() {
        // Get the currently displayed inspection ID from the modal
        const inspectionId = document.getElementById('detail-inspectionId').textContent;
        if (inspectionId && inspectionId !== '-') {
            printInspection(inspectionId);
        }
    });
    
    exportPDFButton.addEventListener('click', function() {
        // Get the currently displayed inspection ID from the modal
        const inspectionId = document.getElementById('detail-inspectionId').textContent;
        if (inspectionId && inspectionId !== '-') {
            alert(`Exporting inspection ${inspectionId} as PDF.\nIn a real application, this would generate and download a PDF file.`);
        }
    });
    
    // Delete inspection
    function deleteInspection(inspectionId) {
        if (confirm('Are you sure you want to delete this inspection? This action cannot be undone.')) {
            completedInspections = completedInspections.filter(i => i.inspectionId !== inspectionId);
            localStorage.setItem('completedInspections', JSON.stringify(completedInspections));
            
            // Update filtered list
            filteredCompletedInspections = filteredCompletedInspections.filter(i => i.inspectionId !== inspectionId);
            
            // Update table
            updateTables();
        }
    }
    
    // Delete draft
    function deleteDraft(draftId) {
        if (confirm('Are you sure you want to delete this draft?')) {
            draftInspections = draftInspections.filter(d => d.draftId !== draftId);
            localStorage.setItem('inspectionDrafts', JSON.stringify(draftInspections));
            
            // Update filtered list
            filteredDraftInspections = filteredDraftInspections.filter(d => d.draftId !== draftId);
            
            // Update table
            updateTables();
        }
    }
    
    // Continue draft (redirect to new inspection with draft data)
    function continueDraft(draftId) {
        // Store the draft ID to be loaded in the new inspection page
        sessionStorage.setItem('continueDraftId', draftId);
        window.location.href = 'new-inspection.html';
    }
    
    // Initialize tables
    updateTables();
});
