package com._4.ProjectPal.message;

import com._4.ProjectPal.message.dto.MessageDeletedEvent;
import com._4.ProjectPal.message.dto.MessageResponse;
import com._4.ProjectPal.message.dto.SendMessageRequest;
import com._4.ProjectPal.notification.NotificationService;
import com._4.ProjectPal.notification.NotificationType;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final MessageService messageService;
    private final NotificationService notificationService;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @MessageMapping("/chat/{projectId}")
    public void handleMessage(
            @DestinationVariable Integer projectId,
            SendMessageRequest request,
            Principal principal) {

        if (principal == null) return;
        User sender = userRepository.findByEmail(principal.getName()).orElse(null);
        if (sender == null) return;

        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElse(null);
        if (project == null) return;

        if (!projectMemberRepository.existsByProjectAndUser(project, sender)) return;

        Message saved = messageRepository.save(Message.builder()
                .project(project)
                .sender(sender)
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .build());

        MessageResponse response = MessageResponse.builder()
                .id(saved.getId())
                .projectId(saved.getProject().getId())
                .senderId(saved.getSender().getId())
                .senderName(saved.getSender().getEmail())
                .content(saved.getContent())
                .fileUrl(saved.getFileUrl())
                .fileName(saved.getFileName())
                .sentAt(saved.getSentAt())
                .build();

        messagingTemplate.convertAndSend("/topic/project/" + projectId, response);

        projectMemberRepository.findByProject(project).stream()
                .filter(member -> !member.getUser().getId().equals(sender.getId()))
                .forEach(member -> notificationService.createNotification(
                        member.getUser(),
                        NotificationType.NEW_MESSAGE,
                        sender.getFirstName() + " sent a message in " + project.getName(),
                        project
                ));
    }

    @MessageMapping("/chat/{projectId}/delete")
    public void handleDeleteMessage(
            @DestinationVariable Integer projectId,
            Integer messageId,
            Principal principal) {

        if (principal == null) return;
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return;

        MessageDeletedEvent event = messageService.deleteMessage(messageId, user);
        messagingTemplate.convertAndSend("/topic/project/" + event.getProjectId(), event);
    }
}
