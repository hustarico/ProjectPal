package com._4.ProjectPal.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {

    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePictureUrl;
}