package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String severity; // "high", "medium", "low"
    private String title;

    @Column(length = 1000)
    private String content;

    private String source;
    private LocalDateTime timestamp;
    private String icon;
}