package com._4.ProjectPal.rating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {

    private Integer id;
    private Integer raterId;
    private String raterName;
    private Integer rateeId;
    private String rateeName;
    private Integer projectId;
    private Integer score;
}