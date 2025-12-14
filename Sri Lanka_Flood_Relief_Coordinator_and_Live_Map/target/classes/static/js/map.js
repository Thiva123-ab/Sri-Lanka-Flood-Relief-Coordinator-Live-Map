// Map Controller using Leaflet
class MapController {
    constructor() {
        this.map = null;
        this.markers = []; // Store active markers
        this.tempMarker = null; // Track user's clicked location
        this.init();
    }

    init() {
        this.initializeMap();
        this.loadMapData(); // Load data immediately
        this.locateUser();
    }

    initializeMap() {
        // Set up map centered on Sri Lanka
        this.map = L.map('map').setView([7.8731, 80.7718], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        L.control.scale().addTo(this.map);

        // Search Control
        if (L.Control.geocoder) {
            L.Control.geocoder({ defaultMarkGeocode: false })
                .on('markgeocode', (e) => {
                    const center = e.geocode.center;
                    this.map.setView(center, 14);
                    this.handleMapClick({ latlng: center });
                })
                .addTo(this.map);
        }

        // Click Listener
        this.map.on('click', (e) => {
            this.handleMapClick(e);
        });
    }

    // --- FIX: Use Custom Icon for Temp Marker to ensure correct anchoring ---
    handleMapClick(e) {
        const { lat, lng } = e.latlng;

        // Remove previous temp marker
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        // Create a Blue "Selection" Pin using your CSS styles
        const tempIcon = this.createCustomIcon('fa-map-pin', '#2196F3', true);

        this.tempMarker = L.marker([lat, lng], { icon: tempIcon }).addTo(this.map);

        // Bind popup with button
        this.tempMarker.bindPopup(`
            <div style="text-align:center; padding: 5px;">
                <b style="color: #333;">Selected Location</b><br>
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 5px;">
                    ${lat.toFixed(5)}, ${lng.toFixed(5)}
                </div>
                <button onclick="document.getElementById('fab').click()" 
                        style="background:#4CAF50; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus-circle"></i> Report Issue Here
                </button>
            </div>
        `).openPopup();

        // Update Hidden Form Inputs
        const latInput = document.getElementById('selected-lat');
        const lngInput = document.getElementById('selected-lng');
        const statusSpan = document.getElementById('location-status');

        if (latInput && lngInput) {
            latInput.value = lat;
            lngInput.value = lng;
        }

        if (statusSpan) {
            statusSpan.innerHTML = `<i class="fas fa-check-circle" style="color:#4CAF50;"></i> Location Selected`;
            statusSpan.style.color = '#4CAF50';
        }
    }

    // Clear existing markers before reloading
    clearMarkers() {
        this.markers.forEach(obj => {
            this.map.removeLayer(obj.marker);
        });
        this.markers = [];
    }

    // Load Public Approved Data + User's Pending Data
    loadMapData() {
        this.clearMarkers();

        // 1. Fetch Public Approved Markers
        fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .then(data => {
                data.forEach(place => this.addMarker(place, false));
            })
            .catch(err => console.error("Error loading approved markers:", err));

        // 2. Fetch My Pending Markers (if logged in)
        if (window.authManager && window.authManager.isAuthenticated()) {
            fetch('http://localhost:8080/api/markers/my-reports', { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    const pending = data.filter(m => m.status && m.status.toLowerCase() === 'pending');
                    pending.forEach(place => this.addMarker(place, true));
                })
                .catch(err => console.error("Error loading my reports:", err));
        }
    }

    addMarker(place, isPending = false) {
        const config = this.getMarkerConfig(place.type);
        const markerIcon = this.createCustomIcon(config.icon, config.color, false, isPending);

        const marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(this.map);

        // Status Badge for Popup
        const statusBadge = isPending ? '<br><span style="background:orange; color:white; padding:2px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold;">PENDING APPROVAL</span>' : '';
        let timeStr = "Recently";
        if (place.timestamp) {
            const date = new Date(place.timestamp);
            timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        marker.bindPopup(`
            <div class="popup-content" style="min-width: 200px;">
                <div style="border-bottom: 2px solid ${config.color}; padding-bottom: 5px; margin-bottom: 8px;">
                    <h3 style="margin: 0; color: #333; font-size: 1.1rem;">${place.name}</h3>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                        <span style="background:${config.color}; color:white; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:bold;">
                            ${place.type ? place.type.toUpperCase().replace('-', ' ') : 'REPORT'}
                        </span>
                    </div>
                    ${statusBadge}
                </div>
                
                <p style="margin: 5px 0; color: #555; font-size: 0.9rem;">
                    ${place.description || "No description provided."}
                </p>

                <div style="background: #f5f5f5; padding: 5px; border-radius: 4px; margin-top: 8px; font-size: 0.8rem; color: #666;">
                    <div><strong>Severity:</strong> <span style="color:${this.getSeverityColor(place.severity)}">${(place.severity || 'Normal').toUpperCase()}</span></div>
                    <div><strong>Reported:</strong> ${timeStr}</div>
                    ${place.submittedBy ? `<div><strong>By:</strong> ${place.submittedBy}</div>` : ''}
                </div>
            </div>
        `);

        this.markers.push({ id: place.id, marker: marker, data: place });
    }

    // --- HELPER: Centralized Icon Creation ---
    createCustomIcon(iconClass, color, isPulse = false, isPending = false) {
        // Opacity for pending reports
        const opacity = isPending ? 0.6 : 1.0;

        // Remove 'fa-' if passed, to normalize
        const icon = iconClass.startsWith('fa-') ? iconClass : `fa-${iconClass}`;

        return L.divIcon({
            className: 'custom-marker-container',
            html: `
                <div class="marker-pin" style="background-color: ${color}; opacity: ${opacity}; transform: rotate(-45deg);">
                    <i class="fas ${icon}" style="transform: rotate(45deg); color: white; font-size: 14px;"></i>
                </div>
                ${isPulse ? `<div class="marker-pulse" style="border-color: ${color};"></div>` : ''}
            `,
            iconSize: [30, 42],
            iconAnchor: [15, 42], // Correct anchor: Horizontal Center (15), Bottom (42)
            popupAnchor: [0, -35]
        });
    }

    getMarkerConfig(type) {
        switch (type) {
            case 'flood': return { icon: 'fa-water', color: '#2196F3' };
            case 'landslide': return { icon: 'fa-mountain', color: '#795548' };
            case 'road-block': return { icon: 'fa-road', color: '#607D8B' };
            case 'safe-zone': return { icon: 'fa-house-user', color: '#4CAF50' };
            case 'rescue-needed': return { icon: 'fa-life-ring', color: '#F44336' };
            case 'medical': return { icon: 'fa-briefcase-medical', color: '#E91E63' };
            default: return { icon: 'fa-map-marker-alt', color: '#333' };
        }
    }

    getSeverityColor(severity) {
        if(!severity) return '#333';
        switch(severity.toLowerCase()) {
            case 'critical': return '#D32F2F';
            case 'high': return '#F57C00';
            case 'medium': return '#FBC02D';
            default: return '#388E3C';
        }
    }

    locateUser() {
        this.map.locate({ setView: false, maxZoom: 16 });
        this.map.on('locationfound', (e) => {
            // Optional: Draw a circle for user accuracy
            // L.circleMarker(...)

            // NOTE: We do NOT set tempMarker here automatically to avoid confusion.
            // Users must click to set the pin.
            if (!this.tempMarker) this.map.setView(e.latlng, 13);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map')) {
        window.mapController = new MapController();
    }
});