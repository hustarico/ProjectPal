package com._4.ProjectPal.user;

import com._4.ProjectPal.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping("/me")
    public UserProfileResponse getCurrentUserProfile(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return userService.getCurrentUserProfile(user.getEmail());
    }

    @GetMapping("/{id}")
    public UserProfileResponse getProfile(@PathVariable Integer id) {
        return userService.getProfile(id);
    }

    @RequestMapping(value = "/me", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public UserProfileResponse updateProfile(Authentication authentication,
                                               @RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser(authentication);
        return userService.updateProfile(user.getId(), request);
    }

    @RequestMapping(value = "/me/password", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public void changePassword(Authentication authentication,
                                @RequestBody ChangePasswordRequest request) {
        User user = getCurrentUser(authentication);
        userService.changePassword(user.getId(), request);
    }

    @PostMapping("/me/profile-picture")
    public UserProfileResponse uploadProfilePicture(Authentication authentication,
                                                     @RequestParam MultipartFile file) {
        User user = getCurrentUser(authentication);
        return userService.uploadProfilePicture(user.getId(), file);
    }

    @PostMapping("/me/skills")
    public UserSkillResponse addSkill(Authentication authentication,
                                      @RequestBody AddUserSkillRequest request) {
        User user = getCurrentUser(authentication);
        return userService.addSkill(user.getId(), request);
    }

    @DeleteMapping("/me/skills/{skillId}")
    public void removeSkill(Authentication authentication,
                            @PathVariable Integer skillId) {
        User user = getCurrentUser(authentication);
        userService.removeSkill(user.getId(), skillId);
    }

    @GetMapping("/me/skills")
    public List<UserSkillResponse> getSkills(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return userService.getSkills(user.getId());
    }
}