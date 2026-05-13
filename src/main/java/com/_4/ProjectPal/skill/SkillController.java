package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;
import com._4.ProjectPal.user.Role;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
import com._4.ProjectPal.user.UserService;
import com._4.ProjectPal.user.dto.AddUserSkillRequest;
import com._4.ProjectPal.user.dto.UserSkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;
    private final UserService userService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @GetMapping
    public List<SkillResponse> getAllSkills() {
        return skillService.getAllSkills();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse createSkill(@Validated @RequestBody CreateSkillRequest request,
                                      Authentication authentication) {
        User currentUser = currentUser(authentication);
        if (currentUser.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can create skills");
        }
        return skillService.createSkill(request);
    }

    @PostMapping("/user")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSkillResponse addSkillToUser(@Validated @RequestBody AddUserSkillRequest request,
                                              Authentication authentication) {
        User currentUser = currentUser(authentication);
        return userService.addSkill(currentUser.getId(), request);
    }

    @DeleteMapping("/user/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSkillFromUser(@PathVariable Integer skillId,
                                      Authentication authentication) {
        User currentUser = currentUser(authentication);
        userService.removeSkill(currentUser.getId(), skillId);
    }

    @GetMapping("/user/{userId}")
    public List<UserSkillResponse> getUserSkills(@PathVariable Integer userId) {
        return userService.getSkills(userId);
    }
}