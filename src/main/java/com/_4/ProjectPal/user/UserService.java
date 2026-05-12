package com._4.ProjectPal.user;

import com._4.ProjectPal.user.dto.AddUserSkillRequest;
import com._4.ProjectPal.user.dto.ChangePasswordRequest;
import com._4.ProjectPal.user.dto.UpdateProfileRequest;
import com._4.ProjectPal.user.dto.UserProfileResponse;
import com._4.ProjectPal.user.dto.UserSkillResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserProfileResponse getProfile(Integer userId);
    UserProfileResponse getCurrentUserProfile(String email);
    UserProfileResponse updateProfile(Integer userId, UpdateProfileRequest request);
    void changePassword(Integer userId, ChangePasswordRequest request);
    UserProfileResponse uploadProfilePicture(Integer userId, MultipartFile file);
    UserSkillResponse addSkill(Integer userId, AddUserSkillRequest request);
    void removeSkill(Integer userId, Integer skillId);
    List<UserSkillResponse> getSkills(Integer userId);
}