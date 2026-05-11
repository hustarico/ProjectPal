package com._4.ProjectPal.user;

import com._4.ProjectPal.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access layer for the User entity.
 * Provides standard CRUD operations plus custom lookups by email.
 */
public interface UserRepository extends JpaRepository<User, Integer> {

    /** Finds a user by their email address (used as the username for authentication). */
    Optional<User> findByEmail(String email);

    /** Checks whether an account with the given email already exists. */
    boolean existsByEmail(String email);
}