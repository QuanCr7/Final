package com.example.website.service.impl;

import com.example.website.dto.OrderDTO;
import com.example.website.dto.OrderDetailDTO;
import com.example.website.entity.OrderEntity;
import com.example.website.repository.BookRepository;
import com.example.website.repository.OrderDetailRepository;
import com.example.website.repository.OrderRepository;
import com.example.website.repository.UserRepository;
import com.example.website.service.OrderService;
import com.example.website.utils.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    public OrderEntity getById(int id) {
        return orderRepository.findById(id).orElseThrow(()-> new RuntimeException("Order Not Found"));
    }

    @Override
    public List<OrderEntity> getByUserId(int userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User Not Found");
        }

        List<OrderEntity> orders = orderRepository.findByUserId(userId);
        if (orders.isEmpty()) {
            throw new RuntimeException("Order Not Found");
        }
        return orders;
    }

    @Override
    public OrderEntity create(OrderDTO orderDTO, List<OrderDetailDTO> orderDetailDTOList) {
        return null;
    }

    @Override
    public OrderEntity process(int id) {
        OrderEntity order = getById(id);
//        order.setStatus("PROCESSING");
        order.setStatus(OrderStatus.PROCESSING);
        return orderRepository.save(order);
    }

    @Override
    public OrderEntity cancel(int id) {
        OrderEntity order = getById(id);
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

}
