package com.example.website.response;

import com.example.website.entity.BookEntity;
import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PageBookResponse {
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private List<BookResponse> books;
}
