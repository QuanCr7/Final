package com.example.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class Account {

    @GetMapping("me")
    public String getUserProfile() {
        return "auth/profile";
    }
}