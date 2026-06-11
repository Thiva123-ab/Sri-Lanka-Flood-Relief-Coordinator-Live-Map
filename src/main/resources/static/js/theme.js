/**
 * theme.js - Handles Light/Dark mode toggling and persistence.
 * Include this script in the <head> of every HTML page to prevent theme flashing.
 */

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the toggle button state
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        updateToggleButtonIcon(themeToggleBtn);
        
        themeToggleBtn.addEventListener('click', () => {
            toggleTheme();
            updateToggleButtonIcon(themeToggleBtn);
        });
    }
});

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

function updateToggleButtonIcon(btn) {
    // Assuming we use FontAwesome icons inside the button
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        btn.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
    } else {
        btn.innerHTML = '<i class="fas fa-moon text-indigo-600"></i>';
    }
}
