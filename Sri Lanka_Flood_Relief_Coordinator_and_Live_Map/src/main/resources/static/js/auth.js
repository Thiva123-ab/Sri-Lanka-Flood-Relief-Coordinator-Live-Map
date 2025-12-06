// Source: Sri Lanka_Flood_Relief_Coordinator_and_Live_Map/src/main/resources/static/js/auth.js

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        const userData = localStorage.getItem('floodReliefUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    login(username, password) {
        // FIXED: Added credentials: 'include' to save the session cookie
        fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // <--- CRITICAL FIX
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(async response => {
                if (response.ok) {
                    const user = await response.json();
                    this.currentUser = user;
                    localStorage.setItem('floodReliefUser', JSON.stringify(this.currentUser));
                    this.updateUI();

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
                alert('Login failed. Cannot connect to server.');
            });
    }

    logout() {
        // Optional: Call backend logout to clear cookie
        fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        }).finally(() => {
            this.currentUser = null;
            localStorage.removeItem('floodReliefUser');
            window.location.href = 'index.html';
        });
    }

    updateUI() {
        if (this.currentUser) {
            const roleElement = document.getElementById('user-role');
            if (roleElement) {
                const roleName = this.currentUser.role;
                const displayRole = roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase();
                roleElement.textContent = displayRole;
                roleElement.className = roleName === 'ADMIN' ? 'admin-badge' : 'member-badge';
            }
            if (this.currentUser.role === 'ADMIN') {
                const adminPanel = document.getElementById('admin-panel');
                if (adminPanel) adminPanel.style.display = 'block';
            }
        }
    }

    getCurrentUser() { return this.currentUser; }
    isAuthenticated() { return !!this.currentUser; }
    isAdmin() { return this.currentUser && this.currentUser.role === 'ADMIN'; }
}

// Live Rain Animation System
class RainManager {
    constructor() { this.init(); }
    init() {
        const container = document.createElement('div');
        container.className = 'rain-container';
        document.body.appendChild(container);
        for (let i = 0; i < 80; i++) this.createDrop(container);
    }
    createDrop(container) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.opacity = Math.random() * 0.5 + 0.1;
        container.appendChild(drop);
    }
}

// Lightning Animation System
class LightningManager {
    constructor() { this.init(); }
    init() {
        this.flashElement = document.createElement('div');
        this.flashElement.className = 'lightning-flash';
        document.body.appendChild(this.flashElement);
        this.scheduleStrike();
    }
    scheduleStrike() {
        const delay = Math.random() * 7000 + 8000;
        setTimeout(() => this.triggerStrike(), delay);
    }
    triggerStrike() {
        this.flashElement.classList.add('flash-active');
        setTimeout(() => {
            this.flashElement.classList.remove('flash-active');
            this.scheduleStrike();
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.rainManager = new RainManager();
    window.lightningManager = new LightningManager();
});