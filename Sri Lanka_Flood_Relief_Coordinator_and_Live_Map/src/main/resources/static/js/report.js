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
        container.innerHTML = '<p style="text-align:center; color:#ccc;">Loading reports...</p>';

        // 1. Fetch Approved Reports (Public)
        const fetchApproved = fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .catch(err => {
                console.error("Failed to load approved:", err);
                return [];
            });

        // 2. Fetch Pending Reports (Authenticated only) - with credentials
        const fetchPending = fetch('http://localhost:8080/api/markers/pending', { credentials: 'include' })
            .then(res => {
                if (res.ok) return res.json();
                return []; // Return empty array if not logged in (401/403)
            })
            .catch(err => {
                // It's okay if this fails for guests
                return [];
            });

        // 3. Process Both Lists
        Promise.all([fetchApproved, fetchPending])
            .then(([approved, pending]) => {
                container.innerHTML = ''; // Clear loading text

                // Get Current User
                let currentUser = null;
                const userJson = localStorage.getItem('floodReliefUser');
                if (userJson) {
                    currentUser = JSON.parse(userJson);
                }

                // Filter Pending Reports
                let myPending = [];
                if (currentUser) {
                    if (currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN') {
                        // Admins see all pending
                        myPending = pending;
                    } else {
                        // Members only see THEIR OWN pending reports
                        myPending = pending.filter(p => p.submittedBy === currentUser.username);
                    }
                }

                // Combine Approved + My Pending
                const allReports = [...myPending, ...approved];

                this.updateStats(approved, myPending);

                // Handle Empty State
                if (allReports.length === 0) {
                    container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #ccc;">
                        <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No verified incidents or pending reports found.</p>
                    </div>`;
                    return;
                }

                // Sort by ID (descending) so newest (pending or approved) are at top
                allReports.sort((a, b) => b.id - a.id);

                // Render Cards
                allReports.forEach(report => {
                    const reportCard = this.createPublicReportCard(report);
                    container.appendChild(reportCard);
                });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p style="text-align:center; color:#F44336;">Failed to load reports. Please try again later.</p>';
            });
    }

    updateStats(approvedReports, pendingReports) {
        const totalCount = document.getElementById('total-reports-count');
        const recentCount = document.getElementById('recent-reports-count');

        if (totalCount) {
            // Show total verified
            totalCount.textContent = approvedReports.length;
        }

        if (recentCount) {
            // Show recent activity (Verified + My Pending)
            recentCount.textContent = approvedReports.length + pendingReports.length;
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

        // --- STATUS BADGE LOGIC ---
        // Defaults to 'APPROVED' if status is missing
        const status = report.status ? report.status.toUpperCase() : 'APPROVED';

        let statusColor = '#00C851'; // Default Green (Approved)
        let statusIcon = 'check-circle';
        let borderColor = '#00C851';

        if (status === 'PENDING') {
            statusColor = '#FF9800'; // Orange
            borderColor = '#FF9800';
            statusIcon = 'clock';
        } else if (status === 'REJECTED') {
            statusColor = '#ff4444'; // Red
            borderColor = '#ff4444';
            statusIcon = 'times-circle';
        }

        // Generate the Badge HTML
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportManager = new ReportManager();
});