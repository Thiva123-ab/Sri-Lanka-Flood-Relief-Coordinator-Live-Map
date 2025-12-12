package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MapMarkerRepository extends JpaRepository<MapMarker, Long> {
    // Fetch verified markers for the public map
    List<MapMarker> findByStatus(String status);

    // Fetch a specific user's markers (to show them their pending reports)
    List<MapMarker> findBySubmittedBy(String submittedBy);
}