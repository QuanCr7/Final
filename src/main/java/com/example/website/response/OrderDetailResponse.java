package com.example.website.response;

import lombok.*;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private int id;
    private String book;
    private BigDecimal price;
    private int quantity;
}
