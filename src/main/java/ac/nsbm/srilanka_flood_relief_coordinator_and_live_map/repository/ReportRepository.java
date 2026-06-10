package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByTimestampDesc();
}