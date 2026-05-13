package com._4.ProjectPal.rating.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRatingRequest {

    private Integer rateeId;
    private Integer projectId;
    @Min(1)
    @Max(5)
    private Integer score;
}