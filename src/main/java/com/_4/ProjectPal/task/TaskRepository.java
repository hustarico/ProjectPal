package com._4.ProjectPal.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByProjectIdAndIsDeletedFalse(Integer projectId);
}