package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.HelpRequest;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.HelpRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/help-requests")
@CrossOrigin(origins = "*")
public class HelpRequestController {

    @Autowired
    private HelpRequestRepository helpRequestRepository;

    @PostMapping
    public HelpRequest submitHelpRequest(@RequestBody HelpRequest request) {
        return helpRequestRepository.save(request);
    }
}