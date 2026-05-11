package com._4.ProjectPal.project;

import com._4.ProjectPal.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Integer> {
    boolean existsByProjectAndUser(Project project, User user);
}