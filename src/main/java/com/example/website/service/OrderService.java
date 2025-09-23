package com.example.website.service;

import com.example.website.dto.OrderDTO;
import com.example.website.dto.OrderDetailDTO;
import com.example.website.entity.OrderEntity;

import java.util.List;

public interface OrderService {
    OrderEntity getById(int id);
    List<OrderEntity> getByUserId(int userId);

    OrderEntity create(OrderDTO orderDTO, List<OrderDetailDTO> orderDetailDTOList);

    OrderEntity process(int id);
    OrderEntity cancel(int id);
}
