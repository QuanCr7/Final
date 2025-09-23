package com.example.website.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    private String title;
    private String author;
    private double price;
    private String description;
    private LocalDate post_date;
    private String publisher;
    private List<String> images;
    private Set<Integer> categories;
}
