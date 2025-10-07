package com.example.website.response;

import com.example.website.entity.CategoryEntity;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    private int id;
    private String title;
    private String author;
    private BigDecimal price;
    private String description;
    private LocalDate post_date;
    private String publisher;
    private List<String> images;
    private List<CategoryEntity> categories;
}
