package com.example.website.controller.API;

import com.example.website.dto.CategoryDTO;
import com.example.website.entity.CategoryEntity;
import com.example.website.response.BaseResponse;
import com.example.website.service.impl.CategoryServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/categories")
public class CategoryController extends BaseController {
    private final CategoryServiceImpl categoryServiceImpl;

    @Operation(
            summary = "Hiển thị tất cả thể loại",
            description = "Trả về danh sách tất cả thể loại sách trong hệ thống",
            tags = {"Thể loại"}
    )
    @GetMapping("")
    public ResponseEntity<BaseResponse<List<CategoryEntity>>> index() {
        return returnSuccess(categoryServiceImpl.findAll());
    }

    @Operation(
            summary = "Tìm thể loại theo ID",
            description = "Trả về thông tin chi tiết thể loại theo ID chỉ định",
            tags = {"Thể loại"}
    )
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<CategoryEntity>> getCategory(@PathVariable("id") Integer id) {
        return returnSuccess(categoryServiceImpl.getCategory(id));
    }

    @Operation(
            summary = "Thêm thể loại mới",
            description = "Thêm một thể loại sách mới vào hệ thống",
            tags = {"Thể loại"}
    )
    @PostMapping("/addCategory")
    public ResponseEntity<BaseResponse<CategoryEntity>> addCategory(@RequestBody CategoryDTO categoryDTO) {
        return returnSuccess(categoryServiceImpl.addCategory(categoryDTO));
    }

    @Operation(
            summary = "Cập nhật thể loại",
            description = "Thay đổi thông tin thể loại theo ID chỉ định",
            tags = {"Thể loại"}
    )
    @PutMapping("/editCategory/{id}")
    public ResponseEntity<BaseResponse<CategoryEntity>> editCategory(
            @PathVariable("id") Integer id,
            @RequestBody CategoryDTO categoryDTO) {
        return returnSuccess(categoryServiceImpl.updateCategory(id, categoryDTO));
    }

    @Operation(
            summary = "Xóa thể loại",
            description = "Xóa thể loại sách theo ID chỉ định",
            tags = {"Thể loại"}
    )
    @DeleteMapping("/deleteCategory/{id}")
    public ResponseEntity<BaseResponse<String>> deleteCategory(@PathVariable("id") Integer id) {
        categoryServiceImpl.deleteCategory(id);
        return returnSuccess("Xóa thể loại thành công");
    }
}