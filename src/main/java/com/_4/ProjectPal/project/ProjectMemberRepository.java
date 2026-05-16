package com._4.ProjectPal.project;

import com._4.ProjectPal.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Integer> {
    boolean existsByProjectAndUser(Project project, User user);
    List<ProjectMember> findByProject(Project project);
    List<ProjectMember> findByUser(User user);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    List<ProjectMember> findByUserAndFinishedAtIsNotNull(User user);
    List<ProjectMember> findByProjectAndFinishedAtIsNull(Project project);
}