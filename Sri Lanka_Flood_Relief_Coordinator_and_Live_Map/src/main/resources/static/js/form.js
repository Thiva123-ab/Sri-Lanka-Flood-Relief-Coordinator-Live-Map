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
        // Note: We ignore the 'role' dropdown here because the Backend tells us the role upon successful login.

        // Simple validation
        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Call AuthManager to handle the API request
        if (window.authManager) {
            window.authManager.login(username, password);
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

        // Backend API call for Registration
        // Using http://localhost:8080/api/auth/register
        fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                // Convert value (member/admin) to Uppercase (MEMBER/ADMIN) to match Java Enum
                role: role.toUpperCase()
            })
        })
            .then(async response => {
                if (response.ok) {
                    alert('Registration successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    const errorText = await response.text();
                    alert('Registration failed: ' + errorText);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Cannot connect to server. Ensure backend is running.');
            });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});