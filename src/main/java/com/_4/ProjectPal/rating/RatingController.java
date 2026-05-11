package com._4.ProjectPal.rating;

import com._4.ProjectPal.rating.dto.CreateRatingRequest;
import com._4.ProjectPal.rating.dto.RatingResponse;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RatingResponse submitRating(@Validated @RequestBody CreateRatingRequest request,
                                         Authentication authentication) {
        return ratingService.submitRating(request, currentUser(authentication));
    }

    @GetMapping("/user/{userId}")
    public List<RatingResponse> getRatingsForUser(@PathVariable Integer userId) {
        return ratingService.getRatingsForUser(userId);
    }
}