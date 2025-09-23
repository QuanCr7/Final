package com.example.website.service.impl;

import com.example.website.dto.OrderDetailDTO;
import com.example.website.entity.OrderDetailEntity;
import com.example.website.repository.OrderDetailRepository;
import com.example.website.service.OrderDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderDetailServiceImpl implements OrderDetailService {
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<OrderDetailEntity> addBookToOrder(OrderDetailDTO orderDetailDTO) {
//        OrderDetailEntity orderDetail = OrderDetailEntity.builder()
//                .order(orderDetailDTO.getBook_Id())
//                .book(orderDetailDTO.getBook_Id())
//                .quantity(orderDetailDTO.getQuantity())
//                .build();
//
//        return orderDetailRepository.save(orderDetail);
        return List.of();
    }

    @Override
    public List<OrderDetailEntity> RemoveBookFromOrder(OrderDetailDTO orderDetailDTO) {
        return List.of();
    }
}
