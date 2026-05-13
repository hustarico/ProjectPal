package com._4.ProjectPal.task;

import com._4.ProjectPal.task.dto.AssignTaskRequest;
import com._4.ProjectPal.task.dto.CreateTaskRequest;
import com._4.ProjectPal.task.dto.TaskResponse;
import com._4.ProjectPal.task.dto.UpdateTaskStatusRequest;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@RequestParam Integer projectId,
                                    @Validated @RequestBody CreateTaskRequest request,
                                    Authentication authentication) {
        return taskService.createTask(projectId, request, currentUser(authentication));
    }

    @PatchMapping("/{id}/assign")
    public TaskResponse assignTask(@PathVariable Integer id,
                                    @Validated @RequestBody AssignTaskRequest request,
                                    Authentication authentication) {
        return taskService.assignTask(id, request.getAssigneeId(), currentUser(authentication));
    }

    @PatchMapping("/{id}/status")
    public TaskResponse updateTaskStatus(@PathVariable Integer id,
                                          @Validated @RequestBody UpdateTaskStatusRequest request,
                                          Authentication authentication) {
        return taskService.updateTaskStatus(id, request.getStatus(), currentUser(authentication));
    }

    @GetMapping("/project/{projectId}")
    public List<TaskResponse> getTasksByProject(@PathVariable Integer projectId,
                                                 Authentication authentication) {
        return taskService.getTasksByProject(projectId, currentUser(authentication));
    }
}