package com._4.ProjectPal.message;

import com._4.ProjectPal.message.dto.MessageResponse;
import com._4.ProjectPal.message.dto.SendMessageRequest;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface MessageService {
    MessageResponse saveMessage(Integer projectId, SendMessageRequest request, User sender);
    List<MessageResponse> getProjectHistory(Integer projectId, User currentUser);
}