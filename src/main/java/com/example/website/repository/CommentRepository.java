package com.example.website.repository;

import com.example.website.entity.BookEntity;
import com.example.website.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Integer> {
    List<CommentEntity> findAllByBook(BookEntity book);
    Optional<CommentEntity> findById(int id);
}
