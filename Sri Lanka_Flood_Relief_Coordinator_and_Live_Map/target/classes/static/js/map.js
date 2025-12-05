// Map Controller using Leaflet
class MapController {
    constructor() {
        this.map = null;
        this.markers = [];
        this.init();
    }

    init() {
        // Initialize the map
        this.initializeMap();

        // Add sample markers
        this.addSampleMarkers();

        // Load approved places from storage
        this.loadApprovedPlaces();
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
    }

    addSampleMarkers() {
        // Add some sample markers for demonstration
        const samplePlaces = [
            {
                name: "Colombo",
                type: "flood",
                lat: 6.9271,
                lng: 79.8612,
                description: "Capital city with periodic flooding"
            },
            {
                name: "Kandy",
                type: "landslide",
                lat: 7.2906,
                lng: 80.6337,
                description: "Hill country prone to landslides"
            },
            {
                name: "Galle",
                type: "safe-zone",
                lat: 6.0535,
                lng: 80.2210,
                description: "Community center available for shelter"
            }
        ];

        samplePlaces.forEach(place => {
            this.addMarker(place);
        });
    }

    addMarker(place) {
        // Define marker icons based on type
        const iconColors = {
            'flood': '#2196F3',
            'landslide': '#FF9800',
            'road-block': '#9E9E9E',
            'safe-zone': '#4CAF50',
            'rescue-needed': '#F44336'
        };

        const markerIcon = L.divIcon({
            className: `custom-marker marker-${place.type}`,
            html: `<div class="marker-icon" style="background-color: ${iconColors[place.type] || '#2196F3'}">
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
                <h3>${place.name}</h3>
                <p><strong>Type:</strong> ${place.type}</p>
                <p>${place.description}</p>
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

    addApprovedPlace(place) {
        // Convert place data to marker format
        const markerData = {
            id: place.id,
            name: place.name,
            type: place.type,
            lat: place.lat || 7.8731 + (Math.random() - 0.5) * 2, // Random for demo
            lng: place.lng || 80.7718 + (Math.random() - 0.5) * 2, // Random for demo
            description: place.description
        };

        this.addMarker(markerData);
    }

    loadApprovedPlaces() {
        // In a real app, this would fetch from a server
        const savedApproved = localStorage.getItem('approvedReports');
        if (savedApproved) {
            const approvedReports = JSON.parse(savedApproved);
            approvedReports
                .filter(report => report.status === 'approved')
                .forEach(report => {
                    this.addApprovedPlace(report);
                });
        }
    }

    // Method to center map on user's location
    locateUser() {
        this.map.locate({ setView: true, maxZoom: 16 });

        // Handle location found
        this.map.on('locationfound', (e) => {
            L.marker(e.latlng).addTo(this.map)
                .bindPopup('You are here').openPopup();
        });

        // Handle location error
        this.map.on('locationerror', (e) => {
            alert("Unable to locate your position");
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