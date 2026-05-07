package com._4.ProjectPal.invitation.dto;

import com._4.ProjectPal.invitation.InvitationStatus;
import com._4.ProjectPal.invitation.InvitationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {

    private Integer id;
    private Integer projectId;
    private String projectName;
    private Integer senderId;
    private String senderName;
    private Integer receiverId;
    private String receiverName;
    private InvitationStatus status;
    private InvitationType type;
}