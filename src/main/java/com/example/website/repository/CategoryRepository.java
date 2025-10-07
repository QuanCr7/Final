package com.example.website.repository;

import com.example.website.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer> {
    Boolean existsByName(String name);
    @Query("SELECT c FROM CategoryEntity c JOIN c.books b WHERE b.id = :bookId")
    List<CategoryEntity> findAllByBookId(Integer bookId);
    Optional<CategoryEntity> findByName(String name);

//    @Query("SELECT u FROM CategoryEntity u WHERE u.name LIKE %:name%")
    List<CategoryEntity> searchByNameLike(String name);
}
