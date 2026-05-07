package com._4.ProjectPal.project.dto;

import com._4.ProjectPal.project.MemberRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberResponse {

    private Integer id;
    private Integer projectId;
    private Integer userId;
    private String userName;
    private MemberRole memberRole;
}