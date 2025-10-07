package com.example.website.controller.API;

import com.example.website.entity.CommentEntity;
import com.example.website.request.CommentRequest;
import com.example.website.response.BaseResponse;
import com.example.website.response.CommentResponse;
import com.example.website.response.PageCommentResponse;
import com.example.website.service.impl.CommentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/comment")
public class CommentController extends BaseController {
    private final CommentServiceImpl commentServiceImpl;

    @Operation(
            summary = "Lấy danh sách bình luận",
            description = "Trả về tất cả bình luận trong hệ thống",
            tags = {"Bình luận"}
    )
    @GetMapping("")
    public ResponseEntity<BaseResponse<PageCommentResponse>> index(
            @RequestParam(defaultValue = "1") int page) {
        return returnSuccess(commentServiceImpl.findAll(page));
    }

    @Operation(
            summary = "Lấy bình luận theo sách",
            description = "Trả về tất cả bình luận của một cuốn sách cụ thể",
            tags = {"Bình luận"}
    )
    @GetMapping("/book/{bookTitle}")
    public ResponseEntity<BaseResponse<PageCommentResponse>> getCommentByBook(
            @RequestParam(defaultValue = "1") int page,
            @PathVariable("bookTitle") String bookTitle) {
        return returnSuccess(commentServiceImpl.findAllByBook(page,bookTitle));
    }

    @Operation(
            summary = "Lấy bình luận theo ID",
            description = "Trả về thông tin chi tiết bình luận theo ID",
            tags = {"Bình luận"}
    )
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<CommentEntity>> getCommentById(@PathVariable("id") int id) {
        return returnSuccess(commentServiceImpl.getComment(id));
    }

    @Operation(
            summary = "Thêm bình luận mới",
            description = "Thêm bình luận mới cho một cuốn sách",
            tags = {"Bình luận"}
    )
    @PostMapping("")
    public ResponseEntity<BaseResponse<CommentResponse>> addComment(
            @RequestBody CommentRequest commentRequest) {
        return returnSuccess(commentServiceImpl.addComment(commentRequest));
    }

    @Operation(
            summary = "Xóa bình luận",
            description = "Xóa bình luận theo ID chỉ định",
            tags = {"Bình luận"}
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<BaseResponse<String>> delete(@PathVariable("id") int id) {
        commentServiceImpl.deleteComment(id);
        return returnSuccess("Xóa bình luận thành công");
    }
}