package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.dto.AddUserSkillRequest;
import com._4.ProjectPal.user.dto.UserSkillResponse;

import java.util.List;

public interface SkillService {
    List<SkillResponse> getAllSkills();
    SkillResponse createSkill(CreateSkillRequest request);
    UserSkillResponse addSkillToUser(AddUserSkillRequest request, User currentUser);
    void removeSkillFromUser(Integer skillId, User currentUser);
    List<UserSkillResponse> getUserSkills(Integer userId);
}