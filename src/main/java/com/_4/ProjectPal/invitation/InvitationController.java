package com._4.ProjectPal.invitation;

import com._4.ProjectPal.invitation.dto.CreateInvitationRequest;
import com._4.ProjectPal.invitation.dto.InvitationResponse;
import com._4.ProjectPal.invitation.dto.RespondInvitationRequest;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse sendInvite(@Validated @RequestBody CreateInvitationRequest request,
                                          Authentication authentication) {
        return invitationService.sendInvite(request.getProjectId(), request.getReceiverId(), currentUser(authentication));
    }

    @PostMapping("/join-request")
    @ResponseStatus(HttpStatus.CREATED)
    public InvitationResponse sendJoinRequest(@RequestParam Integer projectId,
                                               Authentication authentication) {
        return invitationService.sendJoinRequest(projectId, currentUser(authentication));
    }

    @PatchMapping("/{id}/respond")
    public InvitationResponse respondToInvitation(@PathVariable Integer id,
                                                   @Validated @RequestBody RespondInvitationRequest request,
                                                   Authentication authentication) {
        return invitationService.respondToInvitation(id, request, currentUser(authentication));
    }

    @GetMapping("/my")
    public List<InvitationResponse> getPendingInvitationsForUser(Authentication authentication) {
        return invitationService.getPendingInvitationsForUser(currentUser(authentication));
    }

    @GetMapping("/join-requests/{projectId}")
    public List<InvitationResponse> getPendingJoinRequestsForProject(@PathVariable Integer projectId,
                                                                      Authentication authentication) {
        return invitationService.getPendingJoinRequestsForProject(projectId, currentUser(authentication));
    }
}