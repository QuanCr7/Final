package com.example.website.service;


import com.example.website.dto.CommentDTO;
import com.example.website.entity.CommentEntity;

import java.util.List;

public interface CommentService {
    List<CommentEntity> findAll();
    List<CommentEntity> findAllByBook(String name);

    CommentEntity getComment(int id);
    CommentEntity addComment(String bookTittle,CommentDTO commentDTO);
    CommentEntity updateComment(int id,CommentDTO commentDTO);
    void deleteComment(int id);
}
