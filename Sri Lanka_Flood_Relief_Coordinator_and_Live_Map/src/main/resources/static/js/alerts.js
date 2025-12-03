// Alerts Manager for Flood Relief Application
class AlertsManager {
    constructor() {
        this.alerts = [];
        this.init();
    }

    init() {
        // Load alerts from localStorage or use sample data
        this.loadAlerts();

        // Render alerts on the page
        this.renderAlerts();

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Language selector
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.id.replace('lang-', '');
                this.changeLanguage(lang);
            });
        });
    }

    loadAlerts() {
        // In a real app, this would fetch from a server
        const savedAlerts = localStorage.getItem('floodAlerts');
        if (savedAlerts) {
            this.alerts = JSON.parse(savedAlerts);
        } else {
            // Sample alerts data
            this.alerts = [
                {
                    id: 1,
                    title: {
                        en: "Flash Flood Warning",
                        si: "හෙරී ඇවිල්ල අවවාදය",
                        ta: "வெள்ள எச்சரிக்கை"
                    },
                    description: {
                        en: "Heavy rainfall expected in Western Province. Residents in low-lying areas should evacuate immediately.",
                        si: "බටහිර ප්‍රාන්තයේ දැඩි ව rainfall අපේක්ෂිතය. පහත් ප්‍රදේශවල නිවාසිකයින් වහාම ඉන් ඉවත් විය යුතුය.",
                        ta: "மேற்கு மாகாணத்தில் கனமழை எதிர்பார்க்கப்படுகிறது. குறைந்த பகுதிகளில் உள்ள குடிமக்கள் உடனடியாக வெளியேற வேண்டும்."
                    },
                    level: "high",
                    location: "Western Province",
                    timestamp: "2023-06-15T10:30:00Z"
                },
                {
                    id: 2,
                    title: {
                        en: "Landslide Advisory",
                        si: "ඉ landslide පිළිබඳ උපදේශය",
                        ta: "மண்சரி ஆலோசனை"
                    },
                    description: {
                        en: "Saturated soil conditions in Hill Country regions. Caution advised for travel on mountain roads.",
                        si: "කඳු රටවල සංතෘප්ත මැදි තත්ත්වය. කඳු පාරවල සංචාරය සඳහා ප්‍රතිචාරය අවධානයට භාරයුතුය.",
                        ta: "மலைப்பகுதிகளில் தண்ணீர் ஊறிய மண் நிலை. மலைப்பாதைகளில் பயணிக்க எச்சரிக்கை அவசியம்."
                    },
                    level: "medium",
                    location: "Central Province",
                    timestamp: "2023-06-14T15:45:00Z"
                },
                {
                    id: 3,
                    title: {
                        en: "River Level Monitoring",
                        si: "ගඟ මට්ටම නිරීක්ෂණය",
                        ta: "ஆற்று நிலை கண்காணிப்பு"
                    },
                    description: {
                        en: "Kelani River levels rising but within safe limits. Continue monitoring updates.",
                        si: "කැලණි ගඟ මට්ටම නැගී නමුත් ආරක්ෂිත සීමා තුළය. යාවත්කාලීන තත්ත්වය නිරීක්ෂණය කරගෙන යන්න.",
                        ta: "கேலனி ஆறு நிலை உயர்ந்துள்ளது ஆனால் பாதுகாப்பான வரம்புக்குள் உள்ளது. புதுப்பிப்புகளைத் தொடர்ந்து கண்காணிக்கவும்."
                    },
                    level: "low",
                    location: "Colombo District",
                    timestamp: "2023-06-14T08:15:00Z"
                }
            ];

            // Save sample data to localStorage
            localStorage.setItem('floodAlerts', JSON.stringify(this.alerts));
        }
    }

    renderAlerts() {
        const alertList = document.querySelector('.alert-list');
        if (!alertList) return;

        // Clear existing alerts
        alertList.innerHTML = '';

        // Add each alert to the list
        this.alerts.forEach(alert => {
            const alertCard = this.createAlertCard(alert);
            alertList.appendChild(alertCard);
        });
    }

    createAlertCard(alert) {
        const currentLang = this.getCurrentLanguage();

        const card = document.createElement('div');
        card.className = `alert-card ${alert.level}`;
        card.innerHTML = `
            <div class="alert-header">
                <h3>${alert.title[currentLang]}</h3>
                <span class="alert-level">${alert.level.toUpperCase()}</span>
            </div>
            <div class="alert-body">
                <p>${alert.description[currentLang]}</p>
                <div class="alert-meta">
                    <span><i class="far fa-clock"></i> Issued: ${this.formatDate(alert.timestamp)}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${alert.location}</span>
                </div>
            </div>
        `;
        return card;
    }

    getCurrentLanguage() {
        // Check for active language button
        const activeBtn = document.querySelector('.lang-btn.active');
        if (activeBtn) {
            return activeBtn.id.replace('lang-', '');
        }
        return 'en'; // default to English
    }

    changeLanguage(lang) {
        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

        // Re-render alerts with new language
        this.renderAlerts();
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();

        // If today, show time only
        if (date.toDateString() === now.toDateString()) {
            return `Today ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // If yesterday, show "Yesterday"
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        }

        // Otherwise show full date
        return date.toLocaleDateString();
    }

    // Method to add a new alert (for admin use)
    addAlert(alertData) {
        const newAlert = {
            id: Date.now(),
            ...alertData,
            timestamp: new Date().toISOString()
        };

        this.alerts.unshift(newAlert); // Add to beginning of array
        localStorage.setItem('floodAlerts', JSON.stringify(this.alerts));
        this.renderAlerts();
    }

    // Method to remove an alert (for admin use)
    removeAlert(alertId) {
        this.alerts = this.alerts.filter(alert => alert.id != alertId);
        localStorage.setItem('floodAlerts', JSON.stringify(this.alerts));
        this.renderAlerts();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.alertsManager = new AlertsManager();
});