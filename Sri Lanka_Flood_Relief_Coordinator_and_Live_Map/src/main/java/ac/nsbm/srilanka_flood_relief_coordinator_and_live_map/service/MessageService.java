package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(Message message) {
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);
    }

    /**
     * Get a list of unique users the current user has chatted with.
     * For Admin: Returns list of Members.
     * For Member: Returns only "ADMIN".
     */
    public List<String> getChatPartners(String currentUser, boolean isAdmin) {
        if (!isAdmin) {
            // Members only talk to Admin
            return Collections.singletonList("ADMIN"); // Or whatever your admin username is
        }

        // Admin sees everyone they have exchanged messages with
        List<Message> allMessages = messageRepository.findAllByOrderByTimestampAsc();
        Set<String> partners = new HashSet<>();

        for (Message m : allMessages) {
            if (!m.getSender().equals(currentUser)) partners.add(m.getSender());
            if (m.getRecipient() != null && !m.getRecipient().equals(currentUser)) {
                partners.add(m.getRecipient());
            }
        }

        // Remove 'ADMIN' from the list if it accidentally got in there
        partners.remove(currentUser);
        return new ArrayList<>(partners);
    }

    public List<Message> getConversation(String user1, String user2) {
        return messageRepository.findConversation(user1, user2);
    }
}