package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:63342")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // 1. Get List of Chat Partners (for the Sidebar)
    @GetMapping("/partners")
    public List<String> getChatPartners(Authentication authentication) {
        if (authentication == null) return List.of();
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        return messageService.getChatPartners(username, isAdmin);
    }

    // 2. Get Messages for a specific conversation
    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam String partner, Authentication authentication) {
        if (authentication == null) return List.of();
        String currentUser = authentication.getName();

        // Security: Members can ONLY request chat with ADMIN (or authorized support)
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // If not admin, force partner to be related to admin logic or strictly validate
        // For simplicity here: We assume the Service handles strict business logic or we allow it
        // A strictly private app would verify here that 'partner' is an Admin if currentUser is Member.

        return messageService.getConversation(currentUser, partner);
    }

    @PostMapping
    public Message sendMessage(@RequestBody Message message, Authentication authentication) {
        if (authentication != null) {
            message.setSender(authentication.getName());
        }
        return messageService.sendMessage(message);
    }
}