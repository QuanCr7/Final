package com.example.website.service.impl;

import com.example.website.configuration.CustomUserDetails;
import com.example.website.configuration.JwtTokenProvider;
import com.example.website.entity.RoleEntity;
import com.example.website.entity.UserEntity;
import com.example.website.repository.RoleRepository;
import com.example.website.repository.UserRepository;
import com.example.website.request.UserLoginRequest;
import com.example.website.request.UserRegisterRequest;
import com.example.website.response.UserLoginResponse;
import com.example.website.response.UserResponse;
import com.example.website.service.AuthService;
import com.example.website.utils.RoleEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${jwt.blacklist-duration:86400000}")
    private long blacklistDuration;
    private final Map<String, Long> tokenBlacklist = new ConcurrentHashMap<>();

    private final Path rootLocation = Paths.get("src/main/resources/static/images/user");

    private final ConcurrentHashMap<String, Long> tokenExpiryMap = new ConcurrentHashMap<>();

    @Override
    public UserResponse registerUser(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username Already Exists");
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Set<RoleEntity> defaultRoles = new HashSet<>();
        RoleEntity userRole = roleRepository.findByRole(RoleEnum.USER.name()).orElseThrow(()-> new RuntimeException("Role Not Found"));
        defaultRoles.add(userRole);

        String imageUrl = saveImage(request.getImage());

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .dateCreate(LocalDate.now())
                .image(imageUrl)
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .description(request.getDescription())
                .roles(defaultRoles)
                .build();

        UserEntity savedUser = userRepository.save(user);
        return response(savedUser);
    }

    @Override
    public UserLoginResponse login(UserLoginRequest request) {
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            String accessToken = jwtTokenProvider.generateAccessToken(userDetails);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
            Date accessTokenExpiry = jwtTokenProvider.extractExpiration(accessToken);
            Date refreshTokenExpiry = jwtTokenProvider.extractExpiration(refreshToken);

            UserEntity user = userDetails.getUserEntity(); // Hoặc findByUsername nếu cần
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            // Lấy thông tin user đầy đủ
//            UserEntity user = userRepository.findByUsername(request.getUsername())
//                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Chuyển đổi sang UserResponse
//            UserResponse userInfo = response(user);

            return UserLoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .accessTokenExpiryDate(accessTokenExpiry)
                    .refreshTokenExpiryDate(refreshTokenExpiry)
//                    .userInfo(userInfo)
                    .build();
        } catch(AuthenticationException e) {
            throw new RuntimeException("Wrong username or password");
        }
    }

    @Override
    public void initiatePasswordReset(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user != null) {
            String token = UUID.randomUUID().toString();
            user.setPasswordToken(token);
            userRepository.save(user);

            long time = System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(15);
            tokenExpiryMap.put(token, time);

            String resetLink = "http://localhost:8080/auth/reset-password?token="+token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Password Reset Request");
            message.setText("To reset your password, click the following link: " + resetLink);
            mailSender.send(message);
        }
    }

    @Override
    public boolean resetPassword(String token, String newPassword) {
        Long expiryTime = tokenExpiryMap.get(token);
        if (expiryTime == null || System.currentTimeMillis() > expiryTime) {
            return false;  // Token không tồn tại hoặc đã hết hạn
        }
        UserEntity user = userRepository.findByPasswordToken(token);
        if (user != null) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordToken(null);
            userRepository.save(user);
            tokenExpiryMap.remove(token);
            return true;
        }
        return false;
    }

    @Override
    public String saveImage(MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String fileName = imageFile.getOriginalFilename();
                Path filePath = rootLocation.resolve(fileName);

                // Kiểm tra và tạo thư mục nếu chưa tồn tại
                Files.createDirectories(filePath.getParent());

                // Lưu file
                Files.write(filePath, imageFile.getBytes());

                return fileName;
            } catch (IOException e) {
//                e.printStackTrace();
//                throw new RuntimeException("Failed to save image file: " + e.getMessage(), e);
                log.error("Failed to save image file: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to save image file", e);
            }
        }
        return null;
    }

    public UserResponse response(UserEntity response){
        return UserResponse.builder()
                .id(response.getId())
                .username(response.getUsername())
                .fullName(response.getFullName())
                .dateOfBirth(response.getDateOfBirth())
                .dateCreate(response.getDateCreate())
                .imageUrl(response.getImage())
                .email(response.getEmail())
                .phone(response.getPhone())
                .address(response.getAddress())
                .description(response.getDescription())
                .build();
    }

    @Override
    public UserLoginResponse refreshToken(String refreshToken) {
        // Validate JWT signature và không hết hạn
        if (!jwtTokenProvider.validateToken(refreshToken) || jwtTokenProvider.isTokenExpired(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Kiểm tra blacklist
        if (isBlacklisted(refreshToken)) {
            throw new RuntimeException("Refresh token is blacklisted");
        }

        String username = jwtTokenProvider.extractUsername(refreshToken);
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Kiểm tra refresh token khớp với DB
        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);

        // Generate new access và new refresh (rotation để bảo mật)
        String newAccessToken = jwtTokenProvider.generateAccessToken(userDetails);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
        Date accessTokenExpiry = jwtTokenProvider.extractExpiration(newAccessToken);
        Date refreshTokenExpiry = jwtTokenProvider.extractExpiration(newRefreshToken);

        // Update new refresh vào DB và blacklist old refresh (tùy chọn, để tránh reuse)
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);
        addToBlacklist(refreshToken, blacklistDuration); // Blacklist old refresh

        return UserLoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .accessTokenExpiryDate(accessTokenExpiry)
                .refreshTokenExpiryDate(refreshTokenExpiry)
                .build();
    }

    @Override
    public void logout(String token) { // token là access token
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }

        String username = jwtTokenProvider.extractUsername(token);
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke refresh token bằng cách set null trong DB
        user.setRefreshToken(null);
        userRepository.save(user);

        // Blacklist access token
        Date expiration = jwtTokenProvider.extractExpiration(token);
        long remainingTime = expiration.getTime() - System.currentTimeMillis();
        long actualTtl = Math.max(remainingTime, 300000); // Tối thiểu 5 phút
        addToBlacklist(token, Math.min(actualTtl, blacklistDuration));

        SecurityContextHolder.clearContext();
    }

    public void addToBlacklist(String token, long ttlMillis) {
        long expiryTime = System.currentTimeMillis() + ttlMillis;
        tokenBlacklist.put(token, expiryTime);
        log.debug("Added token to blacklist, expires at: {}", new Date(expiryTime));
    }

    public boolean isBlacklisted(String token) {
        Long expiryTime = tokenBlacklist.get(token);
        if (expiryTime == null) {
            return false;
        }

        // Tự động xóa nếu đã hết hạn
        if (System.currentTimeMillis() > expiryTime) {
            tokenBlacklist.remove(token);
            return false;
        }

        return true;
    }

    // Phương thức dọn dẹp định kỳ (tùy chọn)
    @Scheduled(fixedRate = 3600000) // Mỗi giờ chạy 1 lần
    public void cleanupExpiredTokens() {
        long now = System.currentTimeMillis();
        tokenBlacklist.entrySet().removeIf(entry -> entry.getValue() < now);
        log.info("Cleaned up expired blacklisted tokens");
    }
}
