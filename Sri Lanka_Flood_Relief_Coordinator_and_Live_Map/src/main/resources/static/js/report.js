// Report Manager handles the Public Reports Feed
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

        // Show loading state
        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading verified reports...</p>';

        // Connect to Backend: GET /api/markers/approved
        fetch('/api/markers/approved')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(approved => {
                container.innerHTML = ''; // Clear loading text

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

                // Sort by ID (descending) as a proxy for time if timestamp is missing,
                // or parse timestamp if available
                approved.sort((a, b) => b.id - a.id);

                // Render Cards
                approved.forEach(report => {
                    const reportCard = this.createPublicReportCard(report);
                    container.appendChild(reportCard);
                });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p style="text-align:center; color:#F44336;">Failed to load reports. Please try again later.</p>';
            });
    }

    updateStats(approvedReports) {
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');

        if (totalCount) {
            totalCount.textContent = approvedReports.length;
        }

        if (recentCount) {
            // Simply showing total as recent for now, or filter by date if timestamp exists
            recentCount.textContent = approvedReports.length;
        }
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');
        card.className = `report-card ${report.type}`;

        // Format date safely
        let dateStr = 'Recently';
        if (report.timestamp) {
            const date = new Date(report.timestamp);
            if (!isNaN(date)) {
                dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
        }

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
        if (!severity) return '#00C851';
        switch(severity.toLowerCase()) {
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