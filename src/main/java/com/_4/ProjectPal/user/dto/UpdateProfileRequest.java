package com._4.ProjectPal.user.dto;

import com._4.ProjectPal.user.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private AvailabilityStatus availabilityStatus;
}