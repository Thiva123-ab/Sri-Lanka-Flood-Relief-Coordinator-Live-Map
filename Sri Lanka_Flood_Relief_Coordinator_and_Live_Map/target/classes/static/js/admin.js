// Source: Sri Lanka_Flood_Relief_Coordinator_and_Live_Map/src/main/resources/static/js/admin.js

class AdminManager {
    constructor() {
        this.pendingReports = [];
        this.approvedReports = [];
        this.alerts = [];
        this.helpRequests = [];
        this.incidentChart = null;
        this.needsChart = null;
        this.init();
    }

    init() {
        // Check if user is admin
        if (!window.authManager || !window.authManager.isAdmin()) {
            window.location.href = 'login.html';
            return;
        }

        this.loadAllData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const addAlertBtn = document.getElementById('add-alert-btn');
        if (addAlertBtn) addAlertBtn.addEventListener('click', () => this.openAlertModal());

        const alertForm = document.getElementById('alert-form');
        if (alertForm) alertForm.addEventListener('submit', (e) => this.handleCreateAlert(e));

        const closeModal = document.querySelector('#alert-modal .close');
        if (closeModal) closeModal.addEventListener('click', () => this.closeAlertModal());

        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', () => this.generatePDF());

        // Add navigation listeners
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.handleNavigation(tab);
            });
        });
    }

    handleNavigation(tab) {
        switch(tab) {
            case 'map': window.location.href = 'map.html'; break;
            case 'reports': window.location.href = 'report.html'; break;
            case 'alerts': window.location.href = 'alerts.html'; break;
            case 'profile': window.location.href = 'admin.html'; break;
        }
    }

    // --- API CONNECTIONS ---

    async loadAllData() {
        try {
            // 1. Fetch Help Requests
            const helpRes = await fetch('http://localhost:8080/api/help-requests', { credentials: 'include' });
            this.helpRequests = await helpRes.json();
            this.renderHelpRequests();

            // 2. Fetch Pending Reports
            const pendingRes = await fetch('http://localhost:8080/api/markers/pending', { credentials: 'include' });
            this.pendingReports = await pendingRes.json();
            this.renderPendingReports();

            // 3. Fetch Approved Reports (For Analytics)
            const approvedRes = await fetch('http://localhost:8080/api/markers/approved', { credentials: 'include' });
            this.approvedReports = await approvedRes.json();

            // 4. Fetch Alerts
            const alertsRes = await fetch('http://localhost:8080/api/alerts', { credentials: 'include' });
            this.alerts = await alertsRes.json();
            this.renderAlerts();

            // Update Dashboard UI
            this.updateStats();
            this.renderCharts();

        } catch (err) {
            console.error("Error loading dashboard data:", err);
        }
    }

    // --- ANALYTICS & CHARTS ---

    updateStats() {
        const totalIncidents = this.approvedReports.length;
        const totalRequests = this.helpRequests.length;
        const highRisk = this.approvedReports.filter(i =>
            i.severity && (i.severity.toLowerCase() === 'critical' || i.severity.toLowerCase() === 'high')
        ).length;

        const pendingCount = document.getElementById('pending-count');
        if (pendingCount) pendingCount.textContent = this.pendingReports.length;

        const approvedCount = document.getElementById('approved-count');
        if (approvedCount) approvedCount.textContent = this.approvedReports.length;

        const alertsCount = document.getElementById('alerts-count');
        if (alertsCount) alertsCount.textContent = this.alerts.length;

        // Also update dashboard summary cards if they exist
        const dashTotal = document.getElementById('total-incidents');
        if(dashTotal) dashTotal.textContent = totalIncidents;

        const dashRequests = document.getElementById('total-requests');
        if(dashRequests) dashRequests.textContent = totalRequests;

        const dashHighRisk = document.getElementById('high-risk-count');
        if(dashHighRisk) dashHighRisk.textContent = highRisk;
    }

    renderCharts() {
        // Destroy existing charts if refreshing
        if (this.incidentChart) this.incidentChart.destroy();
        if (this.needsChart) this.needsChart.destroy();

        const incidentCanvas = document.getElementById('incidentChart');
        const needsCanvas = document.getElementById('needsChart');

        if (!incidentCanvas || !needsCanvas) return;

        // 1. Incident Type Chart (Doughnut)
        const typeCounts = {};
        this.approvedReports.forEach(i => {
            const type = i.type || 'Other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        this.incidentChart = new Chart(incidentCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts).map(s => s.toUpperCase().replace('-', ' ')),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['#2196F3', '#FF9800', '#9E9E9E', '#4CAF50', '#F44336'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#fff' } }
                }
            }
        });

        // 2. Help Needs Chart (Bar)
        const needCounts = {};
        this.helpRequests.forEach(req => {
            if (req.needs && Array.isArray(req.needs)) {
                req.needs.forEach(need => {
                    needCounts[need] = (needCounts[need] || 0) + 1;
                });
            } else {
                const need = req.needs || "General";
                needCounts[need] = (needCounts[need] || 0) + 1;
            }
        });

        this.needsChart = new Chart(needsCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(needCounts),
                datasets: [{
                    label: 'Requests',
                    data: Object.values(needCounts),
                    backgroundColor: '#FFD700',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { ticks: { color: '#fff' }, grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    generatePDF() {
        if (!window.jspdf) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.text("Flood Relief Sri Lanka - Situation Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Stats Summary Box
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 35, 180, 20, 'F');
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Total Incidents: ${this.approvedReports.length}`, 20, 48);
        doc.text(`Active Help Requests: ${this.helpRequests.length}`, 80, 48);

        // Help Requests Table
        doc.setFontSize(14);
        doc.setTextColor(41, 128, 185);
        doc.text("Emergency Help Requests", 14, 70);

        const reqRows = this.helpRequests.map(r => [
            r.name, r.phone, Array.isArray(r.needs) ? r.needs.join(", ") : r.needs, r.details
        ]);

        doc.autoTable({
            startY: 75,
            head: [['Name', 'Phone', 'Needs', 'Details']],
            body: reqRows,
            theme: 'grid',
            headStyles: { fillColor: [244, 67, 54] }
        });

        // Incidents Table
        let finalY = doc.lastAutoTable.finalY + 15;
        if (finalY > 250) { doc.addPage(); finalY = 20; }

        doc.text("Verified Incidents", 14, finalY);
        const incRows = this.approvedReports.map(i => [
            i.name, i.type, i.severity || 'N/A', i.description
        ]);

        doc.autoTable({
            startY: finalY + 5,
            head: [['Location', 'Type', 'Severity', 'Description']],
            body: incRows,
            theme: 'striped',
            headStyles: { fillColor: [76, 175, 80] }
        });

        doc.save("Flood_Situation_Report.pdf");
    }

    // --- MANAGEMENT FUNCTIONS ---

    approveReport(id) {
        fetch(`http://localhost:8080/api/markers/${id}/approve`, { method: 'PUT', credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    alert('Report Approved!');
                    this.loadAllData();
                } else {
                    alert('Failed to approve report');
                }
            });
    }

    rejectReport(id) {
        if (!confirm('Reject this report?')) return;
        fetch(`http://localhost:8080/api/markers/${id}/reject`, { method: 'DELETE', credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    alert('Report Rejected');
                    this.loadAllData();
                } else {
                    alert('Failed to reject report');
                }
            });
    }

    deleteAlert(id) {
        if (!confirm('Delete this alert?')) return;
        fetch(`http://localhost:8080/api/alerts/${id}`, { method: 'DELETE', credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    this.loadAllData();
                }
            });
    }

    handleCreateAlert(e) {
        e.preventDefault();
        const alertData = {
            title: document.getElementById('alert-title-en').value,
            content: document.getElementById('alert-description-en').value,
            severity: document.getElementById('alert-level').value,
            source: document.getElementById('alert-location').value || "Government",
            icon: "⚠️"
        };

        fetch('http://localhost:8080/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(alertData)
        }).then(res => {
            if (res.ok) {
                alert('Alert Created Successfully');
                this.closeAlertModal();
                this.loadAllData();
                e.target.reset();
            } else {
                alert('Failed to create alert');
            }
        });
    }

    // --- RENDER LISTS ---

    renderHelpRequests() {
        const container = document.getElementById('help-requests-list');
        if (!container) return;
        container.innerHTML = '';

        if (this.helpRequests.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#ccc;">No active help requests</p>';
            return;
        }

        this.helpRequests.sort((a, b) => b.id - a.id);
        this.helpRequests.forEach(req => {
            const card = document.createElement('div');
            card.className = `report-card rescue-needed`;
            let needsHtml = '';
            if (req.needs && req.needs.length > 0) {
                needsHtml = `<div style="margin-top:5px; font-weight:bold; color:#FFD700;">Needs: ${Array.isArray(req.needs) ? req.needs.join(', ') : req.needs}</div>`;
            }
            // ADDED: Status badge for Help Requests
            card.innerHTML = `
                <div class="report-header">
                    <div class="report-title"><i class="fas fa-hands-helping"></i> ${req.name}</div>
                    <div class="report-type" style="background:#F44336;">HELP</div>
                </div>
                <div class="report-description">
                    <p><strong>Phone:</strong> <a href="tel:${req.phone}" style="color:#fff;">${req.phone}</a></p>
                    <p><strong>Location:</strong> ${req.latitude}, ${req.longitude}</p>
                    <p><strong>Details:</strong> ${req.details}</p>
                    ${needsHtml}
                    <div style="margin-top:8px;">
                        <span style="background:rgba(255,152,0,0.2); color:#FF9800; border:1px solid #FF9800; padding:2px 8px; border-radius:10px; font-size:0.8rem; font-weight:bold;">
                            STATUS: ACTIVE
                        </span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
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

            // ADDED: Status Badge Logic
            const status = report.status ? report.status.toUpperCase() : 'PENDING';
            const statusColor = status === 'APPROVED' ? '#4CAF50' : '#FF9800'; // Green or Orange

            card.innerHTML = `
                <div class="report-header">
                    <div class="report-title">
                        ${report.name}
                        <span style="background:${statusColor}20; color:${statusColor}; border:1px solid ${statusColor}; padding:2px 8px; border-radius:10px; font-size:0.7rem; margin-left:10px;">
                            ${status}
                        </span>
                    </div>
                    <div class="report-type">${report.type}</div>
                </div>
                <div class="report-description">${report.description}</div>
                <div class="report-severity">Severity: <strong>${report.severity}</strong></div>
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
            const sev = alert.severity ? alert.severity.toLowerCase() : 'low';
            card.className = `alert-card ${sev}`;
            card.innerHTML = `
                <div class="alert-header">
                    <h3>${alert.title}</h3>
                    <span class="alert-level">${sev.toUpperCase()}</span>
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