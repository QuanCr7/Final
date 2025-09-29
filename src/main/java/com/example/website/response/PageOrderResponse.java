package com.example.website.response;

import lombok.*;

import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PageOrderResponse {
    private int currentPage;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private List<OrderResponse> orders;
}
