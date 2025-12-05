class AdminManager {
    constructor() {
        this.pendingReports = [];
        this.approvedReports = [];
        this.alerts = [];
        this.init();
    }

    init() {
        if (!window.authManager || !window.authManager.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        this.loadReports();
        this.loadAlerts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.openAlertModal());

        const alertForm = document.getElementById('alert-form');
        if (alertForm) alertForm.addEventListener('submit', (e) => this.handleCreateAlert(e));

        const closeModal = document.querySelector('#alert-modal .close');
        if (closeModal) closeModal.addEventListener('click', () => this.closeAlertModal());
    }

    // --- API CONNECTIONS ---

    loadReports() {
        // Fetch Pending Reports from Backend
        fetch('/api/markers/pending')
            .then(res => res.json())
            .then(data => {
                this.pendingReports = data;
                this.updateStats();
                this.renderPendingReports();
            })
            .catch(err => console.error("Error loading pending reports:", err));

        // Fetch Approved Reports (for stats)
        fetch('/api/markers/approved')
            .then(res => res.json())
            .then(data => {
                this.approvedReports = data;
                this.updateStats();
            });
    }

    loadAlerts() {
        // Fetch Alerts from Backend
        fetch('/api/alerts')
            .then(res => res.json())
            .then(data => {
                this.alerts = data;
                this.updateStats();
                this.renderAlerts();
            })
            .catch(err => console.error("Error loading alerts:", err));
    }

    approveReport(id) {
        fetch(`/api/markers/${id}/approve`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    alert('Report Approved!');
                    this.loadReports(); // Refresh list
                }
            });
    }

    rejectReport(id) {
        if (!confirm('Reject this report?')) return;
        fetch(`/api/markers/${id}/reject`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert('Report Rejected');
                    this.loadReports(); // Refresh list
                }
            });
    }

    deleteAlert(id) {
        if (!confirm('Delete this alert?')) return;
        fetch(`/api/alerts/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    this.loadAlerts(); // Refresh list
                }
            });
    }

    handleCreateAlert(e) {
        e.preventDefault();

        // Simplify: Backend expects single string for title/content (not multi-lang objects yet)
        const alertData = {
            title: document.getElementById('alert-title-en').value,
            content: document.getElementById('alert-description-en').value,
            severity: document.getElementById('alert-level').value,
            source: "Government",
            icon: "⚠️" // Default icon
        };

        fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        }).then(res => {
            if (res.ok) {
                alert('Alert Created Successfully');
                this.closeAlertModal();
                this.loadAlerts();
            }
        });
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
            container.innerHTML = '<p>No pending reports</p>';
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

        this.alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card ${alert.severity}`;
            card.innerHTML = `
                <div class="alert-header">
                    <h3>${alert.title}</h3>
                    <span class="alert-level">${alert.severity.toUpperCase()}</span>
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

    openAlertModal() { document.getElementById('alert-modal').style.display = 'block'; }
    closeAlertModal() { document.getElementById('alert-modal').style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});class AdminManager {
    constructor() {
        this.pendingReports = [];
        this.approvedReports = [];
        this.alerts = [];
        this.init();
    }

    init() {
        if (!window.authManager || !window.authManager.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        this.loadReports();
        this.loadAlerts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.openAlertModal());

        const alertForm = document.getElementById('alert-form');
        if (alertForm) alertForm.addEventListener('submit', (e) => this.handleCreateAlert(e));

        const closeModal = document.querySelector('#alert-modal .close');
        if (closeModal) closeModal.addEventListener('click', () => this.closeAlertModal());
    }

    // --- API CONNECTIONS ---

    loadReports() {
        // Fetch Pending Reports from Backend
        fetch('/api/markers/pending')
            .then(res => res.json())
            .then(data => {
                this.pendingReports = data;
                this.updateStats();
                this.renderPendingReports();
            })
            .catch(err => console.error("Error loading pending reports:", err));

        // Fetch Approved Reports (for stats)
        fetch('/api/markers/approved')
            .then(res => res.json())
            .then(data => {
                this.approvedReports = data;
                this.updateStats();
            });
    }

    loadAlerts() {
        // Fetch Alerts from Backend
        fetch('/api/alerts')
            .then(res => res.json())
            .then(data => {
                this.alerts = data;
                this.updateStats();
                this.renderAlerts();
            })
            .catch(err => console.error("Error loading alerts:", err));
    }

    approveReport(id) {
        fetch(`/api/markers/${id}/approve`, { method: 'PUT' })
            .then(res => {
                if (res.ok) {
                    alert('Report Approved!');
                    this.loadReports(); // Refresh list
                }
            });
    }

    rejectReport(id) {
        if (!confirm('Reject this report?')) return;
        fetch(`/api/markers/${id}/reject`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    alert('Report Rejected');
                    this.loadReports(); // Refresh list
                }
            });
    }

    deleteAlert(id) {
        if (!confirm('Delete this alert?')) return;
        fetch(`/api/alerts/${id}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    this.loadAlerts(); // Refresh list
                }
            });
    }

    handleCreateAlert(e) {
        e.preventDefault();

        // Simplify: Backend expects single string for title/content (not multi-lang objects yet)
        const alertData = {
            title: document.getElementById('alert-title-en').value,
            content: document.getElementById('alert-description-en').value,
            severity: document.getElementById('alert-level').value,
            source: "Government",
            icon: "⚠️" // Default icon
        };

        fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        }).then(res => {
            if (res.ok) {
                alert('Alert Created Successfully');
                this.closeAlertModal();
                this.loadAlerts();
            }
        });
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
            container.innerHTML = '<p>No pending reports</p>';
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

        this.alerts.forEach(alert => {
            const card = document.createElement('div');
            card.className = `alert-card ${alert.severity}`;
            card.innerHTML = `
                <div class="alert-header">
                    <h3>${alert.title}</h3>
                    <span class="alert-level">${alert.severity.toUpperCase()}</span>
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

    openAlertModal() { document.getElementById('alert-modal').style.display = 'block'; }
    closeAlertModal() { document.getElementById('alert-modal').style.display = 'none'; }
}

document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});