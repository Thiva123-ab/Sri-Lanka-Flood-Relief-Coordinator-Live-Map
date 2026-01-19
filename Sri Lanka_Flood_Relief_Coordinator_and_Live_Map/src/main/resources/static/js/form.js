// Form Handler
class FormHandler {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormListeners();
        this.setupPasswordToggles(); // Initialize password toggle logic
    }

    setupPasswordToggles() {
        const toggleIcons = document.querySelectorAll('.toggle-password');

        toggleIcons.forEach(icon => {
            icon.addEventListener('click', function (e) {
                // Get the target input ID from data-target attribute
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);

                if (input) {
                    // Toggle the type attribute
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);

                    // Toggle the eye icon class
                    this.classList.toggle('fa-eye');
                    this.classList.toggle('fa-eye-slash');
                }
            });
        });
    }

    setupFormListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please fill in all fields');
            return;
        }

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

        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
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

document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
});