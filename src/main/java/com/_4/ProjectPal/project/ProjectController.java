package com._4.ProjectPal.project;

import com._4.ProjectPal.project.dto.CreateProjectRequest;
import com._4.ProjectPal.project.dto.ProjectMemberResponse;
import com._4.ProjectPal.project.dto.UpdateMemberRoleRequest;
//import jakarta.validation.Valid;
import com._4.ProjectPal.project.dto.ProjectResponse;
import com._4.ProjectPal.project.dto.UpdateProjectRequest;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import com._4.ProjectPal.user.dto.PastProjectResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

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

    @GetMapping("/{id}/members")
    public List<ProjectMemberResponse> getProjectMembers(@PathVariable Integer id,
                                                           Authentication authentication) {
        return projectService.getProjectMembers(id, currentUser(authentication));
    }

    @PatchMapping("/{projectId}/members/{userId}/role")
    public List<ProjectMemberResponse> updateMemberRole(@PathVariable Integer projectId,
                                                          @PathVariable Integer userId,
                                                          @Validated @RequestBody UpdateMemberRoleRequest request,
                                                          Authentication authentication) {
        return projectService.updateMemberRole(projectId, userId, request.getMemberRole(), currentUser(authentication));
    }

    @PostMapping("/{id}/complete")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void completeProject(@PathVariable Integer id,
                                 Authentication authentication) {
        projectService.markProjectCompleted(id, currentUser(authentication));
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public List<ProjectMemberResponse> removeMember(@PathVariable Integer projectId,
                                                      @PathVariable Integer userId,
                                                      Authentication authentication) {
        return projectService.removeMember(projectId, userId, currentUser(authentication));
    }

    @PostMapping("/{projectId}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveProject(@PathVariable Integer projectId,
                              Authentication authentication) {
        projectService.leaveProject(projectId, currentUser(authentication));
    }

    @GetMapping("/past")
    public List<PastProjectResponse> getPastProjects(Authentication authentication) {
        User user = currentUser(authentication);
        return projectMemberRepository.findByUserAndFinishedAtIsNotNull(user).stream()
                .map(pm -> PastProjectResponse.builder()
                        .id(pm.getProject().getId())
                        .name(pm.getProject().getName())
                        .status(pm.getProject().getStatus().name())
                        .role(pm.getMemberRole().name())
                        .build())
                .collect(Collectors.toList());
    }
}