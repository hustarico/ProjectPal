package com._4.ProjectPal.rating;

import com._4.ProjectPal.project.Project;
import com._4.ProjectPal.project.ProjectMemberRepository;
import com._4.ProjectPal.project.ProjectRepository;
import com._4.ProjectPal.project.ProjectStatus;
import com._4.ProjectPal.rating.dto.CreateRatingRequest;
import com._4.ProjectPal.rating.dto.RatingResponse;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Override
    public RatingResponse submitRating(CreateRatingRequest request, User currentUser) {
        Project project = projectRepository.findById(request.getProjectId())
                .filter(p -> !p.getIsDeleted())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

        User ratee = userRepository.findById(request.getRateeId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Ratee not found"));

        if (project.getStatus() != ProjectStatus.COMPLETED) {
            throw new ResponseStatusException(BAD_REQUEST, "Can only rate users on completed projects");
        }

        if (currentUser.getId().equals(ratee.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "You cannot rate yourself");
        }

        if (!projectMemberRepository.existsByProjectAndUser(project, currentUser)) {
            throw new ResponseStatusException(FORBIDDEN, "You are not a member of this project");
        }

        if (!projectMemberRepository.existsByProjectAndUser(project, ratee)) {
            throw new ResponseStatusException(FORBIDDEN, "Ratee is not a member of this project");
        }

        if (ratingRepository.existsByRaterAndRateeAndProject(currentUser, ratee, project)) {
            throw new ResponseStatusException(BAD_REQUEST, "You have already rated this user for this project");
        }

        Rating rating = Rating.builder()
                .rater(currentUser)
                .ratee(ratee)
                .project(project)
                .score(request.getScore())
                .build();

        Rating saved = ratingRepository.save(rating);
        return toResponse(saved);
    }

    @Override
    public List<RatingResponse> getRatingsForUser(Integer userId) {
        User ratee = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        return ratingRepository.findByRatee(ratee)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RatingResponse toResponse(Rating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .raterId(rating.getRater().getId())
                .raterName(rating.getRater().getEmail())
                .rateeId(rating.getRatee().getId())
                .rateeName(rating.getRatee().getEmail())
                .projectId(rating.getProject().getId())
                .score(rating.getScore())
                .build();
    }
}