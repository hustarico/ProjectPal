package com._4.ProjectPal.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private Integer id;
    private Integer projectId;
    private Integer senderId;
    private String senderName;
    private String content;
    private String fileUrl;
    private String fileName;
    private LocalDateTime sentAt;
}