package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Alert;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    public Alert createAlert(Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(LocalDateTime.now());
        }
        return alertRepository.save(alert);
    }

    // --- ADDED THIS METHOD ---
    public void deleteAlert(Long id) {
        if (alertRepository.existsById(id)) {
            alertRepository.deleteById(id);
        } else {
            throw new RuntimeException("Alert not found with id: " + id);
        }
    }
}