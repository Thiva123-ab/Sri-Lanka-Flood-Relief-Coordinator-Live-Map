// Alerts functionality for Sri Lanka Flood Relief Coordinator

document.addEventListener('DOMContentLoaded', function() {
    // Sample alert data (in a real app, this would come from an API)
    const sampleAlerts = [
        {
            id: 1,
            severity: 'immediate',
            title: 'Flash Flood Warning',
            content: 'Severe flash flooding expected in Kalutara and Gampaha districts within the next 6 hours. Immediate evacuation advised.',
            source: 'Department of Meteorology',
            timestamp: '2023-06-15T08:30:00Z',
            icon: '🌧️'
        },
        {
            id: 2,
            severity: 'watch',
            title: 'Heavy Rainfall Advisory',
            content: 'Heavy rainfall expected across Western Province today. Residents in low-lying areas should remain vigilant.',
            source: 'Department of Meteorology',
            timestamp: '2023-06-15T07:15:00Z',
            icon: '⛈️'
        },
        {
            id: 3,
            severity: 'immediate',
            title: 'River Level Alert',
            content: 'Kelani River at Hanwella has reached danger level. Evacuation of nearby areas is recommended.',
            source: 'Disaster Management Centre',
            timestamp: '2023-06-15T06:45:00Z',
            icon: '🌊'
        },
        {
            id: 4,
            severity: 'watch',
            title: 'Landslide Risk',
            content: 'Saturated soil conditions in Ratnapura district increase landslide risk. Avoid hillside travel.',
            source: 'National Building Research Organization',
            timestamp: '2023-06-15T05:20:00Z',
            icon: '⛰️'
        }
    ];

    // Function to render alerts
    function renderAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (alerts.length === 0) {
            container.innerHTML = '<p>No alerts at this time.</p>';
            return;
        }

        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-card ${alert.severity}`;

            alertElement.innerHTML = `
                <div class="alert-header">
                    <span class="alert-title">${alert.icon} ${alert.title}</span>
                    <span class="alert-source">${alert.source}</span>
                </div>
                <div class="alert-content">
                    <p>${alert.content}</p>
                </div>
                <div class="alert-footer">
                    <span class="alert-timestamp">${formatDate(alert.timestamp)}</span>
                    <button class="share-btn" data-alert-id="${alert.id}">
                        Share
                    </button>
                </div>
            `;

            container.appendChild(alertElement);
        });

        // Add event listeners to share buttons
        document.querySelectorAll('.share-btn').forEach(button => {
            button.addEventListener('click', function() {
                const alertId = this.getAttribute('data-alert-id');
                shareAlert(alertId);
            });
        });
    }

    // Function to share an alert
    function shareAlert(alertId) {
        const alert = sampleAlerts.find(a => a.id == alertId);
        if (!alert) return;

        const shareText = `${alert.title}: ${alert.content} - Source: ${alert.source}`;

        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: alert.title,
                text: shareText
            }).catch(console.error);
        } else {
            // Fallback: copy to clipboard
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            // Show confirmation message
            alert('Alert text copied to clipboard. You can now paste it to share.');
        }
    }

    // Initial render
    renderAlerts(sampleAlerts);

    // Simulate periodic updates (in a real app, this would be WebSocket or polling)
    setInterval(() => {
        // This would fetch new alerts from the server
        console.log('Checking for new alerts...');
    }, 60000); // Check every minute
});