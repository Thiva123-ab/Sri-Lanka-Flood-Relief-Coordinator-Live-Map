// Source: Sri Lanka_Flood_Relief_Coordinator_and_Live_Map/src/main/resources/static/js/admin.js

class AdminManager {
    constructor() {
        this.pendingReports = [];
        this.approvedReports = [];
        this.alerts = [];
        this.init();
    }

    init() {
        // Security Check
        if (!window.authManager || !window.authManager.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        // Load Data
        this.loadReports();
        this.loadAlerts();

        // Setup All Event Listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 1. Navigation Button Logic (Fixed)
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.handleNavigation(tab);
            });
        });

        // 2. Alert Modal Logic
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.openAlertModal());

        const alertForm = document.getElementById('alert-form');
        if (alertForm) alertForm.addEventListener('submit', (e) => this.handleCreateAlert(e));

        const closeModal = document.querySelector('#alert-modal .close');
        if (closeModal) closeModal.addEventListener('click', () => this.closeAlertModal());
    }

    handleNavigation(tab) {
        switch(tab) {
            case 'map':
                window.location.href = 'map.html';
                break;
            case 'reports':
                window.location.href = 'report.html';
                break;
            case 'alerts':
                window.location.href = 'alerts.html';
                break;
            case 'profile':
                // Already on admin profile, maybe refresh or do nothing
                window.location.href = 'admin.html';
                break;
        }
    }

    // --- API CONNECTIONS ---

    loadReports() {
        // Fetch Pending Reports
        fetch('http://localhost:8080/api/markers/pending')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch pending reports');
                return res.json();
            })
            .then(data => {
                this.pendingReports = data;
                this.updateStats();
                this.renderPendingReports();
            })
            .catch(err => console.error("Error loading pending reports:", err));

        // Fetch Approved Reports (for stats)
        fetch('http://localhost:8080/api/markers/approved')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch approved reports');
                return res.json();
            })
            .then(data => {
                this.approvedReports = data;
                this.updateStats();
            })
            .catch(err => console.error("Error loading approved reports:", err));
    }

    loadAlerts() {
        fetch('http://localhost:8080/api/alerts')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch alerts');
                return res.json();
            })
            .then(data => {
                this.alerts = data;
                this.updateStats();
                this.renderAlerts();
            })
            .catch(err => console.error("Error loading alerts:", err));
    }

    approveReport(id) {
        fetch(`http://localhost:8080/api/markers/${id}/approve`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    alert('Report Approved!');
                    this.loadReports(); // Refresh list
                } else {
                    alert('Failed to approve report.');
                }
            })
            .catch(err => console.error(err));
    }

    rejectReport(id) {
        if (!confirm('Reject this report?')) return;
        fetch(`http://localhost:8080/api/markers/${id}/reject`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert('Report Rejected');
                    this.loadReports(); // Refresh list
                } else {
                    alert('Failed to reject report.');
                }
            })
            .catch(err => console.error(err));
    }

    deleteAlert(id) {
        if (!confirm('Delete this alert?')) return;
        fetch(`http://localhost:8080/api/alerts/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    this.loadAlerts(); // Refresh list
                } else {
                    alert('Failed to delete alert.');
                }
            })
            .catch(err => console.error(err));
    }

    handleCreateAlert(e) {
        e.preventDefault();

        const alertData = {
            title: document.getElementById('alert-title-en').value,
            content: document.getElementById('alert-description-en').value, // Mapped to 'content'
            severity: document.getElementById('alert-level').value,
            source: document.getElementById('alert-location').value || "Government", // Using location field as source for now
            icon: "⚠️"
        };

        fetch('http://localhost:8080/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        }).then(res => {
            if (res.ok) {
                alert('Alert Created Successfully');
                this.closeAlertModal();
                this.loadAlerts();
                e.target.reset(); // Clear form
            } else {
                alert('Failed to create alert');
            }
        }).catch(err => console.error(err));
    }

    // --- UI RENDERING ---

    updateStats() {
        const pendingCount = document.getElementById('pending-count');
        if (pendingCount) pendingCount.textContent = this.pendingReports.length;

        const approvedCount = document.getElementById('approved-count');
        if (approvedCount) approvedCount.textContent = this.approvedReports.length;

        const alertsCount = document.getElementById('alerts-count');
        if (alertsCount) alertsCount.textContent = this.alerts.length;
    }

    renderPendingReports() {
        const container = document.getElementById('pending-reports');
        if (!container) return;
        container.innerHTML = '';

        if (this.pendingReports.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#ccc;">No pending reports</p>';
            return;
        }

        this.pendingReports.forEach(report => {
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
                    <button class="btn-approve" onclick="window.adminManager.approveReport(${report.id})">Approve</button>
                    <button class="btn-reject" onclick="window.adminManager.rejectReport(${report.id})">Reject</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderAlerts() {
        const container = document.getElementById('alerts-list');
        if (!container) return;
        container.innerHTML = '';

        if (this.alerts.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#ccc;">No active alerts</p>';
            return;
        }

        this.alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card ${alert.severity ? alert.severity.toLowerCase() : 'low'}`;
            card.innerHTML = `
                <div class="alert-header">
                    <h3>${alert.title}</h3>
                    <span class="alert-level">${alert.severity ? alert.severity.toUpperCase() : 'INFO'}</span>
                </div>
                <div class="alert-body">
                    <p>${alert.content}</p>
                    <div class="alert-actions">
                        <button class="btn-reject" onclick="window.adminManager.deleteAlert(${alert.id})">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    openAlertModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) modal.style.display = 'block';
    }

    closeAlertModal() {
        const modal = document.getElementById('alert-modal');
        if (modal) modal.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});