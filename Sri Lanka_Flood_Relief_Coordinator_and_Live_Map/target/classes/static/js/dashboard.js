// Dashboard Manager for Landing Page (index.html)
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkAuthStatus();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize animations
        this.initAnimations();

        // --- NEW: Load Live Statistics ---
        this.loadStats();
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('floodReliefUser');
        if (userData) {
            const user = JSON.parse(userData);
            const roleElement = document.getElementById('user-role');
            const loginButton = document.getElementById('login-btn');

            if (roleElement && loginButton) {
                roleElement.textContent = `Welcome! ${user.username}`;
                // Handle casing for role check (ADMIN vs admin)
                const isAdmin = user.role === 'ADMIN' || user.role === 'admin';
                roleElement.className = isAdmin ? 'admin-badge' : 'member-badge';

                loginButton.textContent = 'Logout';
                loginButton.onclick = () => this.logout();
            }
        }
    }

    setupEventListeners() {
        // Login/Logout button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const userData = localStorage.getItem('floodReliefUser');
                if (userData) {
                    this.logout();
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        // Navigation buttons
        const getStartedBtn = document.getElementById('get-started-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                window.location.href = 'register.html';
            });
        }

        const viewMapBtn = document.getElementById('view-map-btn');
        if (viewMapBtn) {
            viewMapBtn.addEventListener('click', () => {
                window.location.href = 'map.html';
            });
        }

        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                window.location.href = 'register.html';
            });
        }

        // Language selector
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.replace('lang-', '');
                this.changeLanguage(lang);
            });
        });
    }

    logout() {
        localStorage.removeItem('floodReliefUser');
        window.location.reload();
    }

    changeLanguage(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');
        console.log(`Language changed to: ${lang}`);
    }

    initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated-entry');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }

    // --- NEW: Live Data Connection ---
    loadStats() {
        // 1. Fetch Locations (Approved Markers)
        // Endpoint: /api/markers/approved
        fetch('http://localhost:8080/api/markers/approved')
            .then(res => res.json())
            .then(data => {
                const count = data.length;
                this.animateValue("locations-count", 0, count, 2000);

                // Derive Communities: (Mock logic: 1 community per ~5 unique reports)
                const communities = Math.max(Math.floor(count / 5), 1);
                this.animateValue("communities-count", 0, communities, 2000);

                // Derive Rescues: (Mock logic: 1 rescue per ~3 reports)
                // Note: Real help requests are private, so we use a proxy for the public page.
                const rescues = Math.max(Math.floor(count / 3), 1);
                this.animateValue("rescues-count", 0, rescues, 2000);
            })
            .catch(err => console.error("Failed to load map stats", err));

        // 2. Fetch Alerts
        // Endpoint: /api/alerts
        fetch('http://localhost:8080/api/alerts')
            .then(res => res.json())
            .then(data => {
                this.animateValue("alerts-count", 0, data.length, 2000);
            })
            .catch(err => console.error("Failed to load alerts", err));
    }

    // Number Counter Animation
    animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start) + "+";
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});