// Map Controller using Leaflet
class MapController {
    constructor() {
        this.map = null;
        this.markers = [];
        this.tempMarker = null; // Track the user's clicked location
        this.init();
    }

    init() {
        // Initialize the map
        this.initializeMap();

        // Load real data from backend instead of samples
        this.loadApprovedPlaces();

        // Try to center on user
        this.locateUser();
    }

    initializeMap() {
        // Set up the map centered on Sri Lanka
        this.map = L.map('map').setView([7.8731, 80.7718], 8); // Center of Sri Lanka

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        // Add a scale control
        L.control.scale().addTo(this.map);

        // --- NEW: Add Search Bar (Leaflet Control Geocoder) ---
        if (L.Control.geocoder) {
            L.Control.geocoder({
                defaultMarkGeocode: false // We will handle the marker placement manually
            })
                .on('markgeocode', (e) => {
                    const center = e.geocode.center;
                    // 1. Move map to the searched location
                    this.map.setView(center, 14);
                    // 2. Trigger our existing pin logic to set coordinates
                    this.handleMapClick({ latlng: center });
                })
                .addTo(this.map);
        }

        // --- Add Click Listener for "Pick Location" ---
        this.map.on('click', (e) => {
            this.handleMapClick(e);
        });
    }

    // --- Handle Map Clicks OR Search Results ---
    handleMapClick(e) {
        const { lat, lng } = e.latlng;

        // 1. Remove previous temp marker if exists
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        // 2. Add new temp marker
        this.tempMarker = L.marker([lat, lng], { opacity: 0.7 }).addTo(this.map);

        // 3. Bind a popup to guide the user
        this.tempMarker.bindPopup(`
            <div style="text-align:center">
                <b>Selected Location</b><br>
                <button onclick="document.getElementById('fab').click()" 
                        style="background:#4CAF50; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-top:5px;">
                    Report Issue Here
                </button>
            </div>
        `).openPopup();

        // 4. Update the hidden inputs in the HTML form (if they exist)
        const latInput = document.getElementById('selected-lat');
        const lngInput = document.getElementById('selected-lng');
        const statusSpan = document.getElementById('location-status');

        if (latInput && lngInput) {
            latInput.value = lat;
            lngInput.value = lng;
        }

        if (statusSpan) {
            statusSpan.textContent = `Pin Dropped (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            statusSpan.style.color = '#4CAF50';
        }
    }

    // --- Add Marker with correct coloring ---
    addMarker(place, isPending = false) {
        // Define marker icons based on type
        const iconColors = {
            'flood': '#2196F3',
            'landslide': '#FF9800',
            'road-block': '#9E9E9E',
            'safe-zone': '#4CAF50',
            'rescue-needed': '#F44336'
        };

        // If pending, make it slightly transparent
        const opacity = isPending ? 0.6 : 1.0;
        const statusTag = isPending ? '<br><b style="color:orange; font-size:0.8rem;">(PENDING APPROVAL)</b>' : '';

        const markerIcon = L.divIcon({
            className: `custom-marker marker-${place.type}`,
            html: `<div class="marker-icon" style="background-color: ${iconColors[place.type] || '#2196F3'}; opacity: ${opacity}">
                     <i class="fas fa-${this.getIconForType(place.type)}"></i>
                   </div>`,
            iconSize: [30, 40],
            iconAnchor: [15, 40]
        });

        // Create marker
        const marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(this.map);

        // Add popup
        marker.bindPopup(`
            <div class="popup-content">
                <h3>${place.name} ${statusTag}</h3>
                <p><strong>Type:</strong> ${place.type.toUpperCase()}</p>
                <p>${place.description}</p>
                ${place.submittedBy ? `<small>Reported by: ${place.submittedBy}</small>` : ''}
            </div>
        `);

        // Store reference
        this.markers.push({
            id: place.id || Date.now(),
            marker: marker,
            data: place
        });

        return marker;
    }

    getIconForType(type) {
        const icons = {
            'flood': 'water',
            'landslide': 'mountain',
            'road-block': 'ban',
            'safe-zone': 'home',
            'rescue-needed': 'exclamation-triangle'
        };
        return icons[type] || 'map-marker-alt';
    }

    // --- Fetch Real Data ---
    loadApprovedPlaces() {
        // Fetch approved markers from Backend
        fetch('/api/markers/approved')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch markers");
                return res.json();
            })
            .then(data => {
                data.forEach(place => {
                    this.addMarker(place);
                });
                console.log(`Loaded ${data.length} approved markers.`);
            })
            .catch(err => console.error("Error loading map markers:", err));

        // Optional: If user is logged in, load their pending reports too
        if (window.authManager && window.authManager.isAuthenticated()) {
            fetch('/api/markers/my-reports', { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    // Only add the ones that are pending (approved ones are already fetched above)
                    const pending = data.filter(m => m.status && m.status.toLowerCase() === 'pending');
                    pending.forEach(place => this.addMarker(place, true)); // true = isPending
                })
                .catch(err => console.error("Error loading user reports:", err));
        }
    }

    // Method to center map on user's location
    locateUser() {
        this.map.locate({ setView: false, maxZoom: 16 });

        // Handle location found
        this.map.on('locationfound', (e) => {
            // Show a specific user location dot
            L.circleMarker(e.latlng, {
                radius: 8,
                fillColor: "#3388ff",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map).bindPopup('You are here');

            // Only center on user if we haven't already clicked a specific spot
            if (!this.tempMarker) {
                this.map.setView(e.latlng, 12);
            }
        });

        // Handle location error
        this.map.on('locationerror', (e) => {
            console.log("Unable to locate position (GPS might be disabled)");
        });
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the main page with a map
    if (document.getElementById('map')) {
        window.mapController = new MapController();
    }
});