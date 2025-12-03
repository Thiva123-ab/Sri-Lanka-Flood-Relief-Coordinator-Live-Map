package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.MapMarkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markers")
@CrossOrigin(origins = "*") // Allow frontend to access this
public class MapController {

    @Autowired
    private MapMarkerRepository mapMarkerRepository;

    @GetMapping
    public List<MapMarker> getAllMarkers() {
        return mapMarkerRepository.findAll();
    }

    @PostMapping
    public MapMarker addMarker(@RequestBody MapMarker marker) {
        return mapMarkerRepository.save(marker);
    }
}