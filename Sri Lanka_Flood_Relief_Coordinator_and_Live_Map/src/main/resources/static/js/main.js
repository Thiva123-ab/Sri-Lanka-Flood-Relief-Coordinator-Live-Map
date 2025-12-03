// Shared JavaScript functionality for Sri Lanka Flood Relief Coordinator

document.addEventListener('DOMContentLoaded', function() {
    // Language selector functionality
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            // In a real implementation, this would trigger UI translation
            console.log('Language changed to:', this.value);
            // Save preference to localStorage
            localStorage.setItem('preferredLanguage', this.value);
        });

        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
            languageSelect.value = savedLanguage;
        }
    }

    // Bottom navigation active state
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        }
    });

    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            // Save preference to localStorage
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        });

        // Load saved dark mode preference
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'enabled') {
            document.body.classList.add('dark-mode');
        }
    }
});

// Utility function to show messages
function showMessage(elementId, message, isSuccess = true) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = isSuccess ? 'form-message success' : 'form-message error';
    }
}

// Utility function to format date for alerts
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Trilingual UI text dictionary
const translations = {
    en: {
        mapTitle: "Live Flood Map",
        alertsTitle: "Official Alerts",
        helpTitle: "Request Help",
        sosButton: "SOS",
        shelters: "Shelters",
        floodReports: "Flood Reports",
        supplyPoints: "Supply Points",
        all: "All",
        name: "Full Name",
        phone: "Phone Number",
        location: "Current Location",
        useLocation: "Use My Current Location",
        needs: "Select Your Needs",
        medicine: "Medicine",
        food: "Food/Water",
        rescue: "Boat Rescue",
        baby: "Baby Supplies",
        details: "Additional Details",
        submit: "Submit Request",
        loading: "Loading...",
        locationSuccess: "Location captured successfully!",
        locationError: "Unable to get your location. Please try again.",
        submitSuccess: "Help request submitted successfully!",
        submitError: "Error submitting request. Please try again."
    },
    si: {
        mapTitle: "සජීවී වැටීම් සිතියම",
        alertsTitle: "රජයේ ඇඟවීම්",
        helpTitle: "උදව් ඉල්ලන්න",
        sosButton: "ආධුනික උදව්",
        shelters: "අපදිස්ථාන",
        floodReports: "වැටීම් වාර්තා",
        supplyPoints: "විතරණ ලක්ෂ්‍ය",
        all: "සියල්ල",
        name: "සම්පූර්ණ නම",
        phone: "දුරකථන අංකය",
        location: "වත්මන් පෙළ",
        useLocation: "මගේ දැන් පෙළ භාවිතා කරන්න",
        needs: "ඔබගේ අවශ්‍යතා තෝරන්න",
        medicine: "බෙහෙත්",
        food: "ආහාර/ජල",
        rescue: "බෝට් මිදීම",
        baby: "ළදරුවෝ සඳහා උපාංග",
        details: "අමතර විස්තර",
        submit: "ඉල්ලීම යොමු කරන්න",
        loading: "පූරණය වෙමින්...",
        locationSuccess: "ස්ථානය සාර්ථකව ලබා ගනු ලැබීය!",
        locationError: "ඔබගේ ස්ථානය ලබා ගැනීමට නොහැකි විය. යලි උත්සාහ කරන්න.",
        submitSuccess: "උදව් ඉල්ලීම සාර්ථකව යොමු කරන ලදී!",
        submitError: "ඉල්ලීම යොමු කිරීමේදී දෝෂයක් ඇති විය. යලි උත්සාහ කරන්න."
    },
    ta: {
        mapTitle: "நேரடி வெள்ள வரைபடம்",
        alertsTitle: "அதிகாரபூர்வ எச்சரிக்கைகள்",
        helpTitle: "உதவி கோருதல்",
        sosButton: "அவசர உதவி",
        shelters: "புகலிடங்கள்",
        floodReports: "வெள்ள அறிக்கைகள்",
        supplyPoints: "சரக்கு புள்ளிகள்",
        all: "அனைத்தும்",
        name: "முழு பெயர்",
        phone: "தொலைபேசி எண்",
        location: "தற்போதைய இருப்பிடம்",
        useLocation: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்தவும்",
        needs: "உங்கள் தேவைகளைத் தேர்ந்தெடுக்கவும்",
        medicine: "மருந்து",
        food: "உணவு/தண்ணீர்",
        rescue: "படகு மீட்பு",
        baby: "குழந்தை பொருட்கள்",
        details: "கூடுதல் விவரங்கள்",
        submit: "கோரிக்கையை சமர்ப்பிக்கவும்",
        loading: "ஏற்றுகிறது...",
        locationSuccess: "இருப்பிடம் வெற்றிகரமாக பிடிக்கப்பட்டது!",
        locationError: "உங்கள் இருப்பிடத்தைப் பெற முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        submitSuccess: "உதவி கோரிக்கை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
        submitError: "கோரிக்கையை சமர்ப்பிப்பதில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
    }
};

// Function to get translated text
function getText(key) {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    return translations[lang][key] || translations['en'][key];
}