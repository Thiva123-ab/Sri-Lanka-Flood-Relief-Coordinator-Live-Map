// Source: Sri Lanka_Flood_Relief_Coordinator_and_Live_Map/src/main/resources/static/js/main.js

class FloodReliefApp {
    constructor() {
        this.currentLanguage = 'en';
        this.pendingReports = [];
        this.approvedReports = [];
        this.init();
    }

    init() {
        this.setupEventListeners();

        const path = window.location.pathname;
        if (path.includes('report.html')) {
            this.loadPublicReports();
        } else if (window.authManager && window.authManager.isAdmin()) {
            this.loadPendingReports();
        }
    }

    setupEventListeners() {
        const fab = document.getElementById('fab');
        if (fab) fab.addEventListener('click', () => this.openPlaceModal());

        const closeModal = document.querySelector('.modal .close');
        if (closeModal) closeModal.addEventListener('click', () => this.closePlaceModal());

        const modal = document.getElementById('place-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closePlaceModal();
            });
        }

        const placeForm = document.getElementById('place-form');
        if (placeForm) placeForm.addEventListener('submit', (e) => this.handleSubmitPlace(e));

        const helpForm = document.getElementById('help-form');
        if (helpForm) helpForm.addEventListener('submit', (e) => this.handleHelpRequest(e));

        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    openPlaceModal() {
        const modal = document.getElementById('place-modal');
        if (modal) modal.style.display = 'block';
    }

    closePlaceModal() {
        const modal = document.getElementById('place-modal');
        if (modal) modal.style.display = 'none';
        const placeForm = document.getElementById('place-form');
        if (placeForm) placeForm.reset();
    }

    handleSubmitPlace(e) {
        e.preventDefault();

        // Check login first
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            alert("You must be logged in to submit a report.");
            window.location.href = "login.html";
            return;
        }

        const placeName = document.getElementById('place-name').value;
        const placeType = document.getElementById('place-type').value;
        const placeDescription = document.getElementById('place-description').value;
        const placeSeverity = document.getElementById('place-severity').value;

        const report = {
            name: placeName,
            type: placeType,
            description: placeDescription,
            severity: placeSeverity,
            status: 'pending',
            submittedBy: window.authManager.getCurrentUser().username,
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    report.lat = position.coords.latitude;
                    report.lng = position.coords.longitude;
                    this.sendReportToBackend(report);
                },
                (error) => {
                    console.log("Geolocation error: " + error.message);
                    report.lat = 7.8731; // Default
                    report.lng = 80.7718;
                    this.sendReportToBackend(report);
                }
            );
        } else {
            report.lat = 7.8731;
            report.lng = 80.7718;
            this.sendReportToBackend(report);
        }
    }

    // FIXED: Added credentials: 'include'
    sendReportToBackend(report) {
        fetch('http://localhost:8080/api/markers/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // <--- CRITICAL FIX: Sends the session cookie
            body: JSON.stringify(report)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to submit report (Status: ' + response.status + ')');
            })
            .then(data => {
                alert('Report submitted successfully! Waiting for admin approval.');
                this.closePlaceModal();
                if (window.authManager && window.authManager.isAdmin()) {
                    this.loadPendingReports();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting report. Please check backend connection.');
            });
    }

    // --- Admin/Pending Report Logic ---

    loadPendingReports() {
        const container = document.getElementById('pending-reports');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading...</p>';

        fetch('http://localhost:8080/api/markers/pending', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                this.pendingReports = data;
                container.innerHTML = '';

                if (this.pendingReports.length === 0) {
                    container.innerHTML = '<p style="text-align:center; color:#ccc;">No pending reports</p>';
                    return;
                }

                this.pendingReports.forEach(report => {
                    const reportCard = this.createReportCard(report);
                    container.appendChild(reportCard);
                });
            })
            .catch(err => {
                console.error("Error loading pending reports:", err);
                container.innerHTML = '<p style="color:red; text-align:center;">Failed to load reports</p>';
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
                <button class="btn-approve" onclick="window.floodApp.approveReport(${report.id})">Approve</button>
                <button class="btn-reject" onclick="window.floodApp.rejectReport(${report.id})">Reject</button>
            </div>
        `;
        return card;
    }

    // --- Public Report Feed Logic ---

    loadPublicReports() {
        const container = document.getElementById('public-reports-list');
        if (!container) return;

        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading verified reports...</p>';

        fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .then(approved => {
                this.approvedReports = approved;
                container.innerHTML = '';
                this.updateStats(approved);

                if (approved.length === 0) {
                    container.innerHTML = '<p style="text-align: center; color: #ccc; margin-top: 20px;">No verified incidents reported yet.</p>';
                    return;
                }

                approved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                approved.forEach(report => {
                    const reportCard = this.createPublicReportCard(report);
                    container.appendChild(reportCard);
                });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p style="text-align:center; color:#F44336;">Failed to load reports.</p>';
            });
    }

    updateStats(approved) {
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');
        if(totalCount) totalCount.textContent = approved.length;
        if(recentCount) recentCount.textContent = approved.length;
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');
        card.className = `report-card ${report.type}`;
        let dateStr = 'Recently';
        if(report.timestamp) {
            const date = new Date(report.timestamp);
            dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

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

    approveReport(reportId) {
        fetch(`http://localhost:8080/api/markers/${reportId}/approve`, { method: 'PUT', credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    alert('Report approved!');
                    this.loadPendingReports();
                    if (window.mapController) window.mapController.loadApprovedPlaces();
                } else {
                    alert('Failed to approve report');
                }
            });
    }

    rejectReport(reportId) {
        if (!confirm('Reject this report?')) return;
        fetch(`http://localhost:8080/api/markers/${reportId}/reject`, { method: 'DELETE', credentials: 'include' })
            .then(res => {
                if (res.ok) {
                    alert('Report rejected!');
                    this.loadPendingReports();
                } else {
                    alert('Failed to reject report');
                }
            });
    }

    switchTab(tabName) {
        switch(tabName) {
            case 'map': window.location.href = 'map.html'; break;
            case 'reports': window.location.href = 'report.html'; break;
            case 'alerts': window.location.href = 'alerts.html'; break;
            case 'profile':
                if (window.authManager && window.authManager.isAdmin()) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'help.html';
                }
                break;
        }
    }

    handleHelpRequest(e) {
        e.preventDefault();
        alert('Help request submitted successfully!');
        e.target.reset();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.floodApp = new FloodReliefApp();
});