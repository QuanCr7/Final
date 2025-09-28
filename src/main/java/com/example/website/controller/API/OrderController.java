package com.example.website.controller.API;

import com.example.website.request.OrderRequest;
import com.example.website.response.BaseResponse;
import com.example.website.response.OrderResponse;
import com.example.website.service.impl.OrderServiceImpl;
import com.example.website.utils.OrderStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/order")
public class OrderController extends BaseController {
    private final OrderServiceImpl orderServiceImpl;

    @GetMapping("/detail/{id}")
    public ResponseEntity<BaseResponse<OrderResponse>> display(@PathVariable("id") Integer id) {
        return returnSuccess(orderServiceImpl.getById(id));
    }

    @PostMapping("/pay")
    public ResponseEntity<BaseResponse<OrderResponse>> create(@Valid @RequestBody OrderRequest request) {
        // Validate orderDetails
        if (request.getOrderDetails() == null || request.getOrderDetails().isEmpty()) {
            throw new IllegalArgumentException("Order details cannot be empty");
        }
        // Ensure status is PENDING for new orders
        if (request.getStatus() != null && request.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("New orders must have PENDING status");
        }
        OrderResponse orderResponse = orderServiceImpl.create(request, request.getOrderDetails());
        return returnSuccess(orderResponse);
    }
}
