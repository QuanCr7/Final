package com.example.website.controller.API;

import com.example.website.request.BookRequest;
import com.example.website.response.BaseResponse;
import com.example.website.response.BookResponse;
import com.example.website.response.PageBookResponse;
import com.example.website.service.impl.BookServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("")
public class BookController extends BaseController {
    private final BookServiceImpl bookServiceImpl;

    @Operation(
            summary = "Lấy tất cả sách",
            description = "Trả về danh sách tất cả sách trong hệ thống",
            tags = {"Sách"}
    )
    @GetMapping({"home", ""})
    public ResponseEntity<BaseResponse<PageBookResponse>> index(
            @RequestParam(defaultValue = "1") int page){
        return returnSuccess(bookServiceImpl.home(page));
    }

    @Operation(
            summary = "Tìm sách theo ID",
            description = "Trả về thông tin sách theo ID chỉ định",
            tags = {"Sách"}
    )
    @GetMapping("/book/searchId/{id}")
    public ResponseEntity<BaseResponse<BookResponse>> indexById(@PathVariable("id") int id) {
        return returnSuccess(bookServiceImpl.getBook(id));
    }

    @Operation(
            summary = "Thêm sách mới",
            description = "Thêm một cuốn sách mới vào hệ thống",
            tags = {"Sách"}
    )
    @PostMapping(value = "/book/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<BookResponse>> addBook(@ModelAttribute BookRequest bookRequest) {
        return returnSuccess(bookServiceImpl.createBook(bookRequest));
    }

    @Operation(
            summary = "Cập nhật thông tin sách",
            description = "Thay đổi thông tin của sách theo ID chỉ định",
            tags = {"Sách"}
    )
    @PutMapping(value = "/book/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse<BookResponse>> editBook(
            @PathVariable("id") int id,
            @ModelAttribute BookRequest bookRequest) {
        return returnSuccess(bookServiceImpl.updateBook(id, bookRequest));
    }

    @Operation(
            summary = "Xóa sách",
            description = "Xóa thông tin sách theo ID chỉ định",
            tags = {"Sách"}
    )
    @DeleteMapping("/book/delete/{id}")
    public ResponseEntity<BaseResponse<String>> deleteBook(@PathVariable("id") int id) {
        bookServiceImpl.deleteBook(id);
        return returnSuccess("Xóa sách thành công");
    }

    @Operation(
            summary = "Tìm sách theo điều kiện",
            description = "Trả về danh sách sách theo điều kiện",
            tags = {"Sách"}
    )
    @GetMapping("/book/search")
    public ResponseEntity<BaseResponse<PageBookResponse>> search(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) List<Integer> categoryIds,
            @RequestParam(defaultValue = "1") int page) {
        return returnSuccess(bookServiceImpl.findByCondition(page,title,author,categoryIds));
    }
}