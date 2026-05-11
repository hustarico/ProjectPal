package com._4.ProjectPal.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import com._4.ProjectPal.skill.Skill;

public interface UserSkillRepository extends JpaRepository<UserSkill, Integer> {
    boolean existsByUserAndSkill(User user, Skill skill);
    Optional<UserSkill> findByUserAndSkillId(User user, Integer skillId);
    List<UserSkill> findByUser(User user);
}