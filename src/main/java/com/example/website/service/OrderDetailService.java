package com.example.website.service;

import com.example.website.request.OrderDetailRequest;
import com.example.website.entity.OrderDetailEntity;
import com.example.website.response.OrderDetailResponse;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailResponse> add(OrderDetailRequest orderDetailRequest);
    List<OrderDetailResponse> getOrderDetailByOrderId(int orderId);
    List<OrderDetailEntity> RemoveBookFromOrder(OrderDetailRequest orderDetailRequest);
}
