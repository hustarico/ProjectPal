package com._4.ProjectPal.search;

import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.project.ProjectStatus;
import com._4.ProjectPal.skill.SkillRepository;
import com._4.ProjectPal.user.ExperienceLevel;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import com._4.ProjectPal.user.UserSkill;
import com._4.ProjectPal.user.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final ProjectRepository projectRepository;

    @Override
    public List<SearchUserResult> searchUsersByName(String name) {
        // TODO: Replace with @Query using LIKE for better performance with large datasets
        // Example: @Query("SELECT u FROM User u WHERE LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
        return userRepository.findAll().stream()
                .filter(u -> u.getIsActive())
                .filter(u -> {
                    String fullName = (u.getFirstName() + " " + u.getLastName()).toLowerCase();
                    return fullName.contains(name.toLowerCase());
                })
                .map(this::toUserResult)
                .collect(Collectors.toList());
    }

    @Override
    public List<SearchUserResult> searchUsersBySkill(Integer skillId, ExperienceLevel experienceLevel) {
        List<UserSkill> userSkills;

        if (experienceLevel == null) {
            userSkills = userSkillRepository.findBySkillId(skillId);
        } else {
            userSkills = userSkillRepository.findBySkillIdAndExperienceLevel(skillId, experienceLevel);
        }

        return userSkills.stream()
                .map(UserSkill::getUser)
                .filter(u -> u.getIsActive())
                .distinct()
                .map(this::toUserResult)
                .collect(Collectors.toList());
    }

    @Override
    public List<SearchUserResult> recommendUsersBySkills(List<Integer> skillIds) {
        Map<User, Set<Integer>> userSkillMap = new HashMap<>();

        for (Integer skillId : skillIds) {
            List<UserSkill> userSkills = userSkillRepository.findBySkillId(skillId);
            for (UserSkill us : userSkills) {
                userSkillMap
                    .computeIfAbsent(us.getUser(), k -> new HashSet<>())
                    .add(skillId);
            }
        }

        return userSkillMap.entrySet().stream()
                .filter(e -> e.getKey().getIsActive())
                .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                .map(Map.Entry::getKey)
                .map(this::toUserResult)
                .collect(Collectors.toList());
    }

    @Override
    public List<SearchProjectResult> browseOpenProjects() {
        return projectRepository.findByStatusAndIsDeletedFalse(ProjectStatus.OPEN).stream()
                .map(this::toProjectResult)
                .collect(Collectors.toList());
    }

    private SearchUserResult toUserResult(User u) {
        List<SearchUserResult.SkillEntry> skillEntries = u.getUserSkills().stream()
                .map(us -> new SearchUserResult.SkillEntry(
                        us.getSkill().getName(),
                        us.getExperienceLevel().name()
                ))
                .collect(Collectors.toList());

        return new SearchUserResult(
                u.getId(),
                u.getFirstName(),
                u.getLastName(),
                u.getEmail(),
                u.getBio(),
                u.getProfilePictureUrl(),
                skillEntries
        );
    }

    private SearchProjectResult toProjectResult(Project p) {
        return new SearchProjectResult(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getStatus().name()
        );
    }
}