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
                    // CHANGE: Allow ALL origins (fixes the localhost:63342 issue)
                    config.setAllowedOriginPatterns(List.of("*"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/", "/index.html", "/login.html", "/register.html", "/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/markers/approved").permitAll() // Public map data
                        .requestMatchers("/api/alerts").permitAll() // Public alerts

                        // Handle OPTIONS requests (pre-flight checks for CORS)
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Admin endpoints
                        .requestMatchers("/admin.html").hasAuthority("ADMIN")
                        .requestMatchers("/api/markers/pending", "/api/markers/*/approve", "/api/markers/*/reject").hasAuthority("ADMIN")

                        // Member endpoints
                        .requestMatchers("/api/help-requests").authenticated()
                        .requestMatchers("/api/markers/report").authenticated()

                        .anyRequest().authenticated()
                )
                .httpBasic(basic -> {});

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}