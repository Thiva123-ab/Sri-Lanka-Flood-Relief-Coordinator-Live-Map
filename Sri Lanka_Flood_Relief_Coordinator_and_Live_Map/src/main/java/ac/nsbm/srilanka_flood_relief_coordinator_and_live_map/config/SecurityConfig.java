package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:8080")); // Allow frontend
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                    config.setAllowedHeaders(List.of("*"));
                    return config;
                }))
                .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in this stage
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/index.html", "/login.html", "/register.html", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/markers/approved").permitAll() // Public map data
                        .requestMatchers("/api/alerts").permitAll() // Public alerts

                        // Admin endpoints
                        .requestMatchers("/admin.html").hasAuthority("ADMIN")
                        .requestMatchers("/api/markers/pending", "/api/markers/*/approve", "/api/markers/*/reject").hasAuthority("ADMIN")

                        // Member endpoints
                        .requestMatchers("/api/help-requests").authenticated()
                        .requestMatchers("/api/markers/report").authenticated()

                        .anyRequest().authenticated()
                )
                // Use Basic Auth for simplicity with the provided JS fetch calls
                .httpBasic(basic -> {});

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}