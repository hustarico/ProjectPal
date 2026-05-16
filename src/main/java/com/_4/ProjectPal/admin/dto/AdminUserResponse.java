package com._4.ProjectPal.admin.dto;

import com._4.ProjectPal.user.AvailabilityStatus;
import com._4.ProjectPal.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private Boolean isActive;
    private Role role;
    private AvailabilityStatus availabilityStatus;
    private int projectCount;
}
