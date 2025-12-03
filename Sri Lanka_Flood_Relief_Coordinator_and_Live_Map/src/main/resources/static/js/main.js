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
        this.updateLanguage();

        // Load pending reports for admin
        if (window.authManager && window.authManager.isAdmin()) {
            this.loadPendingReports();
        }
    }

    setupEventListeners() {
        // Language selector
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeLanguage(e.target.id.replace('lang-', ''));
            });
        });

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

    changeLanguage(lang) {
        this.currentLanguage = lang;

        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

        // Update UI text
        this.updateLanguage();
    }

    updateLanguage() {
        // In a real app, this would load translated strings
        const translations = {
            en: {
                'modal-title': 'Add Flood Report',
                'place-name': 'Place Name',
                'place-type': 'Type',
                'place-description': 'Description',
                'place-severity': 'Severity Level',
                'submit-btn': 'Submit for Approval'
            },
            si: {
                'modal-title': 'හෙරී වාර්තාව එක් කරන්න',
                'place-name': 'ස්ථානයේ නම',
                'place-type': 'වර්ගය',
                'place-description': 'විස්තරය',
                'place-severity': 'ප්‍රමාද මට්ටම',
                'submit-btn': 'අනුමත කිරීම සඳහා යොමු කරන්න'
            },
            ta: {
                'modal-title': 'வெள்ள அறிக்கையைச் சேர்க்கவும்',
                'place-name': 'இடத்தின் பெயர்',
                'place-type': 'வகை',
                'place-description': 'விளக்கம்',
                'place-severity': 'தீவிரத்தன்மை நிலை',
                'submit-btn': 'அங்கீகாரத்திற்காக சமர்ப்பிக்கவும்'
            }
        };

        const texts = translations[this.currentLanguage];
        for (const [key, value] of Object.entries(texts)) {
            const element = document.getElementById(key);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    // For form elements, update placeholder or option text
                    if (element.placeholder) {
                        element.placeholder = value;
                    }
                } else {
                    element.textContent = value;
                }
            }
        }
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

        // Create report object
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

    loadPendingReports() {
        // In a real app, this would fetch from a server
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
                },
                {
                    id: 2,
                    name: "Kandy Road Block",
                    type: "road-block",
                    description: "Landslide blocking the road",
                    severity: "medium",
                    status: "pending",
                    submittedBy: "user2",
                    timestamp: "2023-06-15T11:45:00Z"
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
        // Update active nav button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.nav-btn[data-tab="${tabName}"]`).classList.add('active');

        // Navigate to the appropriate page
        switch(tabName) {
            case 'map':
                if (!window.location.pathname.includes('index.html')) {
                    window.location.href = 'index.html';
                }
                break;
            case 'reports':
                // This would show reports on the main page
                console.log('Showing reports');
                break;
            case 'alerts':
                if (!window.location.pathname.includes('alerts.html')) {
                    window.location.href = 'alerts.html';
                }
                break;
            case 'profile':
                if (!window.location.pathname.includes('help.html')) {
                    window.location.href = 'help.html';
                }
                break;
        }
    }

    handleHelpRequest(e) {
        e.preventDefault();

        // Get form data
        const name = document.getElementById('help-name').value;
        const phone = document.getElementById('help-phone').value;
        const location = document.getElementById('help-location').value;
        const type = document.getElementById('help-type').value;
        const description = document.getElementById('help-description').value;

        // In a real app, this would be sent to a server
        console.log('Help request submitted:', { name, phone, location, type, description });

        // Show confirmation
        alert('Help request submitted successfully! Emergency services will contact you soon.');

        // Reset form
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