package com.example.website.service;

import com.example.website.dto.OrderDetailDTO;
import com.example.website.entity.OrderDetailEntity;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailEntity> addBookToOrder(OrderDetailDTO orderDetailDTO);
    List<OrderDetailEntity> RemoveBookFromOrder(OrderDetailDTO orderDetailDTO);
}
