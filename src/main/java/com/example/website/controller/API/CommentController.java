package com.example.website.controller.API;

import com.example.website.dto.CommentDTO;
import com.example.website.entity.CommentEntity;
import com.example.website.response.BaseResponse;
import com.example.website.service.impl.CommentServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<BaseResponse<List<CommentEntity>>> index() {
        return returnSuccess(commentServiceImpl.findAll());
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
            summary = "Lấy bình luận theo sách",
            description = "Trả về tất cả bình luận của một cuốn sách cụ thể",
            tags = {"Bình luận"}
    )
    @GetMapping("/book/{bookTitle}")
    public ResponseEntity<BaseResponse<List<CommentEntity>>> getCommentByBook(
            @PathVariable("bookTitle") String bookTitle) {
        return returnSuccess(commentServiceImpl.findAllByBook(bookTitle));
    }

    @Operation(
            summary = "Thêm bình luận mới",
            description = "Thêm bình luận mới cho một cuốn sách",
            tags = {"Bình luận"}
    )
    @PostMapping("/{bookTitle}")
    public ResponseEntity<BaseResponse<CommentEntity>> addComment(
            @PathVariable("bookTitle") String bookTitle,
            @RequestBody CommentDTO commentDTO) {
        return returnSuccess(commentServiceImpl.addComment(bookTitle, commentDTO));
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