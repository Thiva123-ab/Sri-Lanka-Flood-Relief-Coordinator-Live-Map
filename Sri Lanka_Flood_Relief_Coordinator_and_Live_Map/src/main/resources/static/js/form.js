// Form functionality for Sri Lanka Flood Relief Coordinator

document.addEventListener('DOMContentLoaded', function() {
    // Selected needs array
    let selectedNeeds = [];

    // Get DOM elements
    const form = document.getElementById('helpForm');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationDisplay = document.getElementById('locationDisplay');
    const needsInput = document.getElementById('needs');
    const needButtons = document.querySelectorAll('.need-btn');
    const formMessage = document.getElementById('formMessage');

    // Add event listeners to need buttons
    needButtons.forEach(button => {
        button.addEventListener('click', function() {
            const need = this.getAttribute('data-need');

            // Toggle selection
            if (selectedNeeds.includes(need)) {
                selectedNeeds = selectedNeeds.filter(n => n !== need);
                this.classList.remove('selected');
            } else {
                selectedNeeds.push(need);
                this.classList.add('selected');
            }

            // Update hidden input
            needsInput.value = selectedNeeds.join(',');
        });
    });

    // Get user location
    getLocationBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            showMessage('formMessage', 'Geolocation is not supported by your browser.', false);
            return;
        }

        showMessage('formMessage', 'Getting your location...', true);

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                document.getElementById('latitude').value = latitude;
                document.getElementById('longitude').value = longitude;

                locationDisplay.textContent = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                showMessage('formMessage', 'Location captured successfully!', true);
            },
            function(error) {
                let errorMessage = 'Unable to get your location.';

                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get user location timed out.';
                        break;
                    case error.UNKNOWN_ERROR:
                        errorMessage = 'An unknown error occurred.';
                        break;
                }

                showMessage('formMessage', errorMessage, false);
            }
        );
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;

            if (!name || !phone) {
                showMessage('formMessage', 'Please fill in all required fields.', false);
                return;
            }

            if (!latitude || !longitude) {
                showMessage('formMessage', 'Please capture your location.', false);
                return;
            }

            if (selectedNeeds.length === 0) {
                showMessage('formMessage', 'Please select at least one need.', false);
                return;
            }

            // Prepare form data
            const formData = {
                name: name,
                phone: phone,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                needs: selectedNeeds,
                details: document.getElementById('details').value.trim()
            };

            // Submit form (in a real app, this would be an API call)
            submitHelpRequest(formData);
        });
    }

    // Function to submit help request
    function submitHelpRequest(data) {
        showMessage('formMessage', 'Submitting your request...', true);

        // Simulate API call delay
        setTimeout(() => {
            // In a real implementation, this would be:
            /*
            fetch('/api/help-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                showMessage('formMessage', 'Help request submitted successfully!', true);
                form.reset();
                selectedNeeds = [];
                locationDisplay.textContent = '';
                needsInput.value = '';
                // Reset need buttons
                needButtons.forEach(btn => btn.classList.remove('selected'));
            })
            .catch(error => {
                showMessage('formMessage', 'Error submitting request. Please try again.', false);
                console.error('Error:', error);
            });
            */

            // For demo purposes, we'll just simulate success
            showMessage('formMessage', 'Help request submitted successfully!', true);

            // Reset form
            form.reset();
            selectedNeeds = [];
            locationDisplay.textContent = '';
            needsInput.value = '';

            // Reset need buttons
            needButtons.forEach(btn => btn.classList.remove('selected'));

        }, 1500);
    }

    // Offline queuing functionality
    window.addEventListener('online', function() {
        // In a real implementation, this would check for queued requests
        // and submit them when connectivity is restored
        console.log('Connection restored. Checking for queued requests...');
    });

    window.addEventListener('offline', function() {
        showMessage('formMessage', 'You are offline. Requests will be sent when connection is restored.', false);
    });
});