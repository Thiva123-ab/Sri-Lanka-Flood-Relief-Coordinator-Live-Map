// src/main/resources/static/js/report.js

class ReportManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadPublicReports();
    }

    loadPublicReports() {
        const container = document.getElementById('public-reports-list');
        if (!container) return;

        container.innerHTML = '';

        // Fetch approved reports from LocalStorage
        // (In a full backend integration, this would fetch from /api/markers/approved)
        const savedApproved = localStorage.getItem('approvedReports');
        const approved = savedApproved ? JSON.parse(savedApproved) : [];

        // Update Dashboard Stats
        this.updateStats(approved);

        // Handle Empty State
        if (approved.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ccc;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>No verified incidents reported yet.</p>
                </div>`;
            return;
        }

        // Sort by newest first
        approved.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Render Cards
        approved.forEach(report => {
            const reportCard = this.createPublicReportCard(report);
            container.appendChild(reportCard);
        });
    }

    updateStats(approvedReports) {
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');

        if (totalCount) {
            totalCount.textContent = approvedReports.length;
        }

        if (recentCount) {
            // Count reports from the last 24 hours
            const now = new Date();
            const recent = approvedReports.filter(r => {
                const date = new Date(r.timestamp);
                const diff = now - date;
                return diff < (24 * 60 * 60 * 1000);
            }).length;
            recentCount.textContent = recent;
        }
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');
        card.className = `report-card ${report.type}`;

        // Format date safely
        const date = new Date(report.timestamp);
        const dateStr = !isNaN(date)
            ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : 'Just now';

        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">
                    ${report.name || 'Unknown Location'}
                    <span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>
                </div>
                <div class="report-type">${(report.type || 'General').toUpperCase().replace('-', ' ')}</div>
            </div>
            <div class="report-description">${report.description || 'No description provided.'}</div>
            <div class="report-severity">
                Severity: <span style="font-weight: bold; color: ${this.getSeverityColor(report.severity)}">${(report.severity || 'Low').toUpperCase()}</span>
            </div>
            <div class="report-meta" style="margin-top: 10px; font-size: 0.85rem; color: #ccc; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                <span><i class="far fa-clock"></i> ${dateStr}</span>
                <span><i class="far fa-user"></i> ${report.submittedBy || 'Anonymous'}</span>
            </div>
        `;
        return card;
    }

    getSeverityColor(severity) {
        switch(severity) {
            case 'critical': return '#ff4444';
            case 'high': return '#ff8800';
            case 'medium': return '#ffbb33';
            default: return '#00C851';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportManager = new ReportManager();
});