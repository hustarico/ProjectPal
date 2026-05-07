package com._4.ProjectPal.task.dto;

import com._4.ProjectPal.task.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime deadline;
    private Integer assigneeId;
}