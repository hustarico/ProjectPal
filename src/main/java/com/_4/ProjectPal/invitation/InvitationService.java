package com._4.ProjectPal.invitation;

import com._4.ProjectPal.invitation.dto.InvitationResponse;
import com._4.ProjectPal.invitation.dto.RespondInvitationRequest;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface InvitationService {
    InvitationResponse sendInvite(Integer projectId, Integer receiverId, User currentUser);
    InvitationResponse sendJoinRequest(Integer projectId, User currentUser);
    InvitationResponse respondToInvitation(Integer invitationId, RespondInvitationRequest request, User currentUser);
    List<InvitationResponse> getPendingInvitationsForUser(User currentUser);
    List<InvitationResponse> getPendingJoinRequestsForProject(Integer projectId, User currentUser);
}