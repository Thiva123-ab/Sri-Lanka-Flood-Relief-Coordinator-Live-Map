package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "help_requests")
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private double latitude;
    private double longitude;

    // Stores "Food, Medicine" etc.
    @ElementCollection
    private List<String> needs;

    @Column(length = 1000)
    private String details;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public List<String> getNeeds() { return needs; }
    public void setNeeds(List<String> needs) { this.needs = needs; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}