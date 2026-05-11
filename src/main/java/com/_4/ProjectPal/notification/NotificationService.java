package com._4.ProjectPal.notification;

import com._4.ProjectPal.notification.dto.NotificationResponse;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User recipient, NotificationType type, String message, Project project);
    List<NotificationResponse> getNotificationsForUser(User currentUser);
}