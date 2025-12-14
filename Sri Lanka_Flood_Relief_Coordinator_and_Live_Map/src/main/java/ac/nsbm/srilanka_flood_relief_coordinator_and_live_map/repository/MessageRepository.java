package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Fetch conversation between two users (e.g., Admin and Member1)
    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender = :user1 AND m.recipient = :user2) OR " +
            "(m.sender = :user2 AND m.recipient = :user1) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findConversation(String user1, String user2);

    // Find all messages involving a specific user (to build the chat list)
    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.recipient = :user")
    List<Message> findAllMessagesByUser(String user);

    // Find all messages (Admin fallback)
    List<Message> findAllByOrderByTimestampAsc();
}