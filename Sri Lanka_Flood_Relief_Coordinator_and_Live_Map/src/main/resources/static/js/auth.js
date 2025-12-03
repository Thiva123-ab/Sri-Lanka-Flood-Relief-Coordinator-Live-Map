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
            // Redirect to login if not authenticated
            if (!window.location.pathname.includes('login.html') &&
                !window.location.pathname.includes('register.html')) {
                window.location.href = 'login.html';
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

    login(username, password, role) {
        // In a real app, this would be an API call
        this.currentUser = {
            username: username,
            role: role,
            id: Date.now()
        };

        // Save to localStorage
        localStorage.setItem('floodReliefUser', JSON.stringify(this.currentUser));
        this.updateUI();

        // Redirect to main app
        window.location.href = 'index.html';
        return true;
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
                roleElement.textContent = this.currentUser.role === 'admin' ? 'Admin' : 'Member';
                roleElement.className = this.currentUser.role === 'admin' ? 'admin-badge' : 'member-badge';
            }

            // Show admin panel if user is admin
            if (this.currentUser.role === 'admin') {
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
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Sample login page functionality
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const role = document.getElementById('role').value;

                // Simple validation
                if (username && password) {
                    window.authManager.login(username, password, role);
                }
            });
        }
    });
}