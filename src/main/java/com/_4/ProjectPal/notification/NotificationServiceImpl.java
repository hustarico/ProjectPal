package com._4.ProjectPal.notification;

import com._4.ProjectPal.notification.dto.NotificationResponse;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.user.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    @Override
    @Transactional
    public void deleteNotification(Integer notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(User currentUser) {
        List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);
        notificationRepository.deleteAll(notifications);
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