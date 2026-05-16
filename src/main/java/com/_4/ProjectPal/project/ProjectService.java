package com._4.ProjectPal.project;

import com._4.ProjectPal.project.dto.CreateProjectRequest;
import com._4.ProjectPal.project.dto.ProjectResponse;
import com._4.ProjectPal.project.dto.UpdateProjectRequest;
import com._4.ProjectPal.project.dto.ProjectMemberResponse;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface ProjectService {
    ProjectResponse createProject(CreateProjectRequest request, User currentUser);
    ProjectResponse updateProject(Integer projectId, UpdateProjectRequest request, User currentUser);
    void softDeleteProject(Integer projectId, User currentUser);
    ProjectResponse getProjectById(Integer projectId, User currentUser);
    List<ProjectResponse> getMyProjects(User currentUser);
    List<ProjectResponse> browseAvailableProjects(User currentUser);
    List<ProjectMemberResponse> getProjectMembers(Integer projectId, User currentUser);
    List<ProjectMemberResponse> updateMemberRole(Integer projectId, Integer userId, MemberRole memberRole, User currentUser);
    void markProjectCompleted(Integer projectId, User currentUser);
    List<ProjectMemberResponse> removeMember(Integer projectId, Integer userId, User currentUser);
    void leaveProject(Integer projectId, User currentUser);
}