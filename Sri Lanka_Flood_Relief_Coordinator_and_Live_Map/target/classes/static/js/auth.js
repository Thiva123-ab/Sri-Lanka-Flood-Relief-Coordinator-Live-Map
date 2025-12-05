// Authentication System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const userData = localStorage.getItem('floodReliefUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        } else {
            // Basic protection: Redirect to login if on a protected page and not authenticated
            const publicPages = ['index.html', 'login.html', 'register.html', ''];
            const path = window.location.pathname;
            const pageName = path.split("/").pop();

            // If the current page is not in the public list and user is not logged in
            if (!publicPages.includes(pageName) && !this.currentUser) {
                // window.location.href = 'login.html';
            }
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    login(username, password) {
        // Backend API call for Login
        // Ensure this matches your backend URL (usually port 8080)
        fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(async response => {
                if (response.ok) {
                    // If login is successful, the backend returns the User object
                    const user = await response.json();

                    // Save the user data
                    this.currentUser = user;
                    localStorage.setItem('floodReliefUser', JSON.stringify(this.currentUser));
                    this.updateUI();

                    // Redirect based on the role coming from the DATABASE
                    if (user.role === 'ADMIN') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'map.html';
                    }
                } else {
                    alert('Invalid username or password');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Cannot connect to server. Make sure Backend is running on port 8080.');
            });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('floodReliefUser');
        window.location.href = 'login.html';
    }

    updateUI() {
        if (this.currentUser) {
            const roleElement = document.getElementById('user-role');
            if (roleElement) {
                // Format role for display (ADMIN -> Admin)
                const roleName = this.currentUser.role;
                const displayRole = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();

                roleElement.textContent = displayRole;
                roleElement.className = roleName === 'ADMIN' ? 'admin-badge' : 'member-badge';
            }

            // Show admin panel if user is admin
            if (this.currentUser.role === 'ADMIN') {
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel) {
                    adminPanel.style.display = 'block';
                }
            }
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'ADMIN';
    }
}

// Live Rain Animation System
class RainManager {
    constructor() {
        this.init();
    }

    init() {
        // Create container
        const container = document.createElement('div');
        container.className = 'rain-container';
        document.body.appendChild(container);

        // Add drops
        const dropCount = 80; // Number of rain drops
        for (let i = 0; i < dropCount; i++) {
            this.createDrop(container);
        }
    }

    createDrop(container) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';

        // Randomize drop properties for natural look
        const left = Math.random() * 100; // Random horizontal position 0-100%
        const duration = Math.random() * 1.5 + 1; // Speed: 1s to 2.5s (Slow-ish)
        const delay = Math.random() * 2; // Random delay so they don't all start at once
        const opacity = Math.random() * 0.5 + 0.1; // Varied visibility

        drop.style.left = `${left}%`;
        drop.style.animationDuration = `${duration}s`;
        drop.style.animationDelay = `${delay}s`;
        drop.style.opacity = opacity;

        container.appendChild(drop);
    }
}

// Lightning Animation System
class LightningManager {
    constructor() {
        this.init();
    }

    init() {
        // Create flash element
        this.flashElement = document.createElement('div');
        this.flashElement.className = 'lightning-flash';
        document.body.appendChild(this.flashElement);

        // Start the loop
        this.scheduleStrike();
    }

    scheduleStrike() {
        // Random time range: 8 to 15 seconds
        const minTime = 8000;
        const randomness = 7000;
        const delay = Math.random() * randomness + minTime;

        setTimeout(() => {
            this.triggerStrike();
        }, delay);
    }

    triggerStrike() {
        this.flashElement.classList.add('flash-active');

        // Remove class after animation finishes to reset
        setTimeout(() => {
            this.flashElement.classList.remove('flash-active');
            this.scheduleStrike(); // Schedule next one
        }, 300); // Wait slightly longer than animation
    }
}

// Initialize All Systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.rainManager = new RainManager();
    window.lightningManager = new LightningManager();
});