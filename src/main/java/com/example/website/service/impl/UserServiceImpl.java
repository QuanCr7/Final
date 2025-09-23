package com.example.website.service.impl;

import com.example.website.entity.UserEntity;
import com.example.website.repository.UserRepository;
import com.example.website.request.UserRegisterRequest;
import com.example.website.response.PageUserResponse;
import com.example.website.response.UserResponse;
import com.example.website.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    private final Path rootLocation = Paths.get("src/main/resources/static/images/user");

    private static final int size = 10;

    private final ConcurrentHashMap<String, Long> tokenExpiryMap = new ConcurrentHashMap<>();

    @Override
    public PageUserResponse findAll(Integer page) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<UserEntity> entityPage = userRepository.findAll(pageable);
        Page<UserResponse> responsePage = entityPage.map(this::response);

        return PageUserResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .users(responsePage.getContent())
                .build();
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return response(userRepository.findByUsername(username).orElseThrow(()-> new RuntimeException("User Not Found With Username: " + username)));
    }

    @Override
    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return response(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User Not Found With Username: " + username)));
    }

    @Override
    public UserResponse getUser(int id) {
        return response(userRepository.findById(id).orElseThrow(()-> new RuntimeException("User Not Found")));
    }

    @Override
    public UserEntity getUserByid(int id) {
        return userRepository.findById(id).orElseThrow(()-> new RuntimeException("User Not Found"));
    }

    @Override
    public PageUserResponse findByCondition(Integer page,String name,String email,Integer id,String phone) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<UserEntity> entityPage = userRepository.searchByCondition(pageable,name,email,id,phone);
        Page<UserResponse> responsePage = entityPage.map(this::response);

        return PageUserResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .users(responsePage.getContent())
                .build();
    }

    @Override
    public UserResponse updateUser(int id, UserRegisterRequest request) {
        UserEntity user = getUserByid(id);

        user.setUsername(request.getUsername());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setDateOfBirth(request.getDateOfBirth());
        String imageUrl = saveImage(request.getImage());
        if (imageUrl!=null && !imageUrl.isEmpty()) {
            user.setImage(imageUrl);
        } else {
            user.setImage(user.getImage());
        }
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDescription(request.getDescription());
        return response(userRepository.save(user));
    }

    @Override
    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<String> saveImages(MultipartFile[] imageFiles) {
        List<String> imageNames = new ArrayList<>();
        for (MultipartFile imageFile : imageFiles) {
            String fileName = saveImage(imageFile);
            if (fileName != null) {
                imageNames.add(fileName);
            }
        }
        return imageNames;
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

    public List<UserResponse> responses(List<UserEntity> responses) {
        return responses.stream()
                .map(this::response) // Sử dụng phương thức response hiện có cho từng UserEntity
                .toList();
    }
}