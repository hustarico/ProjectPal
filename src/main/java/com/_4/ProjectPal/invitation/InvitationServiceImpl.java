package com._4.ProjectPal.invitation;

import com._4.ProjectPal.invitation.dto.InvitationResponse;
import com._4.ProjectPal.invitation.dto.RespondInvitationRequest;
import com._4.ProjectPal.project.MemberRole;
import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMember;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    @Override
    public InvitationResponse sendInvite(Integer projectId, Integer receiverId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Receiver not found"));

        boolean exists = invitationRepository.existsByProjectAndReceiverAndTypeAndStatus(
                project, receiver, InvitationType.INVITE, InvitationStatus.PENDING);
        if (exists) {
            throw new ResponseStatusException(BAD_REQUEST, "Invitation already exists");
        }

        Invitation invitation = Invitation.builder()
                .project(project)
                .sender(currentUser)
                .receiver(receiver)
                .status(InvitationStatus.PENDING)
                .type(InvitationType.INVITE)
                .build();

        Invitation saved = invitationRepository.save(invitation);
        return toResponse(saved);
    }

    @Override
    public InvitationResponse sendJoinRequest(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (projectMemberRepository.existsByProjectAndUser(project, currentUser)) {
            throw new ResponseStatusException(BAD_REQUEST, "You are already a member of this project");
        }

        boolean exists = invitationRepository.existsByProjectAndSenderAndTypeAndStatus(
                project, currentUser, InvitationType.JOIN_REQUEST, InvitationStatus.PENDING);
        if (exists) {
            throw new ResponseStatusException(BAD_REQUEST, "Join request already exists");
        }

        Invitation invitation = Invitation.builder()
                .project(project)
                .sender(currentUser)
                .receiver(project.getOwner())
                .status(InvitationStatus.PENDING)
                .type(InvitationType.JOIN_REQUEST)
                .build();

        Invitation saved = invitationRepository.save(invitation);
        return toResponse(saved);
    }

    @Override
    public InvitationResponse respondToInvitation(Integer invitationId, RespondInvitationRequest request, User currentUser) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Invitation not found"));

        if (invitation.getType() == InvitationType.INVITE) {
            if (!invitation.getReceiver().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(FORBIDDEN, "You are not the receiver of this invitation");
            }
        } else {
            Project project = invitation.getProject();
            if (!project.getOwner().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(FORBIDDEN, "You are not the project owner");
            }
        }

        if (request.getAccept()) {
            User memberToAdd = (invitation.getType() == InvitationType.INVITE)
                    ? invitation.getReceiver()
                    : invitation.getSender();

            ProjectMember projectMember = ProjectMember.builder()
                    .project(invitation.getProject())
                    .user(memberToAdd)
                    .memberRole(MemberRole.MEMBER)
                    .build();

            projectMemberRepository.save(projectMember);
            invitation.setStatus(InvitationStatus.ACCEPTED);
        } else {
            invitation.setStatus(InvitationStatus.REJECTED);
        }

        Invitation saved = invitationRepository.save(invitation);
        return toResponse(saved);
    }

    @Override
    public List<InvitationResponse> getPendingInvitationsForUser(User currentUser) {
        return invitationRepository.findByReceiverAndTypeAndStatus(
                currentUser, InvitationType.INVITE, InvitationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvitationResponse> getPendingJoinRequestsForProject(Integer projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(FORBIDDEN, "You are not the owner of this project");
        }

        return invitationRepository.findByProjectAndTypeAndStatus(
                project, InvitationType.JOIN_REQUEST, InvitationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private InvitationResponse toResponse(Invitation invitation) {
        return InvitationResponse.builder()
                .id(invitation.getId())
                .projectId(invitation.getProject().getId())
                .projectName(invitation.getProject().getName())
                .senderId(invitation.getSender().getId())
                .senderName(invitation.getSender().getEmail())
                .receiverId(invitation.getReceiver().getId())
                .receiverName(invitation.getReceiver().getEmail())
                .status(invitation.getStatus())
                .type(invitation.getType())
                .build();
    }
}