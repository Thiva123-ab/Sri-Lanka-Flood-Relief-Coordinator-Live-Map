package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(length = 1000)
    private String description;
    private String submittedBy;
    private LocalDateTime timestamp;

    private String fileName;
    private String fileType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] data;
}