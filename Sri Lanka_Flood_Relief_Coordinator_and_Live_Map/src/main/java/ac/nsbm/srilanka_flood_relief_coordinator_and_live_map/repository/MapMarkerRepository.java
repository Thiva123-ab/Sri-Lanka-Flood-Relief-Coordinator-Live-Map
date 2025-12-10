package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MapMarkerRepository extends JpaRepository<MapMarker, Long> {
    List<MapMarker> findByStatus(String status);
    List<MapMarker> findBySubmittedBy(String submittedBy); // NEW
}