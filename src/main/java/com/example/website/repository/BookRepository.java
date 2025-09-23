package com.example.website.repository;

import com.example.website.entity.BookEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<BookEntity, Integer> {
    Boolean existsByTitle(String title);
    Optional<BookEntity> findByTitle(String name);

//    @Query("SELECT b FROM BookEntity b WHERE b.author LIKE %:author%")
//    Page<BookEntity> searchByAuthor(Pageable pageable,String author);
//
//    @Query("SELECT b FROM BookEntity b WHERE b.title LIKE %:title%")
//    Page<BookEntity> searchByTitle(Pageable pageable,String title);

    @Query("SELECT b FROM BookEntity b")
    Page<BookEntity> findAll(Pageable pageable);

//    @Query("SELECT b FROM BookEntity b WHERE " +
//            "(:title IS NULL OR b.title LIKE %:title%) AND " +
//            "(:author IS NULL OR b.author LIKE %:author%) AND " +
//            "(:categoryIds IS NULL OR :categoryIds = '' OR " +
//            "   (SELECT COUNT(DISTINCT c.id) FROM b.categories c WHERE c.id IN :categoryIds) = SIZE(:categoryIds))")
//    Page<BookEntity> searchByCondition(Pageable pageable,
//                                       @Param("title") String title,
//                                       @Param("author") String author,
//                                       @Param("categoryIds") List<Integer> categoryIds);

    @Query("SELECT b FROM BookEntity b WHERE " +
            "(:title IS NULL OR b.title LIKE %:title%) AND " +
            "(:author IS NULL OR b.author LIKE %:author%) AND " +
            "(:categoryIds IS NULL OR " +
            "   (SELECT COUNT(c) FROM b.categories c WHERE c.id IN :categoryIds) = :categoryCount)")
    Page<BookEntity> searchByCondition(Pageable pageable,
                                       @Param("title") String title,
                                       @Param("author") String author,
                                       @Param("categoryIds") List<Integer> categoryIds,
                                       @Param("categoryCount") Long categoryCount);
}
