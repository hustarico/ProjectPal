package com._4.ProjectPal.project;

import com._4.ProjectPal.project.dto.CreateProjectRequest;
import com._4.ProjectPal.project.dto.ProjectResponse;
import com._4.ProjectPal.project.dto.UpdateProjectRequest;
import com._4.ProjectPal.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

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
        return projectRepository.findByOwnerIdAndIsDeletedFalse(currentUser.getId())
                .stream()
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