package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.MapMarker;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.MapMarkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // NEW
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markers")
public class MapController {

    @Autowired
    private MapMarkerService mapMarkerService;

    @GetMapping("/approved")
    public List<MapMarker> getPublicMarkers() {
        return mapMarkerService.getApprovedMarkers();
    }

    @GetMapping("/pending")
    public List<MapMarker> getPendingMarkers() {
        return mapMarkerService.getPendingMarkers();
    }

    // NEW: For Admin to see rejected
    @GetMapping("/rejected")
    public List<MapMarker> getRejectedMarkers() {
        return mapMarkerService.getRejectedMarkers();
    }

    // NEW: For Members to see their own history
    @GetMapping("/my-reports")
    public List<MapMarker> getMyReports(Authentication authentication) {
        if (authentication == null) return List.of();
        return mapMarkerService.getUserMarkers(authentication.getName());
    }

    @PostMapping("/report")
    public MapMarker reportIssue(@RequestBody MapMarker marker) {
        return mapMarkerService.reportIssue(marker);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveMarker(@PathVariable Long id) {
        mapMarkerService.approveMarker(id);
        return ResponseEntity.ok("Marker Approved");
    }

    // UPDATED: Changed to PUT since we are updating status, not deleting
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectMarker(@PathVariable Long id) {
        mapMarkerService.rejectMarker(id);
        return ResponseEntity.ok("Marker Rejected");
    }
}