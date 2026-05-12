package com._4.ProjectPal.search;

import java.util.List;

public record SearchUserResult(
    Integer id,
    String firstName,
    String lastName,
    String email,
    String bio,
    String profilePictureUrl,
    List<SkillEntry> skills
) {
    public record SkillEntry(String skillName, String experienceLevel) {}
}