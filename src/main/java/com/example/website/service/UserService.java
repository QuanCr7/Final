package com.example.website.service;

import com.example.website.entity.UserEntity;
import com.example.website.request.UserRegisterRequest;
import com.example.website.response.PageUserResponse;
import com.example.website.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface UserService {
    PageUserResponse findAll(Integer page);

    UserResponse getUserByUsername(String username);
    UserResponse getCurrentUser();
    UserResponse getUser(int id);
    UserEntity getUserByid(int id);

    PageUserResponse findByCondition(Integer page,String name,String email,Integer id,String phone);

    UserResponse updateUser(int id,UserRegisterRequest request);
    void deleteUser(int id);

    List<String> saveImages(MultipartFile[] imageFiles);
    String saveImage(MultipartFile imageFile);
}
