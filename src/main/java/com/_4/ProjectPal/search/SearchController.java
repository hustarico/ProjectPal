package com._4.ProjectPal.search;

import com._4.ProjectPal.user.ExperienceLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/users")
    public List<SearchUserResult> searchUsersByName(@RequestParam String name) {
        return searchService.searchUsersByName(name);
    }

    @GetMapping("/users/skill")
    public List<SearchUserResult> searchUsersBySkill(
            @RequestParam Integer skillId,
            @RequestParam(required = false) ExperienceLevel experienceLevel) {
        return searchService.searchUsersBySkill(skillId, experienceLevel);
    }

    @GetMapping("/users/recommend")
    public List<SearchUserResult> recommendUsersBySkills(@RequestParam String skillIds) {
        List<Integer> ids = Arrays.stream(skillIds.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .toList();
        return searchService.recommendUsersBySkills(ids);
    }

    @GetMapping("/projects")
    public List<SearchProjectResult> browseOpenProjects() {
        return searchService.browseOpenProjects();
    }
}