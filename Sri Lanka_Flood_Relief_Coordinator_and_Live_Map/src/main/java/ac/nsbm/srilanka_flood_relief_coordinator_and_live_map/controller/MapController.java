package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.MapMarkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markers")
public class MapController {

    @Autowired
    private MapMarkerService mapMarkerService;

    // Public: Get only approved markers for the live map
    @GetMapping("/approved")
    public List<MapMarker> getPublicMarkers() {
        return mapMarkerService.getApprovedMarkers();
    }

    // Admin: Get pending markers for review
    @GetMapping("/pending")
    public List<MapMarker> getPendingMarkers() {
        return mapMarkerService.getPendingMarkers();
    }

    // Member: Report a new issue
    @PostMapping("/report")
    public MapMarker reportIssue(@RequestBody MapMarker marker) {
        return mapMarkerService.reportIssue(marker);
    }

    // Admin: Approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveMarker(@PathVariable Long id) {
        mapMarkerService.approveMarker(id);
        return ResponseEntity.ok("Marker Approved");
    }

    // Admin: Reject
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<?> rejectMarker(@PathVariable Long id) {
        mapMarkerService.rejectMarker(id);
        return ResponseEntity.ok("Marker Rejected");
    }
}