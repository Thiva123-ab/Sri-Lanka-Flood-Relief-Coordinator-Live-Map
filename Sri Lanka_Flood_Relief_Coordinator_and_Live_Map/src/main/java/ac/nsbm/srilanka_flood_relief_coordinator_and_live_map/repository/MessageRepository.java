package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Return the oldest messages first so they appear in order
    List<Message> findTop100ByOrderByTimestampAsc();
}