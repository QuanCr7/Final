package com.example.website.response;

import com.example.website.utils.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private int id;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private OrderStatus status;
    private int userId;
    private List<OrderDetailResponse> orderDetails;
}
