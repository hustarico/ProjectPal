package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import com._4.ProjectPal.user.UserSkill;
import com._4.ProjectPal.user.UserSkillRepository;
import com._4.ProjectPal.user.dto.AddUserSkillRequest;
import com._4.ProjectPal.user.dto.UserSkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;

    @Override
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(this::toSkillResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SkillResponse createSkill(CreateSkillRequest request) {
        if (skillRepository.existsByName(request.getName())) {
            throw new ResponseStatusException(BAD_REQUEST, "Skill with this name already exists");
        }

        Skill skill = Skill.builder()
                .name(request.getName())
                .build();

        Skill saved = skillRepository.save(skill);
        return toSkillResponse(saved);
    }

    @Override
    public UserSkillResponse addSkillToUser(AddUserSkillRequest request, User currentUser) {
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Skill not found"));

        if (userSkillRepository.existsByUserAndSkill(currentUser, skill)) {
            throw new ResponseStatusException(BAD_REQUEST, "User already has this skill");
        }

        UserSkill userSkill = UserSkill.builder()
                .user(currentUser)
                .skill(skill)
                .experienceLevel(request.getExperienceLevel())
                .build();

        UserSkill saved = userSkillRepository.save(userSkill);
        return toUserSkillResponse(saved);
    }

    @Override
    public void removeSkillFromUser(Integer skillId, User currentUser) {
        UserSkill userSkill = userSkillRepository.findByUserAndSkillId(currentUser, skillId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User skill not found"));

        userSkillRepository.delete(userSkill);
    }

    @Override
    public List<UserSkillResponse> getUserSkills(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        return userSkillRepository.findByUser(user).stream()
                .map(this::toUserSkillResponse)
                .collect(Collectors.toList());
    }

    private SkillResponse toSkillResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .build();
    }

    private UserSkillResponse toUserSkillResponse(UserSkill userSkill) {
        return UserSkillResponse.builder()
                .id(userSkill.getId())
                .userId(userSkill.getUser().getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getName())
                .experienceLevel(userSkill.getExperienceLevel())
                .build();
    }
}