package com._4.ProjectPal.skill;

import com._4.ProjectPal.skill.dto.CreateSkillRequest;
import com._4.ProjectPal.skill.dto.SkillResponse;
import com._4.ProjectPal.user.User;
import com._4.ProjectPal.user.UserRepository;
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
        return skillService.createSkill(request);
    }

    @PostMapping("/user")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSkillResponse addSkillToUser(@Validated @RequestBody AddUserSkillRequest request,
                                              Authentication authentication) {
        return skillService.addSkillToUser(request, currentUser(authentication));
    }

    @DeleteMapping("/user/{skillId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSkillFromUser(@PathVariable Integer skillId,
                                     Authentication authentication) {
        skillService.removeSkillFromUser(skillId, currentUser(authentication));
    }

    @GetMapping("/user/{userId}")
    public List<UserSkillResponse> getUserSkills(@PathVariable Integer userId) {
        return skillService.getUserSkills(userId);
    }
}