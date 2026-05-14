package com._4.ProjectPal.task;

import com._4.ProjectPal.notification.NotificationService;
import com._4.ProjectPal.notification.NotificationType;
import com._4.ProjectPal.project.MemberRole;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMember;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.task.dto.CreateTaskRequest;
import com._4.ProjectPal.task.dto.TaskResponse;
import com._4.ProjectPal.task.dto.UpdateTaskRequest;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private boolean isOwnerOrAdmin(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return true;
        return projectMemberRepository.findByProjectAndUser(project, user)
                .map(pm -> pm.getMemberRole() == MemberRole.ADMIN)
                .orElse(false);
    }

    @Override
    public TaskResponse createTask(Integer projectId, CreateTaskRequest request, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!isOwnerOrAdmin(project, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Only the owner or an admin can create tasks");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .project(project)
                .status(TaskStatus.TODO)
                .isDeleted(false)
                .build();

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Override
    public TaskResponse assignTask(Integer taskId, Integer assigneeId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));

        if (!isOwnerOrAdmin(task.getProject(), currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Only the owner or an admin can assign tasks");
        }

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"));

        if (!projectMemberRepository.existsByProjectAndUser(task.getProject(), assignee)) {
            throw new ResponseStatusException(BAD_REQUEST, "Assignee is not a member of this project");
        }

        task.setAssignee(assignee);
        Task saved = taskRepository.save(task);

        notificationService.createNotification(
                assignee,
                NotificationType.TASK_ASSIGNED,
                "You have been assigned to task: " + task.getTitle() + " in project: " + task.getProject().getName(),
                task.getProject()
        );

        return toResponse(saved);
    }

    @Override
    public TaskResponse updateTaskStatus(Integer taskId, TaskStatus status, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));

        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUser.getId());
        if (!isOwnerOrAdmin(task.getProject(), currentUser) && !isAssignee) {
            throw new ResponseStatusException(FORBIDDEN, "You are not authorized to update this task");
        }

        task.setStatus(status);
        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Override
    public TaskResponse updateTask(Integer taskId, UpdateTaskRequest request, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));

        boolean canManage = isOwnerOrAdmin(task.getProject(), currentUser);
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(currentUser.getId());

        if (!canManage && !isAssignee) {
            throw new ResponseStatusException(FORBIDDEN, "You are not authorized to update this task");
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }
        if (request.getAssigneeId() != null && canManage) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Assignee not found"));
            if (!projectMemberRepository.existsByProjectAndUser(task.getProject(), assignee)) {
                throw new ResponseStatusException(BAD_REQUEST, "Assignee is not a member of this project");
            }
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    @Override
    public void softDeleteTask(Integer taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));

        if (!isOwnerOrAdmin(task.getProject(), currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "Only the owner or an admin can delete tasks");
        }

        task.setIsDeleted(true);
        taskRepository.save(task);
    }

    @Override
    public List<TaskResponse> getTasksByProject(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        return taskRepository.findByProjectIdAndIsDeletedFalse(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .deadline(task.getDeadline())
                .projectId(task.getProject().getId())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getEmail() : null)
                .isDeleted(task.getIsDeleted())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
