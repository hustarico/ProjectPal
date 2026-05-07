package com._4.ProjectPal.user.dto;

import com._4.ProjectPal.user.ExperienceLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSkillResponse {

    private Integer id;
    private Integer userId;
    private Integer skillId;
    private String skillName;
    private ExperienceLevel experienceLevel;
}