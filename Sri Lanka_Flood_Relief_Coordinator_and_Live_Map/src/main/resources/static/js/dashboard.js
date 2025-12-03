// Dashboard Manager
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
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('floodReliefUser');
        if (userData) {
            const user = JSON.parse(userData);
            const roleElement = document.getElementById('user-role');
            const loginButton = document.getElementById('login-btn');

            if (roleElement && loginButton) {
                roleElement.textContent = user.role === 'admin' ? 'Admin' : 'Member';
                roleElement.className = user.role === 'admin' ? 'admin-badge' : 'member-badge';
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
                window.location.href = 'index.html';
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
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

        // In a real app, this would update all text content
        console.log(`Language changed to: ${lang}`);
    }

    initAnimations() {
        // Add entrance animations to elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated-entry');
                }
            });
        }, { threshold: 0.1 });

        // Observe sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});