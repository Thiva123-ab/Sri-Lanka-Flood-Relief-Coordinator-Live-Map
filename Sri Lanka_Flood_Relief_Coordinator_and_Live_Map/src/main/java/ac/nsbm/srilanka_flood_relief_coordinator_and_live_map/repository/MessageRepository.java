package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // Import this
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional; // Import this
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
            "(m.sender = :user1 AND m.recipient = :user2) OR " +
            "(m.sender = :user2 AND m.recipient = :user1) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findConversation(String user1, String user2);

    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.recipient = :user")
    List<Message> findAllMessagesByUser(String user);

    List<Message> findAllByOrderByTimestampAsc();

    // --- NEW METHODS ---

    // Count unread messages for the current user (recipient)
    long countByRecipientAndIsReadFalse(String recipient);

    // Mark messages sent BY the partner TO the current user as read
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.isRead = true WHERE m.sender = :partner AND m.recipient = :currentUser")
    void markMessagesAsRead(String partner, String currentUser);
}