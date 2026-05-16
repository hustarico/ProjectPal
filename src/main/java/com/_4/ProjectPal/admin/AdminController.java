package com._4.ProjectPal.admin;

import com._4.ProjectPal.admin.dto.AdminProjectResponse;
import com._4.ProjectPal.admin.dto.AdminStatsResponse;
import com._4.ProjectPal.admin.dto.AdminUserResponse;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.skill.SkillRepository;
import com._4.ProjectPal.user.Role;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final SkillRepository skillRepository;

    private User currentUser(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return user;
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats(Authentication authentication) {
        currentUser(authentication);
        List<User> allUsers = userRepository.findAll();
        List<Project> allProjects = projectRepository.findAll();

        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(User::getIsActive).count();
        long blockedUsers = allUsers.stream().filter(u -> !u.getIsActive()).count();
        long adminUsers = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();
        long totalProjects = allProjects.size();
        long activeProjects = allProjects.stream().filter(p -> !p.getIsDeleted()).count();
        long endedProjects = allProjects.stream().filter(Project::getIsDeleted).count();
        long totalSkills = skillRepository.count();

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .blockedUsers(blockedUsers)
                .adminUsers(adminUsers)
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .endedProjects(endedProjects)
                .totalSkills(totalSkills)
                .build();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers(Authentication authentication) {
        currentUser(authentication);
        return userRepository.findAll().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    @PatchMapping("/users/{id}/status")
    public AdminUserResponse toggleUserStatus(@PathVariable Integer id, Authentication authentication) {
        currentUser(authentication);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot block an admin");
        }
        user.setIsActive(!user.getIsActive());
        User saved = userRepository.save(user);
        return toAdminUserResponse(saved);
    }

    @PatchMapping("/users/{id}/role")
    public AdminUserResponse promoteToAdmin(@PathVariable Integer id, Authentication authentication) {
        currentUser(authentication);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is already an admin");
        }
        user.setRole(Role.ADMIN);
        user.setIsActive(true);
        User saved = userRepository.save(user);
        return toAdminUserResponse(saved);
    }

    @GetMapping("/projects")
    public List<AdminProjectResponse> getAllProjects(Authentication authentication) {
        currentUser(authentication);
        return projectRepository.findAll().stream()
                .map(this::toAdminProjectResponse)
                .collect(Collectors.toList());
    }

    @PatchMapping("/projects/{id}/status")
    public AdminProjectResponse toggleProjectStatus(@PathVariable Integer id, Authentication authentication) {
        currentUser(authentication);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        project.setIsDeleted(!project.getIsDeleted());
        Project saved = projectRepository.save(project);
        return toAdminProjectResponse(saved);
    }

    private AdminUserResponse toAdminUserResponse(User user) {
        int projectCount = projectMemberRepository.findByUser(user).size();
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .bio(user.getBio())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.getIsActive())
                .role(user.getRole())
                .availabilityStatus(user.getAvailabilityStatus())
                .projectCount(projectCount)
                .build();
    }

    private AdminProjectResponse toAdminProjectResponse(Project project) {
        int memberCount = projectMemberRepository.findByProject(project).size();
        return AdminProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getFirstName() + " " + project.getOwner().getLastName())
                .isDeleted(project.getIsDeleted())
                .memberCount(memberCount)
                .build();
    }
}
