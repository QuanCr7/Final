package com.example.website.response;

import lombok.*;

import java.util.Date;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private String accessToken;
    private Date accessTokenExpiryDate;  // Thời gian hết hạn access token
    private String refreshToken;
    private Date refreshTokenExpiryDate; // Thời gian hết hạn refresh token
//    private UserResponse userInfo;
}
