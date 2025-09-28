package com.example.website.service.impl;

import com.example.website.entity.BookEntity;
import com.example.website.entity.OrderEntity;
import com.example.website.repository.BookRepository;
import com.example.website.repository.OrderRepository;
import com.example.website.request.OrderDetailRequest;
import com.example.website.entity.OrderDetailEntity;
import com.example.website.repository.OrderDetailRepository;
import com.example.website.response.OrderDetailResponse;
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
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    @Override
    public List<OrderDetailResponse> add(OrderDetailRequest orderDetailRequest) {

        OrderEntity order = orderRepository.findById(orderDetailRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderDetailRequest.getOrderId()));

        BookEntity book = bookRepository.findById(orderDetailRequest.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + orderDetailRequest.getBookId()));

        OrderDetailEntity orderDetail = OrderDetailEntity.builder()
                .order(order)
                .book(book)
                .price(book.getPrice())
                .quantity(orderDetailRequest.getQuantity())
                .build();

        orderDetailRepository.save(orderDetail);
        return getOrderDetailByOrderId(orderDetailRequest.getOrderId());
    }

    @Override
    public List<OrderDetailResponse> getOrderDetailByOrderId(int orderId) {
        return responses(orderDetailRepository.findByOrderId(orderId));
    }

    @Override
    public List<OrderDetailEntity> RemoveBookFromOrder(OrderDetailRequest orderDetailRequest) {
        return List.of();
    }

    public OrderDetailResponse response(OrderDetailEntity orderDetail) {
        return OrderDetailResponse.builder()
                .id(orderDetail.getId())
                .price(orderDetail.getPrice())
                .quantity(orderDetail.getQuantity())
                .book(orderDetail.getBook().getTitle())
                .build();
    }

    public List<OrderDetailResponse> responses(List<OrderDetailEntity> orderDetails) {
        return orderDetails.stream()
                .map(this::response) // Sử dụng phương thức response hiện có cho từng UserEntity
                .toList();
    }
}
