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
        message.setRead(false);
        return messageRepository.save(message);
    }

    // --- UPDATED: Returns list of objects with name and unread count, sorted by activity ---
    public List<Map<String, Object>> getChatPartners(String currentUser, boolean isAdmin) {
        if (!isAdmin) {
            // For members, they only talk to ADMIN.
            long unread = messageRepository.countByRecipientAndIsReadFalse(currentUser);
            Map<String, Object> adminMap = new HashMap<>();
            adminMap.put("name", "ADMIN");
            adminMap.put("unread", unread);
            return Collections.singletonList(adminMap);
        }

        // For Admin: Get all messages sorted NEWEST first
        List<Message> messages = messageRepository.findAllByOrderByTimestampDesc();

        // Use LinkedHashSet to preserve order (Most recent partners first)
        Set<String> uniquePartners = new LinkedHashSet<>();
        Map<String, Integer> unreadMap = new HashMap<>();

        for (Message m : messages) {
            String partner = null;

            // Identify the other party
            if (m.getSender().equals(currentUser)) {
                partner = m.getRecipient();
            } else if (m.getRecipient() != null && m.getRecipient().equals(currentUser)) {
                partner = m.getSender();
                // If I am the recipient and it's not read, increment count
                if (!m.isRead()) {
                    unreadMap.put(partner, unreadMap.getOrDefault(partner, 0) + 1);
                }
            }

            if (partner != null) {
                uniquePartners.add(partner);
            }
        }

        // Build the result list
        List<Map<String, Object>> result = new ArrayList<>();
        for (String name : uniquePartners) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", name);
            entry.put("unread", unreadMap.getOrDefault(name, 0));
            result.add(entry);
        }

        return result;
    }

    public List<Message> getConversation(String user1, String user2) {
        return messageRepository.findConversation(user1, user2);
    }

    public long getUnreadCount(String username) {
        return messageRepository.countByRecipientAndIsReadFalse(username);
    }

    public void markConversationAsRead(String currentUser, String partner) {
        messageRepository.markMessagesAsRead(partner, currentUser);
    }
}