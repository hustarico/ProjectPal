package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;

import java.util.List;

public interface SkillService {
    List<SkillResponse> getAllSkills();
    SkillResponse createSkill(CreateSkillRequest request);
    void deleteSkill(Integer id);
}