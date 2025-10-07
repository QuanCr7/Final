package com.example.website.repository;

import com.example.website.entity.BookEntity;
import com.example.website.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Integer> {
    Page<CommentEntity> findAllByBook(BookEntity book, Pageable pageable);
    Optional<CommentEntity> findById(int id);
}
