package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HelpRequestRepository extends JpaRepository<HelpRequest, Long> {
}