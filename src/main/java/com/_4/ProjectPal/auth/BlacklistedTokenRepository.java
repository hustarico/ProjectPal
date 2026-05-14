package com._4.ProjectPal.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Integer> {
    boolean existsByTokenId(String tokenId);
    void deleteByExpiresAtBefore(LocalDateTime now);
}
