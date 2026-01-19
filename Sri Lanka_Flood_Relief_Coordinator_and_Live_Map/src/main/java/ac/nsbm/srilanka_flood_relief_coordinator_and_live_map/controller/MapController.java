package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.MapMarkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markers")
public class MapController {

    @Autowired
    private MapMarkerService mapMarkerService;

    // Public: Only Approved markers
    @GetMapping("/approved")
    public List<MapMarker> getPublicMarkers() {
        return mapMarkerService.getApprovedMarkers();
    }

    // Member: Get my own reports (so I can see my pending ones on the map)
    @GetMapping("/my-reports")
    public List<MapMarker> getMyReports(Authentication authentication) {
        if (authentication == null) {
            return List.of();
        }
        return mapMarkerService.getUserMarkers(authentication.getName());
    }

    // Member: Submit a report
    @PostMapping("/report")
    public MapMarker reportIssue(@RequestBody MapMarker marker) {
        return mapMarkerService.reportIssue(marker);
    }

    // Admin: Get all pending
    @GetMapping("/pending")
    public List<MapMarker> getPendingMarkers() {
        return mapMarkerService.getPendingMarkers();
    }

    // Admin: Get all rejected
    @GetMapping("/rejected")
    public List<MapMarker> getRejectedMarkers() {
        return mapMarkerService.getRejectedMarkers();
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveMarker(@PathVariable Long id) {
        mapMarkerService.approveMarker(id);
        return ResponseEntity.ok("Marker Approved");
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectMarker(@PathVariable Long id) {
        mapMarkerService.rejectMarker(id);
        return ResponseEntity.ok("Marker Rejected");
    }
}