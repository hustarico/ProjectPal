package com._4.ProjectPal.project;

import com._4.ProjectPal.project.dto.CreateProjectRequest;
//import jakarta.validation.Valid;
import com._4.ProjectPal.project.dto.ProjectResponse;
import com._4.ProjectPal.project.dto.UpdateProjectRequest;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(@Validated @RequestBody CreateProjectRequest request,
                                          Authentication authentication) {
        return projectService.createProject(request, currentUser(authentication));
    }

    @PatchMapping("/{id}")
    public ProjectResponse updateProject(@PathVariable Integer id,
                                          @Validated @RequestBody UpdateProjectRequest request,
                                          Authentication authentication) {
        return projectService.updateProject(id, request, currentUser(authentication));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDeleteProject(@PathVariable Integer id,
                                   Authentication authentication) {
        projectService.softDeleteProject(id, currentUser(authentication));
    }

    @GetMapping("/{id}")
    public ProjectResponse getProjectById(@PathVariable Integer id,
                                           Authentication authentication) {
        return projectService.getProjectById(id, currentUser(authentication));
    }

    @GetMapping("/my")
    public List<ProjectResponse> getMyProjects(Authentication authentication) {
        return projectService.getMyProjects(currentUser(authentication));
    }

    @GetMapping("/browse")
    public List<ProjectResponse> browseAvailableProjects(Authentication authentication) {
        return projectService.browseAvailableProjects(currentUser(authentication));
    }
}