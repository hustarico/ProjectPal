package com._4.ProjectPal.rating;

import com._4.ProjectPal.rating.dto.CreateRatingRequest;
import com._4.ProjectPal.rating.dto.RatingResponse;
import com._4.ProjectPal.user.User;

import java.util.List;

public interface RatingService {
    RatingResponse submitRating(CreateRatingRequest request, User currentUser);
    List<RatingResponse> getRatingsForUser(Integer userId);
}