package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Message;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:63342")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // --- UPDATED RETURN TYPE to Map to support {name: "User", unread: 5} ---
    @GetMapping("/partners")
    public List<Map<String, Object>> getChatPartners(Authentication authentication) {
        if (authentication == null) return List.of();
        String username = authentication.getName();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        return messageService.getChatPartners(username, isAdmin);
    }

    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam String partner, Authentication authentication) {
        if (authentication == null) return List.of();
        String currentUser = authentication.getName();

        // Mark messages as read when fetched
        messageService.markConversationAsRead(currentUser, partner);

        return messageService.getConversation(currentUser, partner);
    }

    @PostMapping
    public Message sendMessage(@RequestBody Message message, Authentication authentication) {
        if (authentication != null) {
            message.setSender(authentication.getName());
        }
        return messageService.sendMessage(message);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(Authentication authentication) {
        if (authentication == null) return 0;
        return messageService.getUnreadCount(authentication.getName());
    }
}