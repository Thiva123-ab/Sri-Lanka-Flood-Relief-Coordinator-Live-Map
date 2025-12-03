// Map functionality for Sri Lanka Flood Relief Coordinator

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map').setView([7.8731, 80.7718], 8); // Centered on Sri Lanka

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample data for markers (in a real app, this would come from an API)
    const sampleMarkers = [
        {
            type: 'shelter',
            lat: 6.5854,
            lng: 79.9607,
            name: 'Kalutara Temple Shelter',
            capacity: 200,
            contact: '034-222-2222'
        },
        {
            type: 'shelter',
            lat: 6.8423,
            lng: 79.9647,
            name: 'Gampaha Community Center',
            capacity: 150,
            contact: '033-222-3333'
        },
        {
            type: 'flood',
            lat: 6.5700,
            lng: 79.9800,
            name: 'Severe Flooding Reported',
            depth: '1.5m',
            reportedBy: 'Local Resident'
        },
        {
            type: 'flood',
            lat: 6.8347,
            lng: 79.9500,
            name: 'Road Blocked by Flood',
            depth: '2m',
            reportedBy: 'Community Volunteer'
        },
        {
            type: 'supply',
            lat: 6.5800,
            lng: 79.9700,
            name: 'Water Distribution Point',
            hours: '8AM-6PM',
            contact: '077-123-4567'
        },
        {
            type: 'supply',
            lat: 6.8400,
            lng: 79.9600,
            name: 'Food Distribution Center',
            hours: '9AM-5PM',
            contact: '076-987-6543'
        }
    ];

    // Create markers with custom icons
    const markers = [];

    sampleMarkers.forEach(location => {
        let markerIcon;
        let markerClass;

        switch(location.type) {
            case 'shelter':
                markerIcon = L.divIcon({
                    className: 'shelter-marker',
                    html: '🏠',
                    iconSize: [24, 24]
                });
                markerClass = 'shelter-marker';
                break;
            case 'flood':
                markerIcon = L.divIcon({
                    className: 'flood-marker',
                    html: '🌊',
                    iconSize: [24, 24]
                });
                markerClass = 'flood-marker';
                break;
            case 'supply':
                markerIcon = L.divIcon({
                    className: 'supply-marker',
                    html: '📦',
                    iconSize: [24, 24]
                });
                markerClass = 'supply-marker';
                break;
        }

        const marker = L.marker([location.lat, location.lng], {icon: markerIcon}).addTo(map);

        // Create popup content
        let popupContent = `
            <div class="marker-popup">
                <h3>${location.name}</h3>
        `;

        if (location.type === 'shelter') {
            popupContent += `
                <span class="marker-type shelter-type">Safe Shelter</span>
                <p><strong>Capacity:</strong> ${location.capacity} people</p>
                <p><strong>Contact:</strong> ${location.contact}</p>
            `;
        } else if (location.type === 'flood') {
            popupContent += `
                <span class="marker-type flood-type">Flood Report</span>
                <p><strong>Water Depth:</strong> ${location.depth}</p>
                <p><strong>Reported By:</strong> ${location.reportedBy}</p>
            `;
        } else if (location.type === 'supply') {
            popupContent += `
                <span class="marker-type supply-type">Supply Point</span>
                <p><strong>Hours:</strong> ${location.hours}</p>
                <p><strong>Contact:</strong> ${location.contact}</p>
            `;
        }

        popupContent += `
            </div>
        `;

        marker.bindPopup(popupContent);
        markers.push({marker, type: location.type});
    });

    // Add legend to map
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'map-legend');
        div.innerHTML = `
            <div class="legend-item">
                <span class="legend-color shelter"></span>
                <span>Shelters</span>
            </div>
            <div class="legend-item">
                <span class="legend-color flood"></span>
                <span>Flood Reports</span>
            </div>
            <div class="legend-item">
                <span class="legend-color supply"></span>
                <span>Supply Points</span>
            </div>
        `;
        return div;
    };

    legend.addTo(map);

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.getAttribute('data-filter');

            // Show/hide markers based on filter
            markers.forEach(markerObj => {
                if (filterType === 'all' || markerObj.type === filterType) {
                    markerObj.marker.addTo(map);
                } else {
                    map.removeLayer(markerObj.marker);
                }
            });
        });
    });

    // SOS button functionality
    const sosButton = document.getElementById('requestHelpBtn');
    if (sosButton) {
        sosButton.addEventListener('click', function() {
            // Redirect to help page
            window.location.href = 'help.html';
        });
    }

    // Try to get user's location and center map
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                map.setView([userLat, userLng], 13);

                // Add user location marker
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: '📍',
                    iconSize: [24, 24]
                });

                L.marker([userLat, userLng], {icon: userIcon})
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
            },
            function(error) {
                console.log('Unable to get user location:', error);
            }
        );
    }
});