package com._4.ProjectPal.invitation;

import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Integer> {
    boolean existsByProjectAndReceiverAndTypeAndStatus(Project project, User receiver, InvitationType type, InvitationStatus status);
    boolean existsByProjectAndSenderAndTypeAndStatus(Project project, User sender, InvitationType type, InvitationStatus status);
    List<Invitation> findByReceiverAndTypeAndStatus(User receiver, InvitationType type, InvitationStatus status);
    List<Invitation> findByProjectAndTypeAndStatus(Project project, InvitationType type, InvitationStatus status);
}