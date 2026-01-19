// Report Manager handles the Member Reports Feed
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

        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading reports...</p>';

        // 1. Fetch Approved Reports (Public)
        const fetchApproved = fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .catch(err => []);

        // 2. Fetch My Reports (Authenticated User)
        const fetchMyReports = fetch('http://localhost:8080/api/markers/my-reports', { credentials: 'include' })
            .then(res => {
                if (res.ok) return res.json();
                return [];
            })
            .catch(err => []);

        // 3. Process Both Lists
        Promise.all([fetchApproved, fetchMyReports])
            .then(([approved, myReports]) => {
                container.innerHTML = '';

                // --- UPDATE DASHBOARD STATS COUNTS ---
                this.updateMemberStats(myReports);

                // --- MERGE LISTS FOR DISPLAY ---
                // We use a Map to merge. 'myReports' overrides 'approved' so users see their own status.
                const reportMap = new Map();

                // Add approved reports first
                approved.forEach(r => reportMap.set(r.id, r));

                // Add/Overwrite with myReports (contains specific PENDING/REJECTED status)
                myReports.forEach(r => reportMap.set(r.id, r));

                const allReports = Array.from(reportMap.values());

                if (allReports.length === 0) {
                    container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ccc;">
                        <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No reports found.</p>
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

    updateMemberStats(myReports) {
        // Calculate counts based on status
        const pendingCount = myReports.filter(r => r.status && r.status.toLowerCase() === 'pending').length;
        const rejectedCount = myReports.filter(r => r.status && r.status.toLowerCase() === 'rejected').length;
        const approvedCount = myReports.filter(r => r.status && r.status.toLowerCase() === 'approved').length;

        // Update DOM elements
        const pendingEl = document.getElementById('my-pending-count');
        const rejectedEl = document.getElementById('my-rejected-count');
        const approvedEl = document.getElementById('my-approved-count');

        if (pendingEl) pendingEl.textContent = pendingCount;
        if (rejectedEl) rejectedEl.textContent = rejectedCount;
        if (approvedEl) approvedEl.textContent = approvedCount;
    }

    createPublicReportCard(report) {
        const card = document.createElement('div');

        // --- STATUS BADGE LOGIC ---
        const status = report.status ? report.status.toUpperCase() : 'APPROVED';

        let statusColor = '#00C851'; // Green (Approved)
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
            cardClass += ' rejected-card';
        }

        card.className = `report-card ${cardClass}`;

        if(status === 'REJECTED') {
            card.style.borderLeftColor = '#ff4444';
            card.style.opacity = '0.85';
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
                         text-transform: uppercase;
                         font-weight: bold;">
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