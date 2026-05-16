package com._4.ProjectPal.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDeletedEvent {
    private String type;
    private Integer messageId;
    private Integer projectId;

    public MessageDeletedEvent(Integer messageId, Integer projectId) {
        this.type = "MESSAGE_DELETED";
        this.messageId = messageId;
        this.projectId = projectId;
    }
}
