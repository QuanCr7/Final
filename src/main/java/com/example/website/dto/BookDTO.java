package com.example.website.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private String title;
    private String author;
    private BigDecimal price;
    private String description;
    private String publisher;
    private MultipartFile[] images = new MultipartFile[0];
    private Set<Integer> categories = new HashSet<>();
}
