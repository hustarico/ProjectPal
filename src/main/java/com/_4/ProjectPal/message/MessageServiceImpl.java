package com._4.ProjectPal.message;

import com._4.ProjectPal.message.dto.MessageResponse;
import com._4.ProjectPal.message.dto.SendMessageRequest;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public MessageResponse saveMessage(Integer projectId, SendMessageRequest request, User sender) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!projectMemberRepository.existsByProjectAndUser(project, sender)) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        Message message = Message.builder()
                .project(project)
                .sender(sender)
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .build();

        Message saved = messageRepository.save(message);
        return toResponse(saved);
    }

    @Override
    public List<MessageResponse> getProjectHistory(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = projectMemberRepository.existsByProjectAndUser(project, currentUser);

        if (!isOwner && !isMember) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        return messageRepository.findByProjectIdOrderBySentAtAsc(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MessageResponse toResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .projectId(message.getProject().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getEmail())
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .sentAt(message.getSentAt())
                .build();
    }
}