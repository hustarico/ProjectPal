package com._4.ProjectPal.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com._4.ProjectPal.user.User;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
}