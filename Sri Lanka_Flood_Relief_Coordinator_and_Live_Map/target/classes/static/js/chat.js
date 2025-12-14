class ChatManager {
    constructor() {
        this.currentUser = null;
        this.currentPartner = null; // Who are we talking to right now?
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

        // 1. Load the list of people to chat with (Sidebar)
        this.loadPartners();

        // 2. Setup Input Listeners
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // 3. Polling for new messages
        setInterval(() => {
            if (this.currentPartner) {
                this.loadConversation(this.currentPartner, false); // false = don't scroll unless needed
            }
            // Optional: refresh partner list occasionally to catch new users
            // this.loadPartners();
        }, 3000);
    }

    // --- Sidebar Logic ---

    async loadPartners() {
        try {
            const res = await fetch('http://localhost:8080/api/messages/partners', { credentials: 'include' });
            if (res.ok) {
                const partners = await res.json();
                this.renderSidebar(partners);

                // If member, automatically select ADMIN since they can't talk to anyone else
                if (this.currentUser.role !== 'ADMIN' && partners.length > 0 && !this.currentPartner) {
                    this.selectPartner(partners[0]);
                }
            }
        } catch (err) {
            console.error("Error loading partners:", err);
        }
    }

    renderSidebar(partners) {
        this.chatList.innerHTML = '';

        if (partners.length === 0) {
            this.chatList.innerHTML = '<div style="padding:20px; text-align:center; color:#aaa;">No chats yet.</div>';
            return;
        }

        partners.forEach(partner => {
            const div = document.createElement('div');
            div.className = `chat-item ${this.currentPartner === partner ? 'active' : ''}`;
            div.onclick = () => this.selectPartner(partner);

            // Generate initial
            const initial = partner.charAt(0).toUpperCase();

            div.innerHTML = `
                <div class="avatar">${initial}</div>
                <div class="chat-info">
                    <h4>${partner}</h4>
                    <p>Click to chat</p>
                </div>
            `;
            this.chatList.appendChild(div);
        });
    }

    selectPartner(partner) {
        this.currentPartner = partner;

        // Update UI Header
        document.getElementById('current-chat-name').textContent = partner;
        document.getElementById('input-area').style.display = 'flex';

        // Highlight in Sidebar
        const items = document.querySelectorAll('.chat-item');
        items.forEach(item => {
            if(item.innerText.includes(partner)) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Load Messages
        this.loadConversation(partner, true);
    }

    // --- Message Area Logic ---

    async loadConversation(partner, forceScroll) {
        try {
            // Note: The backend 'getConversation' endpoint marks messages as read automatically
            const res = await fetch(`http://localhost:8080/api/messages/conversation?partner=${partner}`, { credentials: 'include' });
            if (res.ok) {
                const messages = await res.json();
                this.renderMessages(messages, forceScroll);

                // --- FIX: Force update badge immediately after reading ---
                if (window.floodApp) {
                    window.floodApp.checkUnreadMessages();
                }
            }
        } catch (err) {
            console.error("Error loading messages:", err);
        }
    }

    renderMessages(messages, forceScroll) {
        const isAtBottom = this.chatBox.scrollHeight - this.chatBox.scrollTop <= this.chatBox.clientHeight + 150;

        this.chatBox.innerHTML = ''; // Clear

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
            recipient: this.currentPartner, // Crucial for privacy
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
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});