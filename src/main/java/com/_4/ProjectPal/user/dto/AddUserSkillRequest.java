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
public class AddUserSkillRequest {

    private Integer skillId;
    private ExperienceLevel experienceLevel;
}