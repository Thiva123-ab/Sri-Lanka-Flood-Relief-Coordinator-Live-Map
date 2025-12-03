package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model;

import jakarta.persistence.*;

@Entity
@Table(name = "map_markers")
public class MapMarker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // "shelter", "flood", "supply"
    private double lat;
    private double lng;
    private String name;

    // Specific fields (nullable)
    private Integer capacity;     // For Shelters
    private String contact;       // For Shelters & Supply
    private String depth;         // For Flood Reports
    private String reportedBy;    // For Flood Reports
    private String hours;         // For Supply Points

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }
    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getDepth() { return depth; }
    public void setDepth(String depth) { this.depth = depth; }
    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }
}