package com._4.ProjectPal.user;

import com._4.ProjectPal.skill.Skill;
import com._4.ProjectPal.skill.SkillRepository;
import com._4.ProjectPal.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserProfileResponse getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        return toProfileResponse(user);
    }

    @Override
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
        return toProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    @Override
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserProfileResponse uploadProfilePicture(Integer userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        String uploadDir = "./uploads/profile-pictures";
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = userId + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        try {
            Files.write(filePath, file.getBytes());
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Failed to upload file");
        }

        user.setProfilePictureUrl("/uploads/profile-pictures/" + fileName);
        User saved = userRepository.save(user);
        return toProfileResponse(saved);
    }

    @Override
    public UserSkillResponse addSkill(Integer userId, AddUserSkillRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Skill not found"));

        if (userSkillRepository.existsByUserAndSkill(user, skill)) {
            throw new ResponseStatusException(CONFLICT, "User already has this skill");
        }

        UserSkill userSkill = UserSkill.builder()
                .user(user)
                .skill(skill)
                .experienceLevel(request.getExperienceLevel())
                .build();

        UserSkill saved = userSkillRepository.save(userSkill);
        return toUserSkillResponse(saved);
    }

    @Override
    public void removeSkill(Integer userId, Integer skillId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        UserSkill userSkill = userSkillRepository.findByUserAndSkillId(user, skillId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User skill not found"));

        userSkillRepository.delete(userSkill);
    }

    @Override
    public List<UserSkillResponse> getSkills(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        return userSkillRepository.findByUser(user).stream()
                .map(this::toUserSkillResponse)
                .collect(Collectors.toList());
    }

    private UserProfileResponse toProfileResponse(User user) {
    List<UserSkillResponse> skills = user.getUserSkills().stream()
            .map(this::toUserSkillResponse)
            .collect(Collectors.toList());
    return UserProfileResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .bio(user.getBio())
            .profilePictureUrl(user.getProfilePictureUrl())
            .isActive(user.getIsActive())
            .role(user.getRole())
            .skills(skills)
            .build();
}


    private UserSkillResponse toUserSkillResponse(UserSkill userSkill) {
        return UserSkillResponse.builder()
                .id(userSkill.getId())
                .userId(userSkill.getUser().getId())
                .skillId(userSkill.getSkill().getId())
                .skillName(userSkill.getSkill().getName())
                .experienceLevel(userSkill.getExperienceLevel())
                .build();
    }
}