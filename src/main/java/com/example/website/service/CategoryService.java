package com.example.website.service;

import com.example.website.dto.CategoryDTO;
import com.example.website.entity.CategoryEntity;

import java.util.List;

public interface CategoryService {
    List<CategoryEntity> findAll();
    List<CategoryEntity> getByBook(int bookId);

    CategoryEntity getCategory(int id);
    CategoryEntity addCategory(CategoryDTO categoryDTO);
    CategoryEntity updateCategory(int id,CategoryDTO categoryDTO);
    void deleteCategory(int id);

    List<CategoryEntity> findCategoriesByUsername(String name);

}
