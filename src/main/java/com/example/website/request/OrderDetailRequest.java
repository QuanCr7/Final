package com.example.website.request;

import lombok.*;

import java.math.BigDecimal;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailRequest {
    private int orderId;
    private int bookId;
    private int quantity;
    private BigDecimal price;
}
