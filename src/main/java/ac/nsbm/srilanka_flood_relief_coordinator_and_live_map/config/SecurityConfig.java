package ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.config;

import ac.nsbm.srilanka_flood_relief_coordinator_and_live_map.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // FIX: Allow CORS from everywhere for development
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOriginPatterns(List.of("*"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .securityContext(context -> context
                        .securityContextRepository(new HttpSessionSecurityContextRepository())
                )
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers("/", "/index.html", "/login.html", "/register.html",
                                "/css/**", "/js/**", "/images/**", "/chat.html").permitAll() // Added chat.html
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/markers/approved").permitAll()
                        .requestMatchers("/api/alerts").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Admin Only
                        .requestMatchers("/admin.html").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/reports").hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers("/api/markers/*/approve", "/api/markers/*/reject").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // Authenticated Endpoints
                        .requestMatchers("/api/markers/pending").authenticated()
                        .requestMatchers("/api/reports/upload").authenticated()
                        .requestMatchers("/api/help-requests").authenticated()
                        .requestMatchers("/api/markers/report").authenticated()
                        // Allow Chat Messages
                        .requestMatchers("/api/messages/**").authenticated()

                        .anyRequest().authenticated()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}