class ChatManager {
    constructor() {
        this.currentUser = null;
        this.chatBox = document.getElementById('chat-box');
        this.init();
    }

    init() {
        // Check Login
        if (!window.authManager || !window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = window.authManager.getCurrentUser();

        // Bind Events
        const sendBtn = document.getElementById('send-btn');
        const inputField = document.getElementById('message-input');

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        // Start Polling
        this.loadMessages();
        setInterval(() => this.loadMessages(), 2000); // Poll every 2 seconds
    }

    async loadMessages() {
        try {
            const res = await fetch('http://localhost:8080/api/messages', { credentials: 'include' });
            if (res.ok) {
                const messages = await res.json();
                this.renderMessages(messages);
            }
        } catch (err) {
            console.error("Chat Error:", err);
        }
    }

    renderMessages(messages) {
        // Check if we are at bottom to auto-scroll later
        const isAtBottom = this.chatBox.scrollHeight - this.chatBox.scrollTop <= this.chatBox.clientHeight + 100;

        this.chatBox.innerHTML = ''; // Clear and rebuild (Simple approach)

        messages.forEach(msg => {
            const isMe = msg.sender === this.currentUser.username;
            const isAdmin = msg.role === 'ADMIN';

            const div = document.createElement('div');
            div.className = `message ${isMe ? 'my-message' : 'other-message'} ${isAdmin ? 'admin-message' : ''}`;

            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            let senderHtml = `<span class="sender-name">${msg.sender}</span>`;
            if (isAdmin) senderHtml += `<span class="admin-tag">ADMIN</span>`;

            div.innerHTML = `
                ${!isMe ? `<div class="message-header">${senderHtml}</div>` : ''}
                <div class="message-content">${msg.content}</div>
                <div class="message-time">${time}</div>
            `;
            this.chatBox.appendChild(div);
        });

        // Auto scroll if user was at bottom
        if (isAtBottom) {
            this.chatBox.scrollTop = this.chatBox.scrollHeight;
        }
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();

        if (!text) return;

        const message = {
            sender: this.currentUser.username,
            role: this.currentUser.role,
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
                this.loadMessages();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
});