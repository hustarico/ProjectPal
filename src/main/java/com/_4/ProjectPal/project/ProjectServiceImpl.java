package com._4.ProjectPal.project;

import com._4.ProjectPal.project.dto.CreateProjectRequest;
import com._4.ProjectPal.project.dto.ProjectMemberResponse;
import com._4.ProjectPal.project.dto.ProjectResponse;
import com._4.ProjectPal.project.dto.UpdateProjectRequest;
import com._4.ProjectPal.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public ProjectResponse createProject(CreateProjectRequest request, User currentUser) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(ProjectStatus.OPEN)
                .owner(currentUser)
                .isDeleted(false)
                .build();

        Project savedProject = projectRepository.save(project);

        ProjectMember projectMember = ProjectMember.builder()
                .project(savedProject)
                .user(currentUser)
                .memberRole(MemberRole.OWNER)
                .build();

        projectMemberRepository.save(projectMember);

        return toResponse(savedProject);
    }

    @Override
    public ProjectResponse updateProject(Integer projectId, UpdateProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        Project savedProject = projectRepository.save(project);
        return toResponse(savedProject);
    }

    @Override
    public void softDeleteProject(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        project.setIsDeleted(true);
        projectRepository.save(project);
    }

    @Override
    public ProjectResponse getProjectById(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        return toResponse(project);
    }

    @Override
    public List<ProjectResponse> getMyProjects(User currentUser) {
        Set<Project> projects = new HashSet<>();

        projects.addAll(projectRepository.findByOwnerIdAndIsDeletedFalse(currentUser.getId()));

        projectMemberRepository.findByUser(currentUser)
                .stream()
                .map(ProjectMember::getProject)
                .filter(p -> !p.getIsDeleted())
                .forEach(projects::add);

        return projects.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> browseAvailableProjects(User currentUser) {
        return projectRepository.findByStatusAndIsDeletedFalse(ProjectStatus.OPEN)
                .stream()
                .filter(p -> !projectMemberRepository.existsByProjectAndUser(p, currentUser))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectMemberResponse> updateMemberRole(Integer projectId, Integer userId, MemberRole newRole, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        ProjectMember member = projectMemberRepository.findByProject(project).stream()
                .filter(pm -> pm.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User is not a member of this project"));

        if (member.getMemberRole() == MemberRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change the owner's role");
        }

        member.setMemberRole(newRole);
        projectMemberRepository.save(member);

        return getProjectMembers(projectId, currentUser);
    }

    @Override
    public List<ProjectMemberResponse> getProjectMembers(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        return projectMemberRepository.findByProject(project).stream()
                .map(pm -> ProjectMemberResponse.builder()
                        .userId(pm.getUser().getId())
                        .email(pm.getUser().getEmail())
                        .firstName(pm.getUser().getFirstName())
                        .lastName(pm.getUser().getLastName())
                        .profilePictureUrl(pm.getUser().getProfilePictureUrl())
                        .memberRole(pm.getMemberRole())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void markProjectCompleted(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        projectRepository.save(project);

        List<ProjectMember> members = projectMemberRepository.findByProject(project);
        LocalDateTime now = LocalDateTime.now();
        for (ProjectMember member : members) {
            member.setFinishedAt(now);
        }
        projectMemberRepository.saveAll(members);
    }

    @Override
    public List<ProjectMemberResponse> removeMember(Integer projectId, Integer userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "Only the project owner can remove members");
        }

        if (project.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove the project owner");
        }

        if (currentUser.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use the leave endpoint to leave a project");
        }

        User targetUser = projectMemberRepository.findByProject(project).stream()
                .filter(pm -> pm.getUser().getId().equals(userId))
                .map(ProjectMember::getUser)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User is not a member of this project"));

        ProjectMember member = projectMemberRepository.findByProjectAndUser(project, targetUser)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User is not a member of this project"));

        projectMemberRepository.delete(member);

        return getProjectMembers(projectId, currentUser);
    }

    @Override
    public void leaveProject(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project owner cannot leave. Delete or transfer the project first");
        }

        ProjectMember membership = projectMemberRepository.findByProjectAndUser(project, currentUser)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "You are not a member of this project"));

        membership.setFinishedAt(LocalDateTime.now());
        projectMemberRepository.save(membership);
        projectMemberRepository.delete(membership);
    }

    private ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getEmail())
                .isDeleted(project.getIsDeleted())
                .build();
    }
}