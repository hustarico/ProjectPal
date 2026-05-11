package com._4.ProjectPal.rating;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.project.Project;

public interface RatingRepository extends JpaRepository<Rating, Integer> {
    boolean existsByRaterAndRateeAndProject(User rater, User ratee, Project project);
    List<Rating> findByRatee(User ratee);
}