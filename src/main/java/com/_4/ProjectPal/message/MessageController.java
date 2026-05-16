package com._4.ProjectPal.message;

import com._4.ProjectPal.message.dto.MessageDeletedEvent;
import com._4.ProjectPal.message.dto.MessageResponse;
import com._4.ProjectPal.message.dto.SendMessageRequest;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping("/project/{projectId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse saveMessage(@PathVariable Integer projectId,
                                        @Validated @RequestBody SendMessageRequest request,
                                        Authentication authentication) {
        return messageService.saveMessage(projectId, request, currentUser(authentication));
    }

    @GetMapping("/project/{projectId}")
    public List<MessageResponse> getProjectHistory(@PathVariable Integer projectId,
                                                   Authentication authentication) {
        return messageService.getProjectHistory(projectId, currentUser(authentication));
    }

    @DeleteMapping("/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable Integer messageId,
                               Authentication authentication) {
        MessageDeletedEvent event = messageService.deleteMessage(messageId, currentUser(authentication));
        messagingTemplate.convertAndSend("/topic/project/" + event.getProjectId(), event);
    }
}