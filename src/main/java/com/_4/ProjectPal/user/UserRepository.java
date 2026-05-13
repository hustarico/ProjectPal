package com._4.ProjectPal.user;

import com._4.ProjectPal.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    @Query("SELECT u FROM User u WHERE LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> searchByName(String name);

    @Query("SELECT u FROM User u WHERE " +
           "(:name = '' OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:skillCount = 0 OR (SELECT COUNT(us) FROM UserSkill us WHERE us.user = u AND us.skill.id IN :skillIds) = :skillCount)")
    List<User> searchByNameAndSkills(@Param("name") String name, @Param("skillIds") List<Integer> skillIds, @Param("skillCount") long skillCount);
}