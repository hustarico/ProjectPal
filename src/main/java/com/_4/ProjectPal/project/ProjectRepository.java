package com._4.ProjectPal.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
    List<Project> findByOwnerIdAndIsDeletedFalse(Integer ownerId);
    List<Project> findByStatusAndIsDeletedFalse(ProjectStatus status);
    List<Project> findByNameContainingIgnoreCaseAndStatusAndIsDeletedFalse(String name, ProjectStatus status);
}