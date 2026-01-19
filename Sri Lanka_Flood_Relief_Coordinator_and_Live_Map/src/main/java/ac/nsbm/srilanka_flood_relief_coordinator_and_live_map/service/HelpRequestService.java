package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.HelpRequest;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.HelpRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HelpRequestService {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    public HelpRequest submitHelpRequest(HelpRequest request) {
        // Business Logic: You could add validation or SMS notifications here later
        return helpRequestRepository.save(request);
    }
}