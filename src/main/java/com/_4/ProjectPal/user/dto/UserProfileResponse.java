package com._4.ProjectPal.user.dto;

import com._4.ProjectPal.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import com._4.ProjectPal.user.dto.UserSkillResponse;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private Boolean isActive;
    private Role role;
    private List<UserSkillResponse> skills;
}