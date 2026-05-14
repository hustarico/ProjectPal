package com._4.ProjectPal.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PastProjectResponse {
    private Integer id;
    private String name;
    private String status;
    private String role;
}
