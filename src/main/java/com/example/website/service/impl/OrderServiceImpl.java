package com.example.website.service.impl;

import com.example.website.configuration.CustomUserDetails;
import com.example.website.entity.OrderDetailEntity;
import com.example.website.entity.OrderEntity;
import com.example.website.entity.UserEntity;
import com.example.website.repository.OrderDetailRepository;
import com.example.website.repository.OrderRepository;
import com.example.website.repository.UserRepository;
import com.example.website.request.OrderDetailRequest;
import com.example.website.request.OrderRequest;
import com.example.website.response.OrderDetailResponse;
import com.example.website.response.OrderResponse;
import com.example.website.response.PageOrderResponse;
import com.example.website.service.OrderDetailService;
import com.example.website.service.OrderService;
import com.example.website.utils.OrderStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderDetailService orderDetailService;
    private final OrderDetailRepository orderDetailRepository;

    private static final int size = 10;

    @Override
    public PageOrderResponse findAll(Integer page) {
        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<OrderEntity> orderEntities = orderRepository.findAll(pageable);
        Page<OrderResponse> responsePage = orderEntities.map(this::response);

        return PageOrderResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .orders(responsePage.getContent())
                .build();
    }

    @Override
    public OrderResponse getById(int id) {
        return response(orderRepository.findById(id).orElseThrow(()-> new RuntimeException("Order Not Found")));
    }

    @Override
    public PageOrderResponse getAllOrdersByUserId(Integer page) {

        // Lấy userId từ SecurityContext
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Integer userId = userDetails.getId();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }

        int pageNumber = (page == null) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, size);

        Page<OrderEntity> orderEntities = orderRepository.findByUserId(userId, pageable);
        Page<OrderResponse> responsePage = orderEntities.map(this::response);

        return PageOrderResponse.builder()
                .currentPage(pageNumber + 1)
                .pageSize(responsePage.getSize())
                .totalPages(responsePage.getTotalPages())
                .totalElements(responsePage.getTotalElements())
                .orders(responsePage.getContent())
                .build();
    }

    @Override
    public OrderResponse create(OrderRequest request, List<OrderDetailRequest> orderDetailRequests) {

        // Lấy userId từ SecurityContext
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Integer userId = userDetails.getId();
        if (userId == null) {
            log.error("User not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        OrderEntity order = OrderEntity.builder()
                .orderDate(LocalDateTime.now())
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .totalAmount(request.getTotalAmount())
                .shippingAddress(request.getShippingAddress())
                .status(OrderStatus.PENDING)
                .user(user)
                .build();
        order = orderRepository.save(order);

        // Add order details using OrderDetailService
        List<OrderDetailEntity> orderDetails = new ArrayList<>();
        for (OrderDetailRequest detailRequest : orderDetailRequests) {
            // Update orderId in OrderDetailRequest to match the new order
            OrderDetailRequest updatedDetailRequest = OrderDetailRequest.builder()
                    .orderId(order.getId())
                    .bookId(detailRequest.getBookId())
                    .quantity(detailRequest.getQuantity())
                    .price(detailRequest.getPrice())
                    .build();
            // Call add method from OrderDetailService
            List<OrderDetailResponse> detailResponses = orderDetailService.add(updatedDetailRequest);
            // Convert responses back to entities for setting in OrderEntity
            OrderDetailEntity detailEntity = orderDetailRepository.findById(detailResponses.getFirst().getId())
                    .orElseThrow(() -> new RuntimeException("Failed to retrieve added order detail"));
            orderDetails.add(detailEntity);
        }

        // Gán orderDetails và lưu lại
        order.setOrderDetails(orderDetails);
        orderRepository.save(order);

        return response(order);
    }

//    @Override
//    public OrderEntity process(int id) {
//        OrderEntity order = getById(id);
////        order.setStatus("PROCESSING");
//        order.setStatus(OrderStatus.PROCESSING);
//        return orderRepository.save(order);
//    }
//
//    @Override
//    public OrderEntity cancel(int id) {
//        OrderEntity order = getById(id);
//        order.setStatus(OrderStatus.CANCELLED);
//        return orderRepository.save(order);
//    }

    public OrderResponse response(OrderEntity order) {
        return OrderResponse.builder()
                .id(order.getId())
                .shippingAddress(order.getShippingAddress())
                .orderDate(order.getOrderDate())
                .name(order.getName())
                .email(order.getEmail())
                .phone(order.getPhone())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .userId(order.getUser().getId())
                .orderDetails(orderDetailService.getOrderDetailByOrderId(order.getId()))
                .build();
    }
}
