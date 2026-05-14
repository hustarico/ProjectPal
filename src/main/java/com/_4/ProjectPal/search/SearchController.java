package com._4.ProjectPal.search;

import com._4.ProjectPal.user.ExperienceLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @GetMapping("/users/advanced")
    public List<SearchUserResult> searchUsers(
            @RequestParam(required = false, defaultValue = "") String name,
            @RequestParam(required = false) String skillIds) {

        List<Integer> ids;
        if (skillIds == null || skillIds.isBlank()) {
            ids = List.of();
        } else {
            try {
                ids = Arrays.stream(skillIds.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .toList();
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid skill ID format");
            }
        }

        return searchService.searchUsers(name, ids);
    }

    @GetMapping("/projects")
    public List<SearchProjectResult> browseOpenProjects(@RequestParam(required = false, defaultValue = "") String name) {
        return searchService.browseOpenProjects(name);
    }
}