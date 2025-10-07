package com.example.website.service;


import com.example.website.entity.CommentEntity;
import com.example.website.request.CommentRequest;
import com.example.website.response.CommentResponse;
import com.example.website.response.PageCommentResponse;

public interface CommentService {
    PageCommentResponse findAll(Integer page);
    PageCommentResponse findAllByBook(Integer page,String name);

    CommentEntity getComment(int id);
    CommentResponse addComment(CommentRequest commentRequest);
    void deleteComment(int id);
}
