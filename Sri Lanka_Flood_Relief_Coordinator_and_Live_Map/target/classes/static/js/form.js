// Form Handler
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        // Set up form event listeners
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        // Simple validation
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        // In a real app, this would be an API call
        if (window.authManager) {
            window.authManager.login(username, password, role);
        }
    }

    handleRegister(e) {
        e.preventDefault();

        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const role = document.getElementById('reg-role').value;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // In a real app, this would be an API call
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});