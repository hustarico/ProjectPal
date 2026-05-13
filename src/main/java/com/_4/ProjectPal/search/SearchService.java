package com._4.ProjectPal.search;

import com._4.ProjectPal.user.ExperienceLevel;

import java.util.List;

public interface SearchService {
    List<SearchUserResult> searchUsersByName(String name);
    List<SearchUserResult> searchUsersBySkill(Integer skillId, ExperienceLevel experienceLevel);
    List<SearchUserResult> recommendUsersBySkills(List<Integer> skillIds);
    List<SearchUserResult> searchUsers(String name, List<Integer> skillIds);
    List<SearchProjectResult> browseOpenProjects();
}