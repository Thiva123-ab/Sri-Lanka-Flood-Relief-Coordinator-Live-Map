package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.MapMarkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MapMarkerService {

    @Autowired
    private MapMarkerRepository mapMarkerRepository;

    public List<MapMarker> getAllMarkers() {
        return mapMarkerRepository.findAll();
    }

    public MapMarker addMarker(MapMarker marker) {
        return mapMarkerRepository.save(marker);
    }
}