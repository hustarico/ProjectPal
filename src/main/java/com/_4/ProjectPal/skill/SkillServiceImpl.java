package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

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

    private SkillResponse toSkillResponse(Skill skill) {
        return SkillResponse.builder()
                .id(skill.getId())
                .name(skill.getName())
                .build();
    }
}