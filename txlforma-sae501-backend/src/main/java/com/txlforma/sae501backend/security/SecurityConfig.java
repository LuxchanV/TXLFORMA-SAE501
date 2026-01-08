package com.txlforma.sae501backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.Arrays;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowedOrigins}")
    private String allowedOrigins;

    /* =======================
       PASSWORD ENCODER
       ======================= */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /* =======================
       AUTH MANAGER
       ======================= */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    /* =======================
       SECURITY FILTER CHAIN
       ======================= */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS
                .cors(Customizer.withDefaults())

                // CSRF (désactivé car API REST stateless)
                .csrf(csrf -> csrf.disable())

                // Pas de session serveur
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Autorisations
                .authorizeHttpRequests(auth -> auth
                        // Swagger
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ✅ Stripe webhook : Stripe n’a pas ton JWT
                        .requestMatchers(HttpMethod.POST, "/api/stripe/webhook").permitAll()

                        // Auth publique
                        .requestMatchers("/api/auth/**").permitAll()

                        // Catalogue public
                        .requestMatchers(HttpMethod.GET, "/api/catalogue/**").permitAll()

                        // ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // FORMATEUR / INTERVENANT
                        .requestMatchers(
                                "/api/formateur/**",
                                "/api/intervenant/**"
                        ).hasRole("FORMATEUR")

                        // Tout le reste nécessite authentification
                        .requestMatchers("/api/**").authenticated()

                        // Sécurité par défaut
                        .anyRequest().denyAll()
                )

                // JWT filter
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    /* =======================
       CORS CONFIGURATION
       ======================= */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        cfg.setAllowedOrigins(
                Arrays.stream(allowedOrigins.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .toList()
        );

        cfg.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        cfg.setExposedHeaders(List.of("Content-Disposition"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);

        return source;
    }
}
