package com.example.website.controller;

import com.example.website.entity.BookEntity;
import com.example.website.response.UserResponse;
import com.example.website.service.impl.BookServiceImpl;
import com.example.website.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class Admin {

    private final UserServiceImpl userService;

    @GetMapping("/detail-user")
    public String getUserDetail(@RequestParam int id, Model model) {
        model.addAttribute("user", id);
        return "admin/account-detail";
    }

    @GetMapping("/book-detail")
    public String getBookDetail(@RequestParam int id, Model model) {
        model.addAttribute("book", id);
        return "admin/book-detail";
    }

    @GetMapping("/tet")
    public String tet(){
        return "guest/tet";
    }
}
