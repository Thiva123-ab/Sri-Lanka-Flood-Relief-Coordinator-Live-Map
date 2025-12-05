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
            // You can customize this list based on your needs
            const publicPages = ['index.html', 'login.html', 'register.html', ''];
            const path = window.location.pathname;
            const pageName = path.split("/").pop();

            // If the current page is not in the public list and user is not logged in
            if (!publicPages.includes(pageName) && !this.currentUser) {
                // window.location.href = 'login.html'; // Uncomment to enforce protection
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
        // Using http://localhost:8080/api/auth/login
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
                    // Java Enum returns "ADMIN" or "MEMBER" (Uppercase)
                    if (user.role === 'ADMIN') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'map.html';
                    }
                } else {
                    // Backend returned 401 or 400
                    alert('Invalid username or password');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Cannot connect to server.');
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
        // Check for 'ADMIN' (uppercase) because that's how Java sends it
        return this.currentUser && this.currentUser.role === 'ADMIN';
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});