package com._4.ProjectPal.config;

import com._4.ProjectPal.service.JwtService;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request,
                                                       WebSocketHandler wsHandler,
                                                       Map<String, Object> attributes) {
                        String query = request.getURI().getQuery();
                        if (query == null || !query.startsWith("token=")) return null;

                        String token = query.substring(6);
                        String email = jwtService.extractUsername(token);
                        if (email == null) return null;

                        User user = userRepository.findByEmail(email).orElse(null);
                        if (user == null) return null;

                        if (!jwtService.isTokenValid(token, user)) return null;

                        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    }
                });
    }
}
