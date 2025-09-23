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
    private final BookServiceImpl bookService;

    @GetMapping("/detail-user")
    public String getUserDetail(@RequestParam int id, Model model) {
        try {
            UserResponse userResponse = userService.getUser(id);
            model.addAttribute("user", userResponse);
            return "admin/account-detail"; // Trả về template cho trang chi tiết tài khoản
        } catch (Exception e) {
            model.addAttribute("error", "Không tìm thấy người dùng với ID: " + id);
            return "admin/account-detail"; // Vẫn trả về template nhưng có thông báo lỗi
        }
    }

    @GetMapping("/book-detail")
    public String getBookDetail(@RequestParam int id, Model model) {
        try {
            // Lấy thông tin sách từ service
            BookEntity book = bookService.getBook(id);
            model.addAttribute("book", book);
            return "admin/book-detail"; // Trả về template cho trang chi tiết sách
        } catch (Exception e) {
            model.addAttribute("error", "Không tìm thấy sách với ID: " + id);
            return "admin/book-detail"; // Vẫn trả về template nhưng có thông báo lỗi
        }
    }

    @GetMapping("/tet")
    public String tet(){
        return "guest/tet";
    }

//    @GetMapping("/book-detail")
//    public String detail(@RequestParam int id, Model model) {
//        model.addAttribute("bookId", id);
//        return "admin/book-detail";
//    }
}
