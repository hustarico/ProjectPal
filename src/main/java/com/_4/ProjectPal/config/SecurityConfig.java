package com._4.ProjectPal.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Core Spring Security configuration.
 * Defines the SecurityFilterChain with JWT-based stateless authentication.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF is disabled because JWTs are immune to CSRF (stateless, no cookies).
                .csrf(AbstractHttpConfigurer::disable)

                // No HTTP session is created; every request must carry its own JWT.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Define endpoint-level access rules.
                .authorizeHttpRequests(auth -> auth
                        // All endpoints under /api/auth/** are publicly accessible (register, login).
                        .requestMatchers("/api/auth/**","api/test/unprotected").permitAll()
                        // Everything else requires authentication.
                        .anyRequest().authenticated()
                )

                // Wire in our custom authentication provider.
                .authenticationProvider(authenticationProvider)

                // Execute our JWT filter BEFORE Spring's standard UsernamePasswordAuthenticationFilter.
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}