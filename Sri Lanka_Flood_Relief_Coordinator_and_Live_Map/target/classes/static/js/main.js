// Source: Sri Lanka_Flood_Relief_Coordinator_and_Live_Map/src/main/resources/static/js/main.js

// Main Application Controller
class FloodReliefApp {
    constructor() {
        this.currentLanguage = 'en';
        this.pendingReports = [];
        this.approvedReports = [];
        this.init();
    }

    init() {
        // Initialize components
        this.setupEventListeners();
        this.loadSampleData();
        // this.updateLanguage(); // Removed language logic

        // Load data based on page
        const path = window.location.pathname;

        if (path.includes('report.html')) {
            this.loadPublicReports();
        } else if (window.authManager && window.authManager.isAdmin()) {
            this.loadPendingReports();
        }
    }

    setupEventListeners() {
        // FAB button
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', () => this.openPlaceModal());
        }

        // Modal close button
        const closeModal = document.querySelector('.modal .close');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closePlaceModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('place-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePlaceModal();
                }
            });
        }

        // Place form submission
        const placeForm = document.getElementById('place-form');
        if (placeForm) {
            placeForm.addEventListener('submit', (e) => this.handleSubmitPlace(e));
        }

        // Help form submission
        const helpForm = document.getElementById('help-form');
        if (helpForm) {
            helpForm.addEventListener('submit', (e) => this.handleHelpRequest(e));
        }

        // Navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.nav-btn').dataset.tab);
            });
        });
    }

    openPlaceModal() {
        const modal = document.getElementById('place-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closePlaceModal() {
        const modal = document.getElementById('place-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Reset form
        const placeForm = document.getElementById('place-form');
        if (placeForm) {
            placeForm.reset();
        }
    }

    handleSubmitPlace(e) {
        e.preventDefault();

        // Get form data
        const placeName = document.getElementById('place-name').value;
        const placeType = document.getElementById('place-type').value;
        const placeDescription = document.getElementById('place-description').value;
        const placeSeverity = document.getElementById('place-severity').value;

        // Base report object
        const report = {
            id: Date.now(),
            name: placeName,
            type: placeType,
            description: placeDescription,
            severity: placeSeverity,
            status: 'pending',
            submittedBy: window.authManager ? window.authManager.getCurrentUser().username : 'Anonymous',
            timestamp: new Date().toISOString()
        };

        // Try to get geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    report.lat = position.coords.latitude;
                    report.lng = position.coords.longitude;
                    this.saveAndCompleteReport(report);
                },
                (error) => {
                    console.log("Geolocation error (using random fallback in MapController): " + error.message);
                    this.saveAndCompleteReport(report);
                }
            );
        } else {
            this.saveAndCompleteReport(report);
        }
    }

    saveAndCompleteReport(report) {
        // Save to pending reports
        this.pendingReports.push(report);
        this.saveReports();

        // Close modal
        this.closePlaceModal();

        // Show confirmation
        alert('Report submitted successfully! Waiting for admin approval.');

        // If admin, reload pending reports
        if (window.authManager && window.authManager.isAdmin()) {
            this.loadPendingReports();
        }
    }

    // --- Admin/Pending Report Logic ---

    loadPendingReports() {
        const container = document.getElementById('pending-reports');
        if (!container) return;

        container.innerHTML = '';

        // Filter pending reports
        const pending = this.pendingReports.filter(report => report.status === 'pending');

        if (pending.length === 0) {
            container.innerHTML = '<p>No pending reports</p>';
            return;
        }

        pending.forEach(report => {
            const reportCard = this.createReportCard(report);
            container.appendChild(reportCard);
        });
    }

    createReportCard(report) {
        const card = document.createElement('div');
        card.className = `report-card ${report.type}`;
        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">${report.name}</div>
                <div class="report-type">${report.type}</div>
            </div>
            <div class="report-description">${report.description}</div>
            <div class="report-severity">Severity: ${report.severity}</div>
            <div class="report-submitted">Submitted by: ${report.submittedBy}</div>
            <div class="report-actions">
                <button class="btn-approve" onclick="approveReport(${report.id})">Approve</button>
                <button class="btn-reject" onclick="rejectReport(${report.id})">Reject</button>
            </div>
        `;
        return card;
    }

    // --- Public Report Feed Logic ---

    loadPublicReports() {
        const container = document.getElementById('public-reports-list');
        if (!container) return;

        container.innerHTML = '';

        // Filter approved reports
        // In a real app, this would be a server fetch
        const savedApproved = localStorage.getItem('approvedReports');
        const approved = savedApproved ? JSON.parse(savedApproved) : [];

        // Update stats
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');
        if (totalCount) totalCount.textContent = approved.length;
        if (recentCount) recentCount.textContent = approved.filter(r => {
            const date = new Date(r.timestamp);
            const now = new Date();
            const diff = now - date;
            return diff < (24 * 60 * 60 * 1000); // Last 24 hours
        }).length;

        if (approved.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #ccc; margin-top: 20px;">No verified incidents reported yet.</p>';
            return;
        }

        // Sort by newest first
        approved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        approved.forEach(report => {
            const reportCard = this.createPublicReportCard(report);
            container.appendChild(reportCard);
        });
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');
        card.className = `report-card ${report.type}`;

        // Format date
        const date = new Date(report.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">
                    ${report.name}
                    <span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>
                </div>
                <div class="report-type">${report.type.toUpperCase().replace('-', ' ')}</div>
            </div>
            <div class="report-description">${report.description}</div>
            <div class="report-severity">Severity: <span style="font-weight: bold;">${report.severity.toUpperCase()}</span></div>
            <div class="report-meta" style="margin-top: 10px; font-size: 0.85rem; color: #ccc; display: flex; justify-content: space-between;">
                <span><i class="far fa-clock"></i> ${dateStr}</span>
                <span><i class="far fa-user"></i> ${report.submittedBy}</span>
            </div>
        `;
        return card;
    }

    // --- Action Handlers ---

    approveReport(reportId) {
        const report = this.pendingReports.find(r => r.id == reportId);
        if (report) {
            report.status = 'approved';
            this.approvedReports.push(report);
            this.saveReports();
            this.loadPendingReports();

            // Add to map
            if (window.mapController) {
                window.mapController.addApprovedPlace(report);
            }

            alert('Report approved and added to map!');
        }
    }

    rejectReport(reportId) {
        const reportIndex = this.pendingReports.findIndex(r => r.id == reportId);
        if (reportIndex !== -1) {
            this.pendingReports.splice(reportIndex, 1);
            this.saveReports();
            this.loadPendingReports();
            alert('Report rejected!');
        }
    }

    saveReports() {
        localStorage.setItem('pendingReports', JSON.stringify(this.pendingReports));
        localStorage.setItem('approvedReports', JSON.stringify(this.approvedReports));
    }

    loadSampleData() {
        // Load from localStorage or initialize with sample data
        const savedPending = localStorage.getItem('pendingReports');
        const savedApproved = localStorage.getItem('approvedReports');

        if (savedPending) {
            this.pendingReports = JSON.parse(savedPending);
        } else {
            // Sample pending reports
            this.pendingReports = [
                {
                    id: 1,
                    name: "Colombo Main Street",
                    type: "flood",
                    description: "Severe flooding after heavy rains",
                    severity: "high",
                    status: "pending",
                    submittedBy: "user1",
                    timestamp: "2023-06-15T10:30:00Z"
                }
            ];
        }

        if (savedApproved) {
            this.approvedReports = JSON.parse(savedApproved);
        } else {
            // Sample approved reports
            this.approvedReports = [
                {
                    id: 3,
                    name: "Galle Safe Zone",
                    type: "safe-zone",
                    description: "Community center available for shelter",
                    severity: "low",
                    status: "approved",
                    submittedBy: "admin",
                    timestamp: "2023-06-14T09:15:00Z"
                }
            ];
        }
    }

    switchTab(tabName) {
        // Update active nav button (UI only)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Navigate to the appropriate page
        switch(tabName) {
            case 'map':
                if (!window.location.pathname.includes('map.html')) {
                    window.location.href = 'map.html';
                }
                break;
            case 'reports':
                if (!window.location.pathname.includes('report.html')) {
                    window.location.href = 'report.html';
                }
                break;
            case 'alerts':
                if (!window.location.pathname.includes('alerts.html')) {
                    window.location.href = 'alerts.html';
                }
                break;
            case 'profile':
                // Check if user is admin
                if (window.authManager && window.authManager.isAdmin()) {
                    if (!window.location.pathname.includes('admin.html')) {
                        window.location.href = 'admin.html';
                    }
                } else {
                    if (!window.location.pathname.includes('help.html')) {
                        window.location.href = 'help.html';
                    }
                }
                break;
        }
    }

    handleHelpRequest(e) {
        e.preventDefault();
        const name = document.getElementById('help-name').value;
        console.log('Help request submitted:', { name });
        alert('Help request submitted successfully! Emergency services will contact you soon.');
        e.target.reset();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.floodApp = new FloodReliefApp();

    // Make approve/reject functions globally accessible
    window.approveReport = (id) => {
        window.floodApp.approveReport(id);
    };

    window.rejectReport = (id) => {
        window.floodApp.rejectReport(id);
    };
});