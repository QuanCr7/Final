package com.example.website.controller.API;

import com.example.website.configuration.JwtTokenProvider;
import com.example.website.request.UserLoginRequest;
import com.example.website.response.UserLoginResponse;
import com.example.website.request.UserRegisterRequest;
import com.example.website.response.BaseResponse;
import com.example.website.response.UserResponse;
import com.example.website.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController extends BaseController {
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(
            summary = "Đăng nhập hệ thống",
            description = "API dùng để đăng nhập vào hệ thống bằng username và password",
            tags = {"Tài Khoản"}
    )
    @PostMapping("/login")
    public ResponseEntity<BaseResponse<UserLoginResponse>> signIn(
            @RequestBody UserLoginRequest request, HttpServletResponse response) {
            UserLoginResponse loginResponse = authService.login(request);

        // Set refresh token vào cookie HttpOnly
        Cookie refreshTokenCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Tạm thời false để test trên localhost (không HTTPS)
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 ngày
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshTokenCookie);

        return returnSuccess(loginResponse);
    }

    @Operation(
            summary = "Làm mới Access Token",
            description = "API dùng để lấy access token mới bằng refresh token",
            tags = {"Tài Khoản"}
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<BaseResponse<UserLoginResponse>> refreshToken(
            HttpServletRequest request, HttpServletResponse response) {
        // Lấy refresh token từ cookie
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null) {
            throw new RuntimeException("Refresh token not found in cookie");
        }

        UserLoginResponse refreshResponse = authService.refreshToken(refreshToken);

        // Set refresh token mới vào cookie HttpOnly
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(false); // Tạm thời false để test trên localhost
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7 ngày
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshTokenCookie);

        return returnSuccess(refreshResponse);
    }

    @Operation(
            summary = "Đăng ký tài khoản mới",
            description = "API dùng để đăng ký tài khoản người dùng mới với các thông tin cơ bản",
            tags = {"Tài Khoản"}
    )
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<UserResponse>> addUser(@ModelAttribute UserRegisterRequest request) {
        return returnSuccess(authService.registerUser(request));
    }

    @Operation(
            summary = "Yêu cầu đặt lại mật khẩu",
            description = "API gửi email chứa liên kết đặt lại mật khẩu khi người dùng quên mật khẩu",
            tags = {"Tài Khoản"}
    )
    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponse<String>> forgotPassword(@RequestParam String email) {
        authService.initiatePasswordReset(email);
        return returnSuccess("Đã gửi email hướng dẫn đặt lại mật khẩu");
    }

    @Operation(
            summary = "Đặt lại mật khẩu mới",
            description = "API dùng để đặt lại mật khẩu mới bằng token nhận được từ email",
            tags = {"Tài Khoản"}
    )
    @PostMapping("/reset-password")
    public ResponseEntity<BaseResponse<Boolean>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        return returnSuccess(authService.resetPassword(token, newPassword));
    }

    @Operation(
            summary = "Đăng xuất",
            description = "Đăng xuất người dùng và vô hiệu hóa token hiện tại",
            tags = {"Tài khoản"}
    )
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<String>> logout(HttpServletRequest request, HttpServletResponse response) {
            // Xóa refresh token cookie
            Cookie cookie = new Cookie("refreshToken", null);
            cookie.setHttpOnly(true);
//            cookie.setSecure(true); // Chỉ gửi qua HTTPS trong production
        cookie.setSecure(false); // Tạm thời false để test trên localhost
            cookie.setPath("/");
            cookie.setMaxAge(0); // Xóa cookie
            cookie.setAttribute("SameSite", "Strict");
            response.addCookie(cookie);

            // Vô hiệu hóa token
            String token = jwtTokenProvider.getTokenFromRequest(request);
            if (token != null) {
                authService.logout(token);
            }
            return returnSuccess("Đăng xuất thành công");
    }

//    @Operation(
//            summary = "Đăng xuất",
//            description = "Đăng xuất người dùng và vô hiệu hóa token hiện tại",
//            tags = {"Tài khoản"}
//    )
//    @PostMapping("/logout")
//    public ResponseEntity<BaseResponse<String>> logout(HttpServletRequest request) {
//        authService.logout(jwtTokenProvider.getTokenFromRequest(request));
//        return returnSuccess("Đăng xuất thành công");
//    }
}