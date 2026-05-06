package com._4.ProjectPal.user;

/**
 * Defines the available user roles in the system.
 * Each role maps to a Spring Security authority (prefixed with "ROLE_").
 */
public enum Role {
    USER,
    ADMIN
}