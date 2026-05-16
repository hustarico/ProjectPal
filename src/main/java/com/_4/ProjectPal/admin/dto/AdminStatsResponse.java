package com._4.ProjectPal.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long blockedUsers;
    private long adminUsers;
    private long totalProjects;
    private long activeProjects;
    private long endedProjects;
    private long totalSkills;
}
