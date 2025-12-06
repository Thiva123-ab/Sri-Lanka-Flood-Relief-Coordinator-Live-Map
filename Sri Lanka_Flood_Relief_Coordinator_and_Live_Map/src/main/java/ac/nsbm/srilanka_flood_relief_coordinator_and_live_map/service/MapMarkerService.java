package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.MapMarkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MapMarkerService {

    @Autowired
    private MapMarkerRepository mapMarkerRepository;

    public List<MapMarker> getApprovedMarkers() {
        return mapMarkerRepository.findByStatus("approved");
    }

    public List<MapMarker> getPendingMarkers() {
        return mapMarkerRepository.findByStatus("pending");
    }

    public MapMarker reportIssue(MapMarker marker) {
        marker.setStatus("pending");
        marker.setTimestamp(LocalDateTime.now());
        return mapMarkerRepository.save(marker);
    }

    public void approveMarker(Long id) {
        MapMarker marker = mapMarkerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marker not found"));
        marker.setStatus("approved");
        mapMarkerRepository.save(marker);
    }

    public void rejectMarker(Long id) {
        mapMarkerRepository.deleteById(id);
    }
}