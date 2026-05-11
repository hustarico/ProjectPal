package com._4.ProjectPal.task;

import com._4.ProjectPal.task.dto.CreateTaskRequest;
import com._4.ProjectPal.task.dto.TaskResponse;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(Integer projectId, CreateTaskRequest request, User currentUser);
    TaskResponse assignTask(Integer taskId, Integer assigneeId, User currentUser);
    TaskResponse updateTaskStatus(Integer taskId, TaskStatus status, User currentUser);
    List<TaskResponse> getTasksByProject(Integer projectId, User currentUser);
}