// Admin Dashboard Manager
class AdminManager {
    constructor() {
        this.pendingReports = [];
        this.approvedReports = [];
        this.alerts = [];
        this.init();
    }

    init() {
        // Check if user is admin
        if (!window.authManager || !window.authManager.isAdmin()) {
            // Redirect to login if not admin
            window.location.href = 'login.html';
            return;
        }

        // Load data
        this.loadReports();
        this.loadAlerts();

        // Update stats
        this.updateStats();

        // Render reports and alerts
        this.renderPendingReports();
        this.renderAlerts();

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add alert button
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) {
            addAlertBtn.addEventListener('click', () => this.openAlertModal());
        }

        // Alert form submission
        const alertForm = document.getElementById('alert-form');
        if (alertForm) {
            alertForm.addEventListener('submit', (e) => this.handleCreateAlert(e));
        }

        // Modal close button
        const closeModal = document.querySelector('#alert-modal .close');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeAlertModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAlertModal();
                }
            });
        }

        // Language selector
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.replace('lang-', '');
                this.changeLanguage(lang);
            });
        });
    }

    loadReports() {
        // Load pending reports
        const savedPending = localStorage.getItem('pendingReports');
        this.pendingReports = savedPending ? JSON.parse(savedPending) : [];

        // Load approved reports
        const savedApproved = localStorage.getItem('approvedReports');
        this.approvedReports = savedApproved ? JSON.parse(savedApproved) : [];
    }

    loadAlerts() {
        const savedAlerts = localStorage.getItem('floodAlerts');
        this.alerts = savedAlerts ? JSON.parse(savedAlerts) : [];
    }

    updateStats() {
        // Update pending reports count
        const pendingCount = document.getElementById('pending-count');
        if (pendingCount) {
            pendingCount.textContent = this.pendingReports.filter(r => r.status === 'pending').length;
        }

        // Update approved reports count
        const approvedCount = document.getElementById('approved-count');
        if (approvedCount) {
            approvedCount.textContent = this.approvedReports.length;
        }

        // Update alerts count
        const alertsCount = document.getElementById('alerts-count');
        if (alertsCount) {
            alertsCount.textContent = this.alerts.length;
        }
    }

    renderPendingReports() {
        const container = document.getElementById('pending-reports');
        if (!container) return;

        // Filter pending reports
        const pending = this.pendingReports.filter(report => report.status === 'pending');

        if (pending.length === 0) {
            container.innerHTML = '<p>No pending reports</p>';
            return;
        }

        container.innerHTML = '';

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
                <button class="btn-approve" onclick="adminManager.approveReport(${report.id})">Approve</button>
                <button class="btn-reject" onclick="adminManager.rejectReport(${report.id})">Reject</button>
            </div>
        `;
        return card;
    }

    renderAlerts() {
        const container = document.getElementById('alerts-list');
        if (!container) return;

        if (this.alerts.length === 0) {
            container.innerHTML = '<p>No active alerts</p>';
            return;
        }

        container.innerHTML = '';

        // Sort alerts by timestamp (newest first)
        const sortedAlerts = [...this.alerts].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp));

        sortedAlerts.forEach(alert => {
            const alertCard = this.createAlertCard(alert);
            container.appendChild(alertCard);
        });
    }

    createAlertCard(alert) {
        const currentLang = this.getCurrentLanguage();

        const card = document.createElement('div');
        card.className = `alert-card ${alert.level}`;
        card.innerHTML = `
            <div class="alert-header">
                <h3>${alert.title[currentLang]}</h3>
                <span class="alert-level">${alert.level.toUpperCase()}</span>
            </div>
            <div class="alert-body">
                <p>${alert.description[currentLang]}</p>
                <div class="alert-meta">
                    <span><i class="far fa-clock"></i> ${this.formatDate(alert.timestamp)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${alert.location}</span>
                </div>
                <div class="alert-actions">
                    <button class="btn-reject" onclick="adminManager.deleteAlert(${alert.id})">Delete</button>
                </div>
            </div>
        `;
        return card;
    }

    approveReport(reportId) {
        const report = this.pendingReports.find(r => r.id == reportId);
        if (report) {
            report.status = 'approved';

            // Add to approved reports
            this.approvedReports.push(report);

            // Save to localStorage
            localStorage.setItem('pendingReports', JSON.stringify(this.pendingReports));
            localStorage.setItem('approvedReports', JSON.stringify(this.approvedReports));

            // Update UI
            this.updateStats();
            this.renderPendingReports();

            // Add to map if on map page
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

            // Save to localStorage
            localStorage.setItem('pendingReports', JSON.stringify(this.pendingReports));

            // Update UI
            this.updateStats();
            this.renderPendingReports();

            alert('Report rejected!');
        }
    }

    openAlertModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeAlertModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Reset form
        const alertForm = document.getElementById('alert-form');
        if (alertForm) {
            alertForm.reset();
        }
    }

    handleCreateAlert(e) {
        e.preventDefault();

        // Get form data
        const alertData = {
            title: {
                en: document.getElementById('alert-title-en').value,
                si: document.getElementById('alert-title-si').value,
                ta: document.getElementById('alert-title-ta').value
            },
            description: {
                en: document.getElementById('alert-description-en').value,
                si: document.getElementById('alert-description-si').value,
                ta: document.getElementById('alert-description-ta').value
            },
            level: document.getElementById('alert-level').value,
            location: document.getElementById('alert-location').value
        };

        // Validate required fields
        if (!alertData.title.en || !alertData.description.en) {
            alert('Please fill in all required fields');
            return;
        }

        // Add to alerts array
        const newAlert = {
            id: Date.now(),
            ...alertData,
            timestamp: new Date().toISOString()
        };

        this.alerts.unshift(newAlert); // Add to beginning

        // Save to localStorage
        localStorage.setItem('floodAlerts', JSON.stringify(this.alerts));

        // Update UI
        this.updateStats();
        this.renderAlerts();

        // Close modal and reset form
        this.closeAlertModal();

        alert('Alert created successfully!');
    }

    deleteAlert(alertId) {
        if (confirm('Are you sure you want to delete this alert?')) {
            this.alerts = this.alerts.filter(alert => alert.id != alertId);

            // Save to localStorage
            localStorage.setItem('floodAlerts', JSON.stringify(this.alerts));

            // Update UI
            this.updateStats();
            this.renderAlerts();

            alert('Alert deleted!');
        }
    }

    getCurrentLanguage() {
        // Check for active language button
        const activeBtn = document.querySelector('.lang-btn.active');
        if (activeBtn) {
            return activeBtn.id.replace('lang-', '');
        }
        return 'en'; // default to English
    }

    changeLanguage(lang) {
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

        // Re-render content with new language
        this.renderAlerts();
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();

        // If today, show time only
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // If yesterday, show "Yesterday"
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // Otherwise show full date
        return date.toLocaleDateString();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});