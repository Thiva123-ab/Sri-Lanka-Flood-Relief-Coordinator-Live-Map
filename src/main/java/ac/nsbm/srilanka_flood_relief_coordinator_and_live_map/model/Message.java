package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String recipient;
    private String content;
    private String role;
    private LocalDateTime timestamp;

    // --- NEW FIELD ---
    @Column(columnDefinition = "boolean default false")
    private boolean isRead;
}