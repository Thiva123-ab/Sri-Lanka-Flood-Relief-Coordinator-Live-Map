package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.controller;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.Role;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.model.User;
import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        // Create new user's account
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Default role assignment logic (simple version)
        if (user.getRole() == null) {
            user.setRole(Role.MEMBER);
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        // This endpoint is for the frontend to verify credentials and get user details
        // In a real Spring Security app with Basic Auth, the browser handles the handshake,
        // but we can return user info here for localStorage.
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
}