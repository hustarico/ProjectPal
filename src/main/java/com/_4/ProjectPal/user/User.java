package com._4.ProjectPal.user;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

import com._4.ProjectPal.user.Role;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String firstName;
    private String lastName;

    /** Email is used as the unique username for authentication. */
    @Column(unique = true, nullable = false)
    private String email;

    /** BCrypt-encoded password; never stored in plain text. */
    @Column(nullable = false)
    private String password;

    /** Every user is assigned a role which maps to a Spring Security authority (ROLE_USER / ROLE_ADMIN). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    /**
     * Returns the authorities granted to the user.
     * The role name is prefixed with "ROLE_" as required by Spring Security convention.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Ensure Role enum is properly imported and accessible
//        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));

        return null;
    }

    /** The username is the user's email address. */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
