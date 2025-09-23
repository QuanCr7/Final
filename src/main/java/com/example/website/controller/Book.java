package com.example.website.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class Book {
    @GetMapping("/")
    public String home() {
        return "guest/home";
    }

    @GetMapping("/about")
    public String about() {
        return "guest/about";
    }

    @GetMapping("/search")
    public String search() {
        return "guest/search";
    }

    @GetMapping("/update")
    public String update(@RequestParam int id, Model model) {
        model.addAttribute("bookId", id);
        return "admin/updatebook";
    }

    @GetMapping("/add")
    public String create() {
        return "admin/addbook";
    }

    @GetMapping("/detail")
    public String detail(@RequestParam int id, Model model) {
        model.addAttribute("bookId", id);
        return "guest/detailbook";
    }
}
