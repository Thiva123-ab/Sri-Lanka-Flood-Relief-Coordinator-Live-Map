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

        // --- NEW: Start Notification Poller ---
        // Checks for unread messages if the user is logged in
        if (window.authManager && window.authManager.isAuthenticated()) {
            this.startNotificationService();
        }

        const path = window.location.pathname;

        // On Map Page: If Admin, load the pending sidebar
        if (path.includes('map.html') || path.endsWith('/')) {
            if (window.authManager && window.authManager.isAdmin()) {
                this.loadPendingReports();
                // Show admin panel if it exists
                const adminPanel = document.getElementById('admin-panel');
                if(adminPanel) adminPanel.style.display = 'block';
            }
        }
        // On Reports Page: Load public feed (only if report.js isn't doing it)
        else if (path.includes('report.html')) {
            this.loadPublicReports();
        }
    }

    // --- NOTIFICATION SYSTEM START ---

    startNotificationService() {
        // Check immediately upon load
        this.checkUnreadMessages();
        // Then check every 3 seconds
        setInterval(() => this.checkUnreadMessages(), 3000);
    }

    checkUnreadMessages() {
        fetch('http://localhost:8080/api/messages/unread-count', { credentials: 'include' })
            .then(res => {
                if(res.ok) return res.json();
                return 0;
            })
            .then(count => {
                this.updateChatBadge(count);
            })
            .catch(err => console.error("Notification poll error:", err));
    }

    updateChatBadge(count) {
        // Find the Chat button in the bottom nav
        // We look for the button that links to chat.html
        const chatBtns = document.querySelectorAll('.nav-btn[onclick*="chat.html"]');

        chatBtns.forEach(btn => {
            // Remove existing badge if it exists
            const existingBadge = btn.querySelector('.notification-badge');
            if (existingBadge) existingBadge.remove();

            // If count > 0, add new badge
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.innerText = count > 99 ? '99+' : count;
                btn.appendChild(badge);
            }
        });
    }

    // --- NOTIFICATION SYSTEM END ---

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

        // --- CONNECTING THE HELP FORM ---
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

        // 1. Reset the standard form fields
        const placeForm = document.getElementById('place-form');
        if (placeForm) placeForm.reset();

        // 2. Clear the hidden coordinate fields from the map
        const latInput = document.getElementById('selected-lat');
        const lngInput = document.getElementById('selected-lng');
        if (latInput) latInput.value = "";
        if (lngInput) lngInput.value = "";

        // 3. Reset the visual status text
        const statusSpan = document.getElementById('location-status');
        if(statusSpan) {
            statusSpan.innerHTML = "Using Device GPS (Click map to select)";
            statusSpan.style.color = "#ccc";
        }
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

        // Get the manually selected coordinates (if any)
        const selectedLat = document.getElementById('selected-lat').value;
        const selectedLng = document.getElementById('selected-lng').value;

        const report = {
            name: placeName,
            type: placeType,
            description: placeDescription,
            severity: placeSeverity,
            status: 'pending',
            submittedBy: window.authManager.getCurrentUser().username,
        };

        // --- UPDATED LOGIC: Map Selection vs GPS ---

        if (selectedLat && selectedLng) {
            // CASE A: User clicked a spot on the map
            report.lat = parseFloat(selectedLat);
            report.lng = parseFloat(selectedLng);
            this.sendReportToBackend(report);
        } else {
            // CASE B: Fallback to device Geolocation
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        report.lat = position.coords.latitude;
                        report.lng = position.coords.longitude;
                        this.sendReportToBackend(report);
                    },
                    (error) => {
                        console.log("Geolocation error: " + error.message);
                        alert("Could not detect location automatically. Please click on the map to set the location.");
                    }
                );
            } else {
                alert("GPS not supported. Please click on the map to set a location.");
            }
        }
    }

    sendReportToBackend(report) {
        fetch('http://localhost:8080/api/markers/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(report)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to submit report (Status: ' + response.status + ')');
            })
            .then(data => {
                alert('Report submitted successfully! It will appear as PENDING until approved.');
                this.closePlaceModal();

                // --- LIVE UPDATE: Refresh the map immediately ---
                if (window.mapController) {
                    window.mapController.loadMapData();
                }

                if (window.authManager && window.authManager.isAdmin()) {
                    this.loadPendingReports();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error submitting report. Please check backend connection.');
            });
    }

    // --- Admin/Pending Report Logic (Corrected Details) ---

    loadPendingReports() {
        const container = document.getElementById('pending-reports');
        if (!container) return; // Exit if element doesn't exist (e.g. on report.html)

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

                // Sort by ID desc (newest first)
                this.pendingReports.sort((a,b) => b.id - a.id);

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

        // Format Timestamp
        let timeStr = "Just now";
        if(report.timestamp) {
            const date = new Date(report.timestamp);
            timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        }

        // Add detailed info for Admins
        card.innerHTML = `
            <div class="report-header">
                <div class="report-title">${report.name}</div>
                <div class="report-type">${report.type}</div>
            </div>
            <div class="report-description">${report.description}</div>
            
            <div style="font-size: 0.85rem; color: #ddd; margin: 10px 0; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 5px;">
                <div><i class="fas fa-exclamation-circle"></i> Severity: <strong>${report.severity}</strong></div>
                <div><i class="fas fa-map-marker-alt"></i> Loc: ${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}</div>
                <div><i class="fas fa-clock"></i> Time: ${timeStr}</div>
                <div><i class="fas fa-user"></i> By: ${report.submittedBy}</div>
            </div>

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
                    // Live Update
                    if (window.location.pathname.includes('map.html')) {
                        this.loadPendingReports(); // Refresh sidebar
                        if (window.mapController) window.mapController.loadMapData(); // Refresh Map
                    } else {
                        location.reload(); // Fallback for other pages
                    }
                } else {
                    alert('Failed to approve report');
                }
            });
    }

    rejectReport(reportId) {
        if (!confirm('Reject this report?')) return;
        fetch(`http://localhost:8080/api/markers/${reportId}/reject`, { method: 'PUT', credentials: 'include' }) // Changed DELETE to PUT for status update
            .then(res => {
                if (res.ok) {
                    alert('Report rejected!');
                    if (window.location.pathname.includes('map.html')) {
                        this.loadPendingReports();
                    } else {
                        location.reload();
                    }
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

    // --- NEW HELP REQUEST LOGIC (Corrected Endpoint) ---
    handleHelpRequest(e) {
        e.preventDefault();

        // 1. Auth Check
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            alert("You must be logged in to request help.");
            window.location.href = "login.html";
            return;
        }

        // 2. Gather Data
        const name = document.getElementById('help-name').value;
        const phone = document.getElementById('help-phone').value;
        const locationText = document.getElementById('help-location').value;
        const type = document.getElementById('help-type').value;
        const description = document.getElementById('help-description').value;
        const isUrgent = document.getElementById('help-urgent').checked;

        // 3. Helper to send data
        const submitData = (lat, lng) => {
            const fullDetails = `Location: ${locationText} \nDetails: ${description} \nUrgent: ${isUrgent ? "YES" : "NO"}`;

            const payload = {
                name: name,
                phone: phone,
                latitude: lat,
                longitude: lng,
                needs: [type],
                details: fullDetails
            };

            fetch('http://localhost:8080/api/help-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error("Failed to submit");
                })
                .then(data => {
                    alert('Help Request Sent Successfully! Rescue teams have been notified.');
                    e.target.reset();
                })
                .catch(err => {
                    console.error(err);
                    alert('Error sending help request. Please check connection.');
                });
        };

        // 4. Get Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    submitData(pos.coords.latitude, pos.coords.longitude);
                },
                (err) => {
                    console.warn("Location access denied or failed", err);
                    submitData(0.0, 0.0);
                }
            );
        } else {
            submitData(0.0, 0.0);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.floodApp = new FloodReliefApp();
});