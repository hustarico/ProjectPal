package com._4.ProjectPal.admin.dto;

import com._4.ProjectPal.project.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectResponse {
    private Integer id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Integer ownerId;
    private String ownerName;
    private Boolean isDeleted;
    private int memberCount;
}
