package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "map_markers")
@Data
public class MapMarker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // "flood", "shelter", "landslide"
    private double lat;
    private double lng;
    private String name;

    @Column(length = 1000)
    private String description;

    private String severity; // "low", "medium", "high"

    private String status; // "pending", "approved", "rejected"

    private String submittedBy;
    private LocalDateTime timestamp;

    // Optional fields for shelters/supplies
    private Integer capacity;
    private String contact;
}