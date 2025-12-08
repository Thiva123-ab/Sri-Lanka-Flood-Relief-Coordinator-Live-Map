class HelpFeedManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadRequests();
    }

    loadRequests() {
        const container = document.getElementById('help-feed-list');
        if (!container) return;

        fetch('http://localhost:8080/api/help-requests')
            .then(res => res.json())
            .then(data => {
                container.innerHTML = '';

                if (data.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #ccc;">
                            <i class="fas fa-hands-helping" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <p>No active help requests found.</p>
                        </div>`;
                    return;
                }

                // Sort newest first
                data.sort((a, b) => b.id - a.id);

                data.forEach(req => {
                    const card = this.createCard(req);
                    container.appendChild(card);
                });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p style="text-align:center; color:#F44336;">Failed to load requests.</p>';
            });
    }

    createCard(req) {
        const card = document.createElement('div');
        card.className = `report-card rescue-needed`; // Reusing red alert style

        let needsHtml = '';
        if (req.needs && req.needs.length > 0) {
            needsHtml = `<div style="margin-top:10px; font-weight:bold; color:#FFD700; background:rgba(0,0,0,0.2); padding:5px; border-radius:5px;">
                Needs: ${req.needs.join(', ')}
            </div>`;
        }

        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">
                    <i class="fas fa-hands-helping"></i> ${req.name}
                </div>
                <div class="report-type" style="background:#F44336;">URGENT</div>
            </div>
            <div class="report-description" style="color:#fff;">
                <p>${req.details}</p>
                <div style="margin-top:10px; font-size:0.9rem; color:#ddd;">
                     <i class="fas fa-phone"></i> ${req.phone} <br>
                     <i class="fas fa-map-marker-alt"></i> ${req.latitude}, ${req.longitude}
                </div>
                ${needsHtml}
            </div>
        `;
        return card;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HelpFeedManager();
});