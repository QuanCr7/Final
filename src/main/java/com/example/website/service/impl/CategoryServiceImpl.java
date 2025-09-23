package com.example.website.service.impl;

import com.example.website.dto.CategoryDTO;
import com.example.website.entity.CategoryEntity;
import com.example.website.repository.CategoryRepository;
import com.example.website.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryEntity> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    public CategoryEntity getCategory(int id) {
        return categoryRepository.findById(id).orElseThrow(()-> new RuntimeException("Category Not Found"));
    }

    @Override
    public CategoryEntity addCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new RuntimeException("Category Name Already Exists");
        }
        CategoryEntity category = CategoryEntity.builder()
                .name(categoryDTO.getName())
                .build();
        return categoryRepository.save(category);
    }

    @Override
    public CategoryEntity updateCategory(int id, CategoryDTO categoryDTO) {
        CategoryEntity category = getCategory(id);
        category.setName(categoryDTO.getName());
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(int id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<CategoryEntity> findCategoriesByUsername(String name) {
        return categoryRepository.searchByNameLike(name);
    }
}
