package com._4.ProjectPal.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    private Integer projectId;
    private String content;
    private String fileUrl;
    private String fileName;
}