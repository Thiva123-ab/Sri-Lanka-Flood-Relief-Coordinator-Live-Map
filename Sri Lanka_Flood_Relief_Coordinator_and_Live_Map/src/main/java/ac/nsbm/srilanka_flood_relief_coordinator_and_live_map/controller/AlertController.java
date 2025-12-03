package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Alert;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    @PostMapping
    public Alert createAlert(@RequestBody Alert alert) {
        alert.setTimestamp(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    @DeleteMapping("/{id}")
    public void deleteAlert(@PathVariable Long id) {
        alertRepository.deleteById(id);
    }
}