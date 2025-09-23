package com.example.website.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/auth")
@Controller
public class Auth {
    @GetMapping("/login")
    public String login() {
        return "/auth/login";
    }

    @GetMapping("/register")
    public String register() {
        return "/auth/register";
    }

    @GetMapping("/admin")
    public String admin(){
        return "/admin/manage";
    }

    @GetMapping("/pay")
    public String pay(){
        return "/auth/pay";
    }
}
