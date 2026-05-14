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

    private Integer userId;
    private String email;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;
    private MemberRole memberRole;
}
