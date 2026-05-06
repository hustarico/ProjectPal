package com._4.ProjectPal.auth;

import com._4.ProjectPal.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test controller for verifying authentication/authorization.
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final JwtService jwtService;

    /**
     * Protected endpoint: requires valid JWT.
     * Returns personalized greeting using the authenticated username (email).
     */
    @GetMapping("/protected")
    public String protectedEndpoint() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return "Hello " + userDetails.getUsername();
    }

    /** Unprotected endpoint: accessible without authentication. */
    @GetMapping("/unprotected")
    public String unprotectedEndpoint() {
        return "Hi";
    }
}