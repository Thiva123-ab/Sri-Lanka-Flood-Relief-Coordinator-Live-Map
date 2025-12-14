class ChatManager {
    constructor() {
        this.currentUser = null;
        this.currentPartner = null;
        this.chatBox = document.getElementById('chat-box');
        this.chatList = document.getElementById('chat-list');
        this.init();
    }

    init() {
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = window.authManager.getCurrentUser();

        this.loadPartners();

        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Poll for updates (Messages AND Sidebar Order)
        setInterval(() => {
            // Refresh conversation if open
            if (this.currentPartner) {
                this.loadConversation(this.currentPartner, false);
            }
            // Refresh sidebar to reorder chats and update badges
            this.loadPartners();
        }, 3000);
    }

    // --- Sidebar Logic ---

    async loadPartners() {
        try {
            const res = await fetch('http://localhost:8080/api/messages/partners', { credentials: 'include' });
            if (res.ok) {
                const partners = await res.json();
                this.renderSidebar(partners);

                // Auto-select first partner if none selected (for Members)
                if (this.currentUser.role !== 'ADMIN' && partners.length > 0 && !this.currentPartner) {
                    this.selectPartner(partners[0].name);
                }
            }
        } catch (err) {
            console.error("Error loading partners:", err);
        }
    }

    renderSidebar(partners) {
        // Don't wipe HTML if it's just a refresh, to prevent flicker?
        // For simplicity, we rebuild. The browser handles small DOM updates fast enough.
        this.chatList.innerHTML = '';

        if (partners.length === 0) {
            this.chatList.innerHTML = '<div style="padding:20px; text-align:center; color:#aaa;">No chats yet.</div>';
            return;
        }

        partners.forEach(partnerObj => {
            const name = partnerObj.name;
            const unread = partnerObj.unread || 0;

            const div = document.createElement('div');
            // If this partner is selected, add active class
            div.className = `chat-item ${this.currentPartner === name ? 'active' : ''}`;
            div.onclick = () => this.selectPartner(name);

            const initial = name.charAt(0).toUpperCase();

            // Notification Badge HTML
            const badgeHtml = unread > 0
                ? `<span style="background: #ff4444; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 50%; margin-left: auto;">${unread}</span>`
                : '';

            div.innerHTML = `
                <div class="avatar">${initial}</div>
                <div class="chat-info" style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0;">${name}</h4>
                        ${badgeHtml}
                    </div>
                    <p style="margin:4px 0 0; color:#aaa; font-size:0.8rem;">Click to chat</p>
                </div>
            `;
            this.chatList.appendChild(div);
        });
    }

    selectPartner(partnerName) {
        this.currentPartner = partnerName;

        document.getElementById('current-chat-name').textContent = partnerName;
        document.getElementById('input-area').style.display = 'flex';

        // Manually update active class immediately for visual feedback
        const items = document.querySelectorAll('.chat-item');
        items.forEach(item => {
            // Simple text check or class check
            if(item.innerHTML.includes(`<h4>${partnerName}</h4>`)) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Load Messages
        this.loadConversation(partnerName, true);

        // Refresh sidebar immediately to clear the badge
        setTimeout(() => this.loadPartners(), 500);
    }

    // --- Message Area Logic ---

    async loadConversation(partner, forceScroll) {
        try {
            const res = await fetch(`http://localhost:8080/api/messages/conversation?partner=${partner}`, { credentials: 'include' });
            if (res.ok) {
                const messages = await res.json();
                this.renderMessages(messages, forceScroll);

                // Force global badge update
                if(window.floodApp) window.floodApp.checkUnreadMessages();
            }
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    }

    renderMessages(messages, forceScroll) {
        const isAtBottom = this.chatBox.scrollHeight - this.chatBox.scrollTop <= this.chatBox.clientHeight + 150;

        this.chatBox.innerHTML = '';

        if (messages.length === 0) {
            this.chatBox.innerHTML = '<div class="empty-state"><i class="fas fa-comments"></i><p>No messages yet.</p></div>';
            return;
        }

        messages.forEach(msg => {
            const isMe = msg.sender === this.currentUser.username;
            const div = document.createElement('div');
            div.className = `message ${isMe ? 'my-message' : 'other-message'}`;

            const time = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            div.innerHTML = `
                ${msg.content}
                <div class="message-time">${time}</div>
            `;
            this.chatBox.appendChild(div);
        });

        if (forceScroll || isAtBottom) {
            this.chatBox.scrollTop = this.chatBox.scrollHeight;
        }
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        if (!text || !this.currentPartner) return;

        const message = {
            sender: this.currentUser.username,
            role: this.currentUser.role,
            recipient: this.currentPartner,
            content: text
        };

        fetch('http://localhost:8080/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(message)
        }).then(res => {
            if (res.ok) {
                input.value = '';
                this.loadConversation(this.currentPartner, true);
                // Also refresh sidebar to move this chat to top
                this.loadPartners();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});