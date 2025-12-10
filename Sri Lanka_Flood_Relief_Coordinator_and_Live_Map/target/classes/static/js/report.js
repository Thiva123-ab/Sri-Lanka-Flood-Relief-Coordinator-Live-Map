// Report Manager handles the Public Reports Feed
class ReportManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadReports();
    }

    loadReports() {
        const container = document.getElementById('public-reports-list');
        if (!container) return;

        // Show loading state
        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading reports...</p>';

        // 1. Fetch Approved Reports (Public - Everyone sees these)
        const fetchApproved = fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .catch(err => []);

        // 2. Fetch My Reports (Authenticated User - Sees Pending/Approved/Rejected)
        // Note: You need to implement /api/markers/my-reports in backend as discussed
        const fetchMyReports = fetch('http://localhost:8080/api/markers/my-reports', { credentials: 'include' })
            .then(res => {
                if (res.ok) return res.json();
                return []; // If 401/403 (Guest), return empty
            })
            .catch(err => []);

        // 3. Process Lists
        Promise.all([fetchApproved, fetchMyReports])
            .then(([approved, myReports]) => {
                container.innerHTML = '';

                // Create a Map to merge lists and handle duplicates (prefer 'myReports' for personal status)
                const reportMap = new Map();

                // Add approved first
                approved.forEach(r => reportMap.set(r.id, r));

                // Add/Overwrite with myReports (so I see my own Rejected/Pending status)
                myReports.forEach(r => reportMap.set(r.id, r));

                const allReports = Array.from(reportMap.values());

                this.updateStats(approved, myReports);

                // Handle Empty State
                if (allReports.length === 0) {
                    container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ccc;">
                        <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No verified incidents found.</p>
                    </div>`;
                    return;
                }

                // Sort by ID (descending) -> Newest first
                allReports.sort((a, b) => b.id - a.id);

                // Render Cards
                allReports.forEach(report => {
                    const reportCard = this.createPublicReportCard(report);
                    container.appendChild(reportCard);
                });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p style="text-align:center; color:#F44336;">Failed to load reports.</p>';
            });
    }

    updateStats(approvedReports, myReports) {
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');

        if (totalCount) {
            totalCount.textContent = approvedReports.length;
        }

        if (recentCount) {
            // "Recent Updates" implies active things (approved) + my pending/rejected contributions
            recentCount.textContent = approvedReports.length + myReports.length;
        }
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');

        // --- STATUS BADGE LOGIC ---
        const status = report.status ? report.status.toUpperCase() : 'APPROVED';

        let statusColor = '#00C851'; // Green
        let statusIcon = 'check-circle';
        let borderColor = '#00C851';
        let cardClass = report.type;

        if (status === 'PENDING') {
            statusColor = '#FF9800'; // Orange
            borderColor = '#FF9800';
            statusIcon = 'clock';
        } else if (status === 'REJECTED') {
            statusColor = '#ff4444'; // Red
            borderColor = '#ff4444';
            statusIcon = 'times-circle';
            // Force visual style for rejected
            cardClass += ' rejected-card';
        }

        card.className = `report-card ${cardClass}`;

        // If rejected, override border color manually to be safe
        if(status === 'REJECTED') {
            card.style.borderLeftColor = '#ff4444';
            card.style.opacity = '0.8';
        }

        // Format date
        let dateStr = 'Recently';
        if (report.timestamp) {
            const date = new Date(report.timestamp);
            if (!isNaN(date)) {
                dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
        }

        const statusBadge = `
            <span style="background-color: ${statusColor}20; 
                         color: ${statusColor}; 
                         border: 1px solid ${borderColor}; 
                         font-size: 0.65rem; 
                         padding: 2px 8px; 
                         border-radius: 12px; 
                         display: inline-flex; 
                         align-items: center; 
                         gap: 4px; 
                         margin-left: 10px; 
                         vertical-align: middle;
                         text-transform: uppercase;">
                <i class="fas fa-${statusIcon}"></i> ${status}
            </span>
        `;

        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">
                    ${report.name || 'Unknown Location'}
                    ${statusBadge}
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

document.addEventListener('DOMContentLoaded', () => {
    window.reportManager = new ReportManager();
});