package com._4.ProjectPal.notification.dto;

import com._4.ProjectPal.notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Integer id;
    private Integer recipientId;
    private NotificationType type;
    private String message;
    private Integer projectId;
    private String projectName;
    private LocalDateTime createdAt;
}