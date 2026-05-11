package com._4.ProjectPal.notification;

import com._4.ProjectPal.notification.dto.NotificationResponse;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public void createNotification(User recipient, NotificationType type, String message, Project project) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .message(message)
                .project(project)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponse> getNotificationsForUser(User currentUser) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .recipientId(notification.getRecipient().getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .projectId(notification.getProject() != null ? notification.getProject().getId() : null)
                .projectName(notification.getProject() != null ? notification.getProject().getName() : null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}