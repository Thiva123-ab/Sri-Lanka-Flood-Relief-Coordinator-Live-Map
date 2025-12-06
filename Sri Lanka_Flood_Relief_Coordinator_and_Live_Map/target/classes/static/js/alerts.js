// Alerts Manager for Flood Relief Application
class AlertsManager {
    constructor() {
        this.alerts = [];
        this.init();
    }

    init() {
        // Load alerts from Backend
        this.loadAlerts();

        // Render initial state
        this.renderAlerts();

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 1. Navigation Button Logic
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Use currentTarget to ensure we get the button, not the icon
                const tab = e.currentTarget.dataset.tab;
                this.handleNavigation(tab);
            });
        });

        // 2. Language selector
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
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
                // Check authentication to decide destination
                if (window.authManager && window.authManager.isAdmin()) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'help.html';
                }
                break;
        }
    }

    loadAlerts() {
        const container = document.querySelector('.alert-list');
        if (container) {
            container.innerHTML = '<p style="text-align:center; color:#ccc; margin-top:20px;">Loading alerts...</p>';
        }

        // FIXED: Use full URL to localhost:8080
        fetch('http://localhost:8080/api/alerts')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                this.alerts = data;
                this.renderAlerts();
            })
            .catch(error => {
                console.error("Error loading alerts:", error);
                if (container) {
                    container.innerHTML = `
                        <div style="text-align: center; color: #F44336; margin-top: 20px;">
                            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                            <p>Failed to load alerts. Ensure backend is running.</p>
                        </div>`;
                }
            });
    }

    renderAlerts() {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        // Clear existing content
        alertList.innerHTML = '';

        if (!this.alerts || this.alerts.length === 0) {
            alertList.innerHTML = '<p style="text-align:center; color:#ccc; margin-top:20px;">No active government alerts.</p>';
            return;
        }

        // Add each alert to the list
        this.alerts.forEach(alert => {
            const alertCard = this.createAlertCard(alert);
            alertList.appendChild(alertCard);
        });
    }

    createAlertCard(alert) {
        const card = document.createElement('div');

        // Map backend 'severity' to CSS class. Default to 'low' if missing.
        const severityClass = (alert.severity || 'low').toLowerCase();

        card.className = `alert-card ${severityClass}`;

        card.innerHTML = `
            <div class="alert-header">
                <h3>${alert.title || 'Alert'}</h3>
                <span class="alert-level">${(alert.severity || 'INFO').toUpperCase()}</span>
            </div>
            <div class="alert-body">
                <p>${alert.content || 'No details provided.'}</p>
                <div class="alert-meta">
                    <span><i class="far fa-clock"></i> Issued: ${this.formatDate(alert.timestamp)}</span>
                    <span><i class="fas fa-bullhorn"></i> ${alert.source || 'Government'}</span>
                </div>
            </div>
        `;
        return card;
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        const date = new Date(timestamp);
        const now = new Date();

        // If today, show time only
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // If yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // Otherwise show full date
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alertsManager = new AlertsManager();
});