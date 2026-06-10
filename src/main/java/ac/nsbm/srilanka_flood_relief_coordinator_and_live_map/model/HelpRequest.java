package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "help_requests")
@Data
public class HelpRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private double latitude;
    private double longitude;

    @ElementCollection
    private List<String> needs;

    @Column(length = 1000)
    private String details;
}