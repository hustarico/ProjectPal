package com._4.ProjectPal.project.dto;

import com._4.ProjectPal.project.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectRequest {

    private String name;
    private String description;
    private ProjectStatus status;
}