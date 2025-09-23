package com.example.website.service;

import com.example.website.request.UserLoginRequest;
import com.example.website.request.UserRegisterRequest;
import com.example.website.response.UserLoginResponse;
import com.example.website.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    UserResponse registerUser(UserRegisterRequest request);
    UserLoginResponse login(UserLoginRequest request);
    void initiatePasswordReset(String email);
    boolean resetPassword(String token, String newPassword);
    void logout(String token);

    String saveImage(MultipartFile imageFile);
    UserLoginResponse refreshToken(String refreshToken);
}
