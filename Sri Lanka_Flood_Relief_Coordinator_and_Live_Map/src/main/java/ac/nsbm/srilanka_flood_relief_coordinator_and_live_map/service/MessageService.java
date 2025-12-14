package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false); // Default to unread
        return messageRepository.save(message);
    }

    public List<String> getChatPartners(String currentUser, boolean isAdmin) {
        if (!isAdmin) {
            return Collections.singletonList("ADMIN");
        }

        List<Message> allMessages = messageRepository.findAllByOrderByTimestampAsc();
        Set<String> partners = new HashSet<>();

        for (Message m : allMessages) {
            if (!m.getSender().equals(currentUser)) partners.add(m.getSender());
            if (m.getRecipient() != null && !m.getRecipient().equals(currentUser)) {
                partners.add(m.getRecipient());
            }
        }
        partners.remove(currentUser);
        return new ArrayList<>(partners);
    }

    public List<Message> getConversation(String user1, String user2) {
        return messageRepository.findConversation(user1, user2);
    }

    // --- NEW METHODS ---

    public long getUnreadCount(String username) {
        return messageRepository.countByRecipientAndIsReadFalse(username);
    }

    public void markConversationAsRead(String currentUser, String partner) {
        // Mark messages FROM partner TO currentUser as read
        messageRepository.markMessagesAsRead(partner, currentUser);
    }
}