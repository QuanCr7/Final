package com.example.website.service;

import com.example.website.entity.OrderEntity;
import com.example.website.request.OrderDetailRequest;
import com.example.website.request.OrderRequest;
import com.example.website.response.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse getById(int id);
    List<OrderEntity> getByUserId(int userId);

    OrderResponse create(OrderRequest request, List<OrderDetailRequest> orderDetailRequests);

//    OrderEntity process(int id);
//    OrderEntity cancel(int id);
}
